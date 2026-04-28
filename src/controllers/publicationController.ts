import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as publicationService from '../services/publicationService';

export const getPublications = asyncHandler(async (req: Request, res: Response) => {
  const result = await publicationService.getAllPublications(req.query as any);
  sendSuccess(res, 'Publications fetched', result);
});

export const getPublication = asyncHandler(async (req: Request, res: Response) => {
  const publication = await publicationService.getPublicationBySlug(req.params['slug'] as string);
  if (!publication) {
    sendNotFound(res, 'Publication');
    return;
  }
  sendSuccess(res, 'Publication fetched', publication);
});

export const createPublication = asyncHandler(async (req: Request, res: Response) => {
  const publication = await publicationService.createPublication(req.body);
  sendCreated(res, 'Publication created', publication);
});

export const updatePublication = asyncHandler(async (req: Request, res: Response) => {
  const publication = await publicationService.updatePublication(req.params['slug'] as string, req.body);
  if (!publication) {
    sendNotFound(res, 'Publication');
    return;
  }
  sendSuccess(res, 'Publication updated', publication);
});

export const deletePublication = asyncHandler(async (req: Request, res: Response) => {
  const publication = await publicationService.softDeletePublication(req.params['slug'] as string);
  if (!publication) {
    sendNotFound(res, 'Publication');
    return;
  }
  sendSuccess(res, 'Publication deleted');
});
