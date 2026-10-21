import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `[CONFIG ERROR] Missing required environment variable(s): ${missing.join(', ')}. ` +
      `Please check your backend .env file or reference .env.example.`
    );
  }
};

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fixflow',
  JWT_SECRET: process.env.JWT_SECRET || 'fixflow_dev_secret_key_987654321_secure_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
};
