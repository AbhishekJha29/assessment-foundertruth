const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Security HTTP headers
app.use(helmet());

// Flexible CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health checks)
      if (!origin) return callback(null, true);

      // Wildcard or explicit match
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Automatically permit all *.vercel.app preview and production URLs
      if (origin.endsWith('.vercel.app') || origin.startsWith('http://localhost')) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Auto-connect MongoDB middleware (essential for Vercel serverless functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Connection Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please verify MONGODB_URI and ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas.',
      error: err.message
    });
  }
});

// Development request logging (disabled in production and test)
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome / health route for quick sanity check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FounderTruth Backend API is live on Vercel.',
    healthCheck: '/api/v1/health'
  });
});

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/feed/:id/bookmark', bookmarkRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);

// Catch-all 404 handler for unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Endpoint ${req.method} ${req.originalUrl} not found on this server`, 404));
});

// Central Error Handler Middleware
app.use(errorHandler);

module.exports = app;
