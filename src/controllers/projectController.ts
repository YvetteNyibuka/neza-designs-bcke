import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as projectService from '../services/projectService';

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.getAllProjects(req.query as any);
  sendSuccess(res, 'Projects fetched', result);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectBySlug(req.params['slug'] as string);
  if (!project) { sendNotFound(res, 'Project'); return; }
  sendSuccess(res, 'Project fetched', project);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.body);
  sendCreated(res, 'Project created', project);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(req.params['slug'] as string, req.body);
  if (!project) { sendNotFound(res, 'Project'); return; }
  sendSuccess(res, 'Project updated', project);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.softDeleteProject(req.params['slug'] as string);
  if (!project) { sendNotFound(res, 'Project'); return; }
  sendSuccess(res, 'Project deleted');
});
