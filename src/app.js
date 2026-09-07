const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./utils/logger');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (config.nodeEnv === 'production') {
        return callback(new Error('Blocked by CORS policy: Origin not allowed'));
      }
      return callback(null, true); // Dev flexible origin
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (Morgan)
if (config.nodeEnv !== 'test') {
  app.use(requestLogger);
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Static upload files serving
app.use('/uploads', express.static(require('path').join(process.cwd(), 'uploads')));

// Mount API routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CareerPilot Smart Hiring & Career Development Backend API',
    documentation: '/api/health',
    version: '1.0.0'
  });
});

// 404 Route Not Found
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
