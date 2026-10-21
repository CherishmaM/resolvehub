import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (customUri) => {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = customUri || env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to connect to MongoDB: ${error.message}`);
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[DATABASE] MongoDB Disconnected gracefully');
  } catch (error) {
    console.error(`[DATABASE ERROR] Error during disconnection: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[DATABASE] MongoDB connection lost');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DATABASE ERROR] MongoDB runtime error: ${err.message}`);
});
