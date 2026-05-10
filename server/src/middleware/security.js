import { rateLimit } from 'express-rate-limit';

// Strict rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for sensitive operations
export const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests for this operation.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many uploads, please wait.' },
  standardHeaders: true,
  legacyHeaders: false
});

// XSS sanitization middleware
export function sanitizeInput(req, res, next) {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Only sanitize specific content types
  if (req.body && typeof req.body === 'object') {
    // Skip sanitization for fields that need raw HTML
    const skipFields = ['content', 'description', 'notes', 'bio'];
    const sanitizedBody = {};
    for (const key in req.body) {
      if (skipFields.includes(key)) {
        sanitizedBody[key] = req.body[key];
      } else {
        sanitizedBody[key] = sanitize(req.body[key]);
      }
    }
    req.body = sanitizedBody;
  }

  next();
}

// HPP (HTTP Parameter Pollution) prevention
export function preventParamPollution(req, res, next) {
  // Convert array params to last value only for sensitive operations
  const allowedDuplicates = ['tags', 'categories', 'ids'];

  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key]) && !allowedDuplicates.includes(key)) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }

  next();
}

// Enhanced CORS configuration
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400 // 24 hours
};

// Enhanced helmet configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.exchangerate-api.com', 'wss:', 'ws:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
};
