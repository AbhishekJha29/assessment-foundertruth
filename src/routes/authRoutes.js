const express = require('express');
const {
  registerController,
  loginController
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', validateRegister, registerController);
router.post('/login', validateLogin, loginController);

module.exports = router;
