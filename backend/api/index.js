const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('[Vercel Serverless Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured and 0.0.0.0/0 is whitelisted in MongoDB Atlas.',
      error: error.message
    });
  }
};
