const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

/**
 * Controller to handle user registration
 * POST /api/v1/auth/register
 */
const registerController = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;
  const result = await authService.register({ username, email, password });

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

/**
 * Controller to handle user login
 * POST /api/v1/auth/login
 */
const loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

module.exports = {
  registerController,
  loginController
};
