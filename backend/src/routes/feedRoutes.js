const express = require('express');
const {
  getFeedController,
  getFeedItemController
} = require('../controllers/feedController');
const {
  validateFeedParams,
  validateObjectId
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Public Feed Endpoints (No authentication required)
router.get('/', validateFeedParams, getFeedController);
router.get('/:id', validateObjectId, getFeedItemController);

module.exports = router;
