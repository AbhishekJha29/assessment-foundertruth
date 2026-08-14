const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token containing userId.
 * @param {string|mongoose.Types.ObjectId} userId - User's MongoDB ID
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

module.exports = generateToken;
