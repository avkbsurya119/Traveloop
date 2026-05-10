import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import {
  checkLoginStatus,
  verifyCaptcha,
  recordFailedAttempt,
  clearAttempts,
} from '../utils/loginLimiter.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email.js';
import { rateLimit } from 'express-rate-limit';
import passport from '../config/passport.js';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validators.js';

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many auth requests, please try again later.' }
});

const loginLimiterMw = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Too many registration attempts, please try again later.' }
});

const router = Router();

// In-memory password-reset store
const resetCodes = new Map();
const RESET_CODE_EXPIRY_MS = 15 * 60 * 1000;

function generateResetCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── Check email uniqueness ──────────────────────────────────────────────────
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  res.json({ available: !existing });
});

// ─── Register ────────────────────────────────────────────────────────────────
router.post('/register', registerLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, city, country, bio } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, city, country, bio },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatarUrl: true }
    });

    const tokens = generateTokens(user.id);

    // Send welcome email (fire and forget)
    sendWelcomeEmail(email, firstName).catch(() => {});

    res.status(201).json({ user, ...tokens });
  } catch (error) { next(error); }
});

// ─── Pre-login check ─────────────────────────────────────────────────────────
router.post('/login/check', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const status = checkLoginStatus(email);
  res.json(status);
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post('/login', loginLimiterMw, async (req, res, next) => {
  try {
    const { email, password, captchaAnswer } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const status = checkLoginStatus(email);
    if (status.locked) {
      return res.status(429).json({
        error: `Account temporarily locked. Try again in ${Math.ceil(status.remaining / 60)} minute(s).`,
        locked: true, remaining: status.remaining,
      });
    }

    if (status.requiresCaptcha) {
      if (!captchaAnswer) {
        return res.status(400).json({
          error: 'Please solve the CAPTCHA to continue.',
          requiresCaptcha: true, captchaQuestion: status.captchaQuestion,
        });
      }
      if (!verifyCaptcha(email, captchaAnswer)) {
        const afterFail = recordFailedAttempt(email);
        return res.status(400).json({ error: 'Incorrect CAPTCHA answer.', ...afterFail });
      }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true, passwordHash: true, role: true, avatarUrl: true, isActive: true }
    });

    if (!user || !user.isActive) {
      const afterFail = recordFailedAttempt(email);
      return res.status(401).json({ error: 'Invalid credentials', ...afterFail });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const afterFail = recordFailedAttempt(email);
      return res.status(401).json({ error: 'Invalid credentials', ...afterFail });
    }

    clearAttempts(email);
    const tokens = generateTokens(user.id);
    const { passwordHash, ...userData } = user;
    res.json({ user: userData, ...tokens });
  } catch (error) { next(error); }
});

// ─── Forgot Password ─────────────────────────────────────────────────────────
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const successMsg = { message: 'If that email is registered, you will receive a reset code shortly.' };
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, isActive: true } });
    if (!user || !user.isActive) return res.json(successMsg);
    const code = generateResetCode();
    resetCodes.set(email.toLowerCase(), { code, expiresAt: Date.now() + RESET_CODE_EXPIRY_MS });
    await sendPasswordResetEmail(email, code);
    res.json(successMsg);
  } catch (error) { next(error); }
});

router.post('/forgot-password/verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });
  const record = resetCodes.get(email.toLowerCase());
  if (!record || record.code !== code || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  res.json({ valid: true });
});

router.post('/forgot-password/reset', async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, code, and new password are required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const record = resetCodes.get(email.toLowerCase());
    if (!record || record.code !== code || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    resetCodes.delete(email.toLowerCase());
    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) { next(error); }
});

// ─── Refresh token ───────────────────────────────────────────────────────────
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, isActive: true } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid token' });
    const tokens = generateTokens(user.id);
    res.json(tokens);
  } catch (error) { return res.status(401).json({ error: 'Invalid refresh token' }); }
});

// ─── Get current user ────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, city: true, country: true, bio: true, avatarUrl: true, role: true, isPublicProfile: true, createdAt: true }
    });
    res.json(user);
  } catch (error) { next(error); }
});

// ─── Logout ──────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => { res.json({ message: 'Logged out' }); });

// ─── Google OAuth ────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
}), (req, res) => {
  const tokens = generateTokens(req.user.id);
  const redirectUrl = new URL('/auth/callback', process.env.FRONTEND_URL || 'http://localhost:5173');
  redirectUrl.searchParams.set('accessToken', tokens.accessToken);
  redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
  res.redirect(redirectUrl.toString());
});

export default router;
