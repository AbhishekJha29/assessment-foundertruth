import { NextResponse } from 'next/server';

/**
 * Centralized API Error Handler for Next.js Route Handlers.
 * Ensures consistent JSON response shapes and accurate HTTP status codes.
 *
 * @param {Error|Object} err - Error caught in route handler try/catch block
 * @returns {NextResponse} Standardized error JSON response
 */
export function handleApiError(err) {
  let statusCode = err.statusCode || (typeof err.status === 'number' ? err.status : 500);
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
    const messages = Object.values(err.errors || {}).map((val) => val.message);
    message = messages.length > 0 ? messages.join(', ') : err.message;
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

  // Standardized JSON response payload
  const responsePayload = {
    success: false,
    message
  };

  // Attach stack trace only in non-production environments for internal errors
  if (process.env.NODE_ENV !== 'production' && err.stack && statusCode === 500) {
    responsePayload.stack = err.stack;
  }

  return NextResponse.json(responsePayload, { status: statusCode });
}
