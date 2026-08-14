/**
 * Global wrapper for async express handlers to eliminate repetitive try-catch blocks
 * and prevent unhandled promise rejections.
 * @param {Function} fn - Async controller / middleware function
 * @returns {Function} Express middleware handler
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
