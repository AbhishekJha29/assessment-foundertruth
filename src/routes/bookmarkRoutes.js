const express = require('express');
const {
  addBookmarkController,
  removeBookmarkController,
  getBookmarksController
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');

const router = express.Router({ mergeParams: true });

// Require authentication for all bookmark endpoints
router.use(protect);

// GET /api/v1/bookmarks (when mounted at /api/v1/bookmarks)
router.get('/', getBookmarksController);

// POST & DELETE /api/v1/feed/:id/bookmark (when mounted at /api/v1/feed/:id/bookmark)
router.post('/', validateObjectId, addBookmarkController);
router.delete('/', validateObjectId, removeBookmarkController);

module.exports = router;
