const bcrypt = require('bcryptjs');

/**
 * Hashes a plaintext password with a salt.
 * @param {string} password - Plaintext password to hash
 * @returns {Promise<string>} - The hashed password string
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plaintext password with a hashed password.
 * @param {string} candidatePassword - Plaintext candidate password
 * @param {string} hashedPassword - Stored hash from database
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
