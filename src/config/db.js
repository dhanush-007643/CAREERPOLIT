const mongoose = require('mongoose');
const config = require('./env');

let mongoMemoryServer = null;

const connectDB = async (customUri) => {
  const uri = customUri || config.mongoUri;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed (${error.message}).`);

    // In development or test, fall back to in-memory MongoDB so the platform runs flawlessly
    if (config.nodeEnv !== 'production') {
      try {
        console.log('[MongoDB] Initializing in-memory Mongo server fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        const fallbackConn = await mongoose.connect(fallbackUri, {
          autoIndex: true
        });
        console.log(`[MongoDB] Connected to in-memory instance at ${fallbackUri}`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error(`[MongoDB] Fallback in-memory connection failed: ${fallbackError.message}`);
      }
    }

    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error(`[MongoDB] Disconnect error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
