const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../lib/auth');
const AppError = require('../lib/AppError');

/**
 * Service to handle new user registration
 * @param {Object} userData - { username, email, password }
 * @returns {Promise<{ user: Object, token: string }>}
 */
const register = async ({ username, email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const assignedUsername = username ? username.trim() : normalizedEmail.split('@')[0];

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Hash password with 10 salt rounds
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    username: assignedUsername,
    email: normalizedEmail,
    password: hashedPassword
  });

  // Generate authentication token
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
  if (!email || !password) {
    throw new AppError('Please provide both email and password', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email and explicitly include password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
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
