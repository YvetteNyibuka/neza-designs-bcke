import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = HTTP_STATUS.OK
): void {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, message: string, data?: T): void {
  sendSuccess(res, message, data, HTTP_STATUS.CREATED);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: unknown
): void {
  const response: ApiResponse = { success: false, message, error };
  res.status(statusCode).json(response);
}

export function sendNotFound(res: Response, resource = 'Resource'): void {
  sendError(res, `${resource} not found`, HTTP_STATUS.NOT_FOUND);
}

export function sendUnauthorized(res: Response, message = 'Unauthorized'): void {
  sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
}

export function sendForbidden(res: Response, message = 'Forbidden'): void {
  sendError(res, message, HTTP_STATUS.FORBIDDEN);
}

export function sendBadRequest(res: Response, message: string, error?: unknown): void {
  sendError(res, message, HTTP_STATUS.BAD_REQUEST, error);
}
