const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const Content = require('../models/Content');
const AppError = require('../lib/AppError');

/**
 * Add a bookmark for a specific content item by the authenticated user.
 * @param {string} userId - Authenticated user's ID
 * @param {string} contentId - Content item ID to bookmark
 * @returns {Promise<Object>} Created bookmark object
 */
const addBookmark = async (userId, contentId) => {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new AppError(`Invalid content ID format: '${contentId}'`, 400);
  }

  // Validate content item exists
  const content = await Content.findById(contentId);
  if (!content) {
    throw new AppError(`Content item with ID '${contentId}' not found`, 404);
  }

  // Check for duplicate bookmark
  const existingBookmark = await Bookmark.findOne({ userId, contentId });
  if (existingBookmark) {
    throw new AppError('You have already bookmarked this content', 409);
  }

  const bookmark = await Bookmark.create({
    userId,
    contentId
  });

  return bookmark.toJSON();
};

/**
 * Remove a bookmark for a specific content item scoped strictly to the authenticated user.
 * @param {string} userId - Authenticated user's ID
 * @param {string} contentId - Content item ID to unbookmark
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const removeBookmark = async (userId, contentId) => {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new AppError(`Invalid content ID format: '${contentId}'`, 400);
  }

  const deletedBookmark = await Bookmark.findOneAndDelete({
    userId,
    contentId
  });

  if (!deletedBookmark) {
    throw new AppError('Bookmark not found for this user and content', 404);
  }

  return {
    success: true,
    message: 'Bookmark removed successfully'
  };
};

/**
 * Fetch all bookmarks for the authenticated user, populated with Content details.
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<Array>} List of user bookmarks populated with content
 */
const getUserBookmarks = async (userId) => {
  const bookmarks = await Bookmark.find({ userId })
    .populate({
      path: 'contentId',
      select: 'title description source url image publishedAt createdAt updatedAt'
    })
    .sort({ createdAt: -1 })
    .lean();

  return bookmarks
    .filter((bm) => bm.contentId != null)
    .map((bm) => ({
      id: bm._id.toString(),
      userId: bm.userId.toString(),
      contentId: bm.contentId._id ? bm.contentId._id.toString() : bm.contentId.toString(),
      content: {
        id: bm.contentId._id ? bm.contentId._id.toString() : bm.contentId.toString(),
        title: bm.contentId.title,
        description: bm.contentId.description,
        source: bm.contentId.source,
        url: bm.contentId.url,
        image: bm.contentId.image,
        publishedAt: bm.contentId.publishedAt,
        createdAt: bm.contentId.createdAt,
        updatedAt: bm.contentId.updatedAt
      },
      createdAt: bm.createdAt,
      updatedAt: bm.updatedAt
    }));
};

module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks
};
