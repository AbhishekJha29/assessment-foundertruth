/**
 * Centralized Error Handling Middleware
 * Ensures consistent JSON error responses across all API endpoints.
 * Sanitizes error outputs and hides stack traces in production environments.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 1. Mongoose Bad ObjectId (CastError) -> 400 Bad Request
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: '${err.value}'`;
  }

  // 2. Mongoose Duplicate Key Error (code 11000) -> 409 Conflict
  if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyValue || {});
    if (keys.includes('userId') && keys.includes('contentId')) {
      message = 'You have already bookmarked this content';
    } else if (keys.includes('email')) {
      message = 'An account with this email already exists';
    } else {
      const field = keys[0] || 'field';
      message = `Duplicate value entered for '${field}'. Please use another value.`;
    }
  }

  // 3. Mongoose Schema Validation Error -> 400 Bad Request
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
  }

  // 4. JWT Authentication Errors -> 401 Unauthorized
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // Standardized JSON response format
  const responsePayload = {
    success: false,
    message
  };

  // Only attach stack trace in non-production environments
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
