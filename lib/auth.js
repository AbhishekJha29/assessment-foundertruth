const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('../models/User');
const AppError = require('./AppError');

/**
 * Generates a signed JWT token containing userId.
 * @param {string|import('mongoose').Types.ObjectId} userId - User's MongoDB ID
 * @returns {string} - Signed JWT string
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.');
  }

  return jwt.sign(
    { userId: userId.toString() },
    secret,
    { expiresIn }
  );
};

/**
 * Verifies JWT from the Authorization header of a Next.js Request / NextRequest.
 * Attaches and returns the authenticated User document.
 * 
 * @param {Request} req - Incoming Next.js API request
 * @returns {Promise<Object>} Authenticated user document
 * @throws {AppError} 401 Unauthorized on missing, invalid, or expired tokens
 */
const verifyAuth = async (req) => {
  await connectDB();

  let token;
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Authentication required. Please provide a valid Bearer token.', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Authentication token has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid authentication token.', 401);
  }

  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  return currentUser;
};

module.exports = {
  generateToken,
  verifyAuth
};
