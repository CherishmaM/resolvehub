import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const startServer = async () => {
  try {
    // 1. Validate required environment variables
    validateEnv();

    // 2. Connect to database
    await connectDB();

    // 3. Start Express server
    const server = app.listen(env.PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 FixFlow API Server listening on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/api/v1/health`);
      console.log(`===============================================`);
    });

    // Graceful shutdown listeners
    const handleShutdown = async (signal) => {
      console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server...`);
      server.close(async () => {
        console.log('[SHUTDOWN] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force close if graceful shutdown takes too long
      setTimeout(() => {
        console.error('[SHUTDOWN] Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[FATAL ERROR] Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
