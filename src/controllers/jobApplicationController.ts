import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest } from '../utils/response';
import * as appService from '../services/jobApplicationService';
import { ApplicationStatus } from '../models/JobApplication';

export const applyForCareer = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const application = await appService.submitApplication(slug as string, req.body);
    sendCreated(res, 'Application submitted successfully', application);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    sendBadRequest(res, message);
  }
});

export const getCareerApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.getApplicationsByCareer(
    req.params['slug'] as string,
    req.query as Record<string, string>
  );
  sendSuccess(res, 'Applications fetched', result);
});

export const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.getAllApplications(req.query as Record<string, string>);
  sendSuccess(res, 'Applications fetched', result);
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body as { status: ApplicationStatus; note?: string };
  if (!status) {
    sendBadRequest(res, 'status is required');
    return;
  }
  const updated = await appService.updateApplicationStatus(id as string, status, note);
  if (!updated) {
    sendNotFound(res, 'Application');
    return;
  }
  sendSuccess(res, 'Application updated', updated);
});

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await appService.deleteApplication(req.params['id'] as string);
  if (!deleted) {
    sendNotFound(res, 'Application');
    return;
  }
  sendSuccess(res, 'Application removed');
});
