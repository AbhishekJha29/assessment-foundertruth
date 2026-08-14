const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables before importing app
dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP listener for local development
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[Server] Content Feed API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] Health check available at: http://localhost:${PORT}/api/v1/health`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error(`[Server Error] Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`[Server Boot Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Only listen on a port when running locally (NOT on Vercel)
if (!process.env.VERCEL) {
  startServer();
}

// Export the Express app for Vercel's serverless runtime
module.exports = app;
