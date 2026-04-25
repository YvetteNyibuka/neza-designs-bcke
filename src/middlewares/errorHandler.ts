import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../constants/httpStatus';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    err.isOperational || env.isDev
      ? err.message
      : 'An unexpected error occurred';

  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${err.message}`, {
      stack: err.stack,
    });
  } else {
    logger.warn(`[${statusCode}] ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDev && { stack: err.stack }),
  });
}

export function createError(
  message: string,
  statusCode: number,
  isOperational = true
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}
