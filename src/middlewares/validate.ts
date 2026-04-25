import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendBadRequest } from '../utils/response';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const zodErr = result.error;
      const errors = zodErr.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendBadRequest(res, 'Validation failed', errors);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const zodErr = result.error;
      const errors = zodErr.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendBadRequest(res, 'Invalid query parameters', errors);
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
