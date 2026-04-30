import dns from 'node:dns';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import app from './app';

// Render environments can lack outbound IPv6 routing; prefer IPv4 DNS results.
dns.setDefaultResultOrder('ipv4first');

async function start(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`API docs: http://localhost:${env.PORT}/api/v1/health`);
    logger.info(`Express trust proxy: ${String(app.get('trust proxy'))}`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
    server.close(() => process.exit(1));
  });
}

start().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
