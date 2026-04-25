import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as serviceService from '../services/serviceService';

export const getServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await serviceService.getAllServices();
  sendSuccess(res, 'Services fetched', services);
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceById(req.params['id'] as string);
  if (!service) { sendNotFound(res, 'Service'); return; }
  sendSuccess(res, 'Service fetched', service);
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.createService(req.body);
  sendCreated(res, 'Service created', service);
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.updateService(req.params['id'] as string, req.body);
  if (!service) { sendNotFound(res, 'Service'); return; }
  sendSuccess(res, 'Service updated', service);
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.softDeleteService(req.params['id'] as string);
  if (!service) { sendNotFound(res, 'Service'); return; }
  sendSuccess(res, 'Service deleted');
});

export const reorderServices = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await serviceService.reorderServices(orderedIds);
  sendSuccess(res, 'Services reordered');
});
