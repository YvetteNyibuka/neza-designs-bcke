import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  MONGODB_URI: requireEnv('MONGODB_URI'),

  ACCESS_TOKEN_SECRET: requireEnv('ACCESS_TOKEN_SECRET'),
  REFRESH_TOKEN_SECRET: requireEnv('REFRESH_TOKEN_SECRET'),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Neza Designs <noreply@nezadesigns.com>',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@nezadesigns.com',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'Admin@1234!',

  SEED_ADMIN1_EMAIL: process.env.SEED_ADMIN1_EMAIL || '',
  SEED_ADMIN1_PASSWORD: process.env.SEED_ADMIN1_PASSWORD || '',
  SEED_ADMIN2_EMAIL: process.env.SEED_ADMIN2_EMAIL || '',
  SEED_ADMIN2_PASSWORD: process.env.SEED_ADMIN2_PASSWORD || '',

  OTP_EXPIRES_IN_MINUTES: parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '5', 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10),

  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
};
