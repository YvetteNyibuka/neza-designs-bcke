import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

const logsDir = path.join(__dirname, '../../logs');
const isServerlessRuntime = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

let canWriteLogsToDisk = false;
if (!isServerlessRuntime) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    canWriteLogsToDisk = true;
  } catch {
    canWriteLogsToDisk = false;
  }
}

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack
      ? `[${ts}] ${level}: ${message}\n${stack}`
      : `[${ts}] ${level}: ${message}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: env.isDev ? devFormat : prodFormat,
  transports: (() => {
    const transports: winston.transport[] = [new winston.transports.Console()];

    if (canWriteLogsToDisk) {
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
        })
      );
    }

    return transports;
  })(),
});
