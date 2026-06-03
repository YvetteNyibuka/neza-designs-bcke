import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as careerService from '../services/careerService';

export const getCareers = asyncHandler(async (req: Request, res: Response) => {
  const result = await careerService.getAllCareers(req.query as any);
  sendSuccess(res, 'Careers fetched', result);
});
 
 export const getCareersAdmin = asyncHandler(async (req: Request, res: Response) => {
   const result = await careerService.getAllCareersAdmin(req.query as any);
   sendSuccess(res, 'Careers fetched (admin view)', result);
 });

export const getCareer = asyncHandler(async (req: Request, res: Response) => {
  const career = await careerService.getCareerBySlug(req.params['slug'] as string);
  if (!career) {
    sendNotFound(res, 'Career');
    return;
  }
  sendSuccess(res, 'Career fetched', career);
});

export const createCareer = asyncHandler(async (req: Request, res: Response) => {
  const career = await careerService.createCareer(req.body);
  sendCreated(res, 'Career created', career);
});

export const updateCareer = asyncHandler(async (req: Request, res: Response) => {
  const career = await careerService.updateCareer(req.params['slug'] as string, req.body);
  if (!career) {
    sendNotFound(res, 'Career');
    return;
  }
  sendSuccess(res, 'Career updated', career);
});

export const deleteCareer = asyncHandler(async (req: Request, res: Response) => {
  const career = await careerService.softDeleteCareer(req.params['slug'] as string);
  if (!career) {
    sendNotFound(res, 'Career');
    return;
  }
  sendSuccess(res, 'Career deleted');
});
