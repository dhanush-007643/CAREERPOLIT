const ApiResponse = require('../utils/apiResponse');
const { AppError } = require('../utils/customErrors');
const { logger } = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
    errorCode = 'INVALID_ID_FORMAT';
  }

  // Handle Mongoose Duplicate Key error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A resource with that ${field} already exists`;
    errorCode = 'DUPLICATE_RESOURCE';
    details = err.keyValue;
  }

  // Handle Mongoose Schema Validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422;
    message = 'Validation failed for one or more fields';
    errorCode = 'SCHEMA_VALIDATION_ERROR';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errorCode = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Handle Multer File size / type errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
    errorCode = 'FILE_UPLOAD_ERROR';
  }

  if (statusCode === 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, {
      message: err.message,
      stack: err.stack
    });
  }

  return ApiResponse.error(res, message, errorCode, statusCode, details);
};

const notFoundHandler = (req, res) => {
  return ApiResponse.error(
    res,
    `Cannot find route: ${req.method} ${req.originalUrl}`,
    'ROUTE_NOT_FOUND',
    404
  );
};

module.exports = { errorHandler, notFoundHandler };
