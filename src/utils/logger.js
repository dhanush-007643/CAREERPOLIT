const morgan = require('morgan');

const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

const logger = {
  info: (msg, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, Object.keys(meta).length ? meta : '');
  },
  warn: (msg, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, Object.keys(meta).length ? meta : '');
  },
  error: (msg, meta = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, Object.keys(meta).length ? meta : '');
  }
};

module.exports = { requestLogger, logger };
