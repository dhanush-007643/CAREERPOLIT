const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const apiLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: config.rateLimit.windowMs || 15 * 60 * 1000,
      max: isDev ? 20000 : (config.rateLimit.max || 2000),
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
      handler: (req, res) => {
        return ApiResponse.error(
          res,
          'Too many requests from this IP, please try again after 15 minutes',
          'RATE_LIMIT_EXCEEDED',
          429
        );
      }
    });

const authLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 1000 : 100, // relaxed threshold for auth
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
      handler: (req, res) => {
        return ApiResponse.error(
          res,
          'Too many authentication attempts, please try again later',
          'AUTH_RATE_LIMIT_EXCEEDED',
          429
        );
      }
    });

module.exports = { apiLimiter, authLimiter };
