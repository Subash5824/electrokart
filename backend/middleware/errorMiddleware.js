const config = require('../config/config');

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: config.nodeEnv === 'production' ? null : err.stack,
    error: {
      name: err.name,
      ...(config.nodeEnv === 'development' && { details: err.toString() })
    }
  });
};

// Validation error handler
const validationError = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  next(err);
};

// Duplicate key error handler
const duplicateKeyError = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      field
    });
  }
  next(err);
};

// Cast error handler (invalid ObjectId)
const castError = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next(err);
};

module.exports = {
  notFound,
  errorHandler,
  validationError,
  duplicateKeyError,
  castError
};