/**
 * Consistent error response format:
 * {
 *   error: string,           // Human-readable error message
 *   code?: string,           // Error code for programmatic handling
 *   details?: Array<{        // Field-level errors for validation
 *     field: string,
 *     message: string
 *   }>,
 *   stack?: string           // Stack trace (dev only)
 * }
 */

export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Express-validator errors
  if (err.name === 'ValidationError' || err.array) {
    const errors = err.array ? err.array() : [{ msg: err.message }];
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.map(e => ({
        field: e.path || e.param || 'unknown',
        message: e.msg || e.message
      }))
    });
  }

  // JWT/Auth errors
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({
      error: `A record with this ${field} already exists`,
      code: 'DUPLICATE_ENTRY',
      details: [{ field, message: 'Must be unique' }]
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'The requested resource was not found',
      code: 'NOT_FOUND'
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Invalid reference - related record not found',
      code: 'INVALID_REFERENCE'
    });
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field',
      code: 'INVALID_FILE_FIELD'
    });
  }

  // Rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED'
    });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Cross-origin request blocked',
      code: 'CORS_ERROR'
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code || 'APPLICATION_ERROR'
    });
  }

  // Default server error
  const response = {
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    code: 'INTERNAL_ERROR'
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
};

// Custom error class for application errors
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APPLICATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

// Common error factories
export const errors = {
  notFound: (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  unauthorized: (message = 'Authentication required') => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = 'Access denied') => new AppError(message, 403, 'FORBIDDEN'),
  badRequest: (message = 'Invalid request') => new AppError(message, 400, 'BAD_REQUEST'),
  conflict: (message = 'Resource already exists') => new AppError(message, 409, 'CONFLICT'),
  validation: (details) => {
    const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    err.details = details;
    return err;
  }
};
