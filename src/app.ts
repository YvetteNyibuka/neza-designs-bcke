import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import v1Router from './routes/v1';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import { logger } from './utils/logger';

const app = express();

// This API is deployed behind reverse proxies (Render/Vercel),
// and rate limiter depends on forwarded client IPs.
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001', 'https://neza-designs-bcke.vercel.app', 'https://nezadesigns.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Logging
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// Global rate limit
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1', v1Router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralised error handler
app.use(errorHandler);

export default app;
