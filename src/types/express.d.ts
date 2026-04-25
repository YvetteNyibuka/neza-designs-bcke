import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
