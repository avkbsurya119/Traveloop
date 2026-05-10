import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './db.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const googleId = profile.id;

      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId }
      });

      if (user) {
        return done(null, user);
      }

      // Check if user exists with this email
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: user.authProvider === 'local' ? 'local+google' : user.authProvider,
            avatarUrl: user.avatarUrl || profile.photos?.[0]?.value
          }
        });
        return done(null, user);
      }

      // Create new user
      const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
      const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';

      user = await prisma.user.create({
        data: {
          email,
          googleId,
          firstName,
          lastName,
          avatarUrl: profile.photos?.[0]?.value,
          authProvider: 'google',
          isActive: true
        }
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
