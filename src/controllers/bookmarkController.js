const bookmarkService = require('../services/bookmarkService');
const catchAsync = require('../utils/catchAsync');

/**
 * Controller to bookmark a content item for authenticated user
 * POST /api/v1/feed/:id/bookmark
 */
const addBookmarkController = catchAsync(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { id: contentId } = req.params;

  const bookmark = await bookmarkService.addBookmark(userId, contentId);

  return res.status(201).json({
    success: true,
    message: 'Bookmark added successfully',
    data: bookmark
  });
});

/**
 * Controller to remove a bookmark for authenticated user
 * DELETE /api/v1/feed/:id/bookmark
 */
const removeBookmarkController = catchAsync(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { id: contentId } = req.params;

  const result = await bookmarkService.removeBookmark(userId, contentId);

  return res.status(200).json({
    success: true,
    message: result.message || 'Bookmark removed successfully'
  });
});

/**
 * Controller to fetch all bookmarks for authenticated user
 * GET /api/v1/bookmarks
 */
const getBookmarksController = catchAsync(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const bookmarks = await bookmarkService.getUserBookmarks(userId);

  return res.status(200).json({
    success: true,
    count: bookmarks.length,
    data: bookmarks
  });
});

module.exports = {
  addBookmarkController,
  removeBookmarkController,
  getBookmarksController
};
