const app = require('./src/app');
const config = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');

const startServer = async () => {
  try {
    // Connect to MongoDB Database
    await connectDB();

    // Auto-seed demo users if running fresh or on in-memory fallback
    const User = require('./src/models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial demo platform data...');
      const { seedData } = require('./scripts/seed');
      await seedData({ standalone: false, clearExisting: false });
    }

    const server = app.listen(config.port, () => {
      console.log(`=================================================`);
      console.log(`🚀 CareerPilot Backend is running!`);
      console.log(`📡 Port: ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Base: http://localhost:${config.port}/api`);
      console.log(`=================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Closed out remaining connections.');
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        console.error('[Server] Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server] Initialization failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
