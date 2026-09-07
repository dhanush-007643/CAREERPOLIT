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
const normalizeUrl = (url) => (url ? url.replace(/\/+$/, '') : '');
const clientUrlClean = normalizeUrl(config.clientUrl);

const allowedOrigins = [
  clientUrlClean,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = normalizeUrl(origin);

      // Check explicit allowed list
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // Automatically allow Vercel, Netlify, and Render deploy URLs
      if (
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.netlify.app') ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      if (config.nodeEnv !== 'production') {
        return callback(null, true);
      }

      return callback(null, true); // Allow origin with credentials
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
