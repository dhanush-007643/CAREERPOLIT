const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

const isTest = process.env.NODE_ENV === 'test';

const apiLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
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
      max: 30, // 30 login/register attempts per 15 min
      standardHeaders: true,
      legacyHeaders: false,
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
