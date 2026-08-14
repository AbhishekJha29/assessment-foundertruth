const feedService = require('../services/feedService');
const catchAsync = require('../utils/catchAsync');

/**
 * Controller to fetch paginated content feed
 * GET /api/v1/feed
 */
const getFeedController = catchAsync(async (req, res) => {
  const { page, limit, sort, source, search } = req.query;

  const result = await feedService.getFeed({
    page,
    limit,
    sort,
    source,
    search
  });

  return res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
});

/**
 * Controller to fetch a single content item by ID
 * GET /api/v1/feed/:id
 */
const getFeedItemController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await feedService.getContentById(id);

  return res.status(200).json({
    success: true,
    data: item
  });
});

module.exports = {
  getFeedController,
  getFeedItemController
};
