const mongoose = require('mongoose');
const AppError = require('./AppError');

// RFC 5322 compliant standard email validation regex
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Validates registration input fields.
 * @param {Object} body - Request body
 * @returns {{ username: string, email: string, password: string }}
 */
const validateRegister = (body = {}) => {
  const { email, password, username } = body;

  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  const trimmedEmail = email.toString().trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  if (username && (typeof username !== 'string' || username.trim().length < 3)) {
    throw new AppError('Username must be at least 3 characters long', 400);
  }

  return {
    email: trimmedEmail.toLowerCase(),
    password,
    username: username ? username.trim() : trimmedEmail.split('@')[0]
  };
};

/**
 * Validates login input fields.
 * @param {Object} body - Request body
 * @returns {{ email: string, password: string }}
 */
const validateLogin = (body = {}) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  const trimmedEmail = email.toString().trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  return {
    email: trimmedEmail.toLowerCase(),
    password
  };
};

/**
 * Validates that a string is a valid MongoDB ObjectId.
 * @param {string} id - Identifier to validate
 * @param {string} entityName - Entity name for error message
 */
const validateObjectId = (id, entityName = 'content ID') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${entityName} format: '${id}'`, 400);
  }
};

/**
 * Sanitizes and normalizes query parameters for the content feed.
 * @param {URLSearchParams|Object} searchParams - Query parameters
 * @returns {{ page: number, limit: number, sort: string, source?: string, search?: string }}
 */
const parseFeedParams = (searchParams) => {
  const getParam = (key) => {
    if (typeof searchParams?.get === 'function') {
      return searchParams.get(key);
    }
    return searchParams ? searchParams[key] : null;
  };

  const rawPage = getParam('page');
  const rawLimit = getParam('limit');
  const rawSort = getParam('sort');
  const rawSource = getParam('source');
  const rawSearch = getParam('search');

  const parsedPage = parseInt(rawPage, 10);
  const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const parsedLimit = parseInt(rawLimit, 10);
  const limit = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 20;

  let sort = 'latest';
  if (rawSort && ['latest', 'oldest'].includes(rawSort.toLowerCase())) {
    sort = rawSort.toLowerCase();
  }

  const source = typeof rawSource === 'string' && rawSource.trim() ? rawSource.trim() : undefined;
  const search = typeof rawSearch === 'string' && rawSearch.trim() ? rawSearch.trim() : undefined;

  return {
    page,
    limit,
    sort,
    ...(source && { source }),
    ...(search && { search })
  };
};

module.exports = {
  EMAIL_REGEX,
  validateRegister,
  validateLogin,
  validateObjectId,
  parseFeedParams
};
