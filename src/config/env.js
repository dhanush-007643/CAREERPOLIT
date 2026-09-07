const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const defaultDevSecret = 'careerpilot_dev_jwt_secret_key_123456789';

if (nodeEnv === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === defaultDevSecret) {
    throw new Error('FATAL: JWT_SECRET environment variable must be set to a secure, non-default value in production.');
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerpilot',
  jwt: {
    secret: process.env.JWT_SECRET || defaultDevSecret,
    expiresIn: process.env.JWT_EXPIRE || '30d'
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_NAME || '',
    apiKey: process.env.CLOUDINARY_KEY || '',
    apiSecret: process.env.CLOUDINARY_SECRET || ''
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200
  }
};

module.exports = config;
