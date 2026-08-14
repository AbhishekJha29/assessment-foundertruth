const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  })
);

// Development request logging (disabled in production and test)
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
