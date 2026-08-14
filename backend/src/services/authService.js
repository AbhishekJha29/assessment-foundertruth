const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');

/**
 * Service to handle new user registration
 * @param {Object} userData - { username, email, password }
 * @returns {Promise<{ user: Object, token: string }>}
 */
const register = async ({ username, email, password }) => {
  // 1. Validation checks
  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  // Derive default username from email prefix if not explicitly provided
  const normalizedEmail = email.toLowerCase().trim();
  const assignedUsername = username ? username.trim() : normalizedEmail.split('@')[0];

  // 2. Check if user already exists with this email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Create user in database
  const newUser = await User.create({
    username: assignedUsername,
    email: normalizedEmail,
    password: hashedPassword
  });

  // 5. Generate authentication token
  const token = generateToken(newUser._id);

  return {
    user: newUser.toJSON(),
    token
  };
};

/**
 * Service to handle user login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ user: Object, token: string }>}
 */
const login = async ({ email, password }) => {
  // 1. Validation checks
  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 2. Find user by email and explicitly include password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // 3. Compare passwords
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // 4. Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token
  };
};

module.exports = {
  register,
  login
};
