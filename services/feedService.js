const mongoose = require('mongoose');
const Content = require('../models/Content');
const AppError = require('../lib/AppError');

/**
 * Sorting strategies
 */
const SORT_OPTIONS = {
  latest: { publishedAt: -1 },
  oldest: { publishedAt: 1 }
};

/**
 * Fetch paginated content items with sorting and metadata
 * @param {Object} options - { page, limit, sort, source, search }
 * @returns {Promise<{ items: Array, pagination: Object }>}
 */
const getFeed = async ({ page = 1, limit = 20, sort = 'latest', source, search }) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  // Build dynamic filter query
  const query = {};

  if (source) {
    query.source = source;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const sortCriteria = SORT_OPTIONS[sort] || SORT_OPTIONS.latest;

  const [items, totalItems] = await Promise.all([
    Content.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Content.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalItems / parsedLimit) || 1;

  const formattedItems = items.map((item) => ({
    id: item._id.toString(),
    title: item.title,
    description: item.description,
    source: item.source,
    url: item.url,
    image: item.image,
    publishedAt: item.publishedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  return {
    items: formattedItems,
    pagination: {
      totalItems,
      totalPages,
      currentPage: parsedPage,
      limit: parsedLimit,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

/**
 * Fetch a single content item by its MongoDB ObjectId
 * @param {string} id - Content item ID
 * @returns {Promise<Object>}
 */
const getContentById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid content ID format: '${id}'`, 400);
  }

  const item = await Content.findById(id);

  if (!item) {
    throw new AppError(`Content item with ID '${id}' not found`, 404);
  }

  return item.toJSON();
};

module.exports = {
  getFeed,
  getContentById
};
