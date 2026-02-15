
import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012', // 32 chars
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ETSY_REDIRECT_URI: process.env.ETSY_REDIRECT_URI || 'http://localhost:8080/api/etsy/oauth/callback',
};
