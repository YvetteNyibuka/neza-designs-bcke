import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import * as analyticsService from '../services/analyticsService';

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await analyticsService.getAnalyticsOverview();
  sendSuccess(res, 'Analytics overview fetched', overview);
});
