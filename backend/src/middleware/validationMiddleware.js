const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

// RFC 5322 standard email validation regex
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Validates user registration payload.
 * Enforces email format, password minimum length, and non-empty required fields.
 */
const validateRegister = (req, res, next) => {
  const { email, password, username } = req.body || {};

  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
  }

  const trimmedEmail = email.toString().trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (typeof password !== 'string' || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  if (username && (typeof username !== 'string' || username.trim().length < 3)) {
    return next(new AppError('Username must be at least 3 characters long', 400));
  }

  req.body.email = trimmedEmail.toLowerCase();
  if (username) req.body.username = username.trim();

  next();
};

/**
 * Validates user login payload.
 * Ensures both email and password are provided and well-formed.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
  }

  const trimmedEmail = email.toString().trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  req.body.email = trimmedEmail.toLowerCase();
  next();
};

/**
 * Sanitizes and validates feed query parameters.
 * Falls back safely to defaults for malformed or negative inputs instead of crashing.
 */
const validateFeedParams = (req, res, next) => {
  const { page, limit, sort, source, search } = req.query;

  // Normalize page (must be a positive integer, fallback to 1)
  const parsedPage = parseInt(page, 10);
  req.query.page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Normalize limit (must be a positive integer between 1 and 100, fallback to 20)
  const parsedLimit = parseInt(limit, 10);
  req.query.limit = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 20;

  // Normalize sort criteria
  if (sort && !['latest', 'oldest'].includes(sort.toLowerCase())) {
    req.query.sort = 'latest';
  }

  // Trim string queries
  if (typeof source === 'string') req.query.source = source.trim();
  if (typeof search === 'string') req.query.search = search.trim();

  next();
};

/**
 * Validates that :id route parameter is a valid MongoDB ObjectId before querying DB.
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`Invalid content ID format: '${id}'`, 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateFeedParams,
  validateObjectId
};
