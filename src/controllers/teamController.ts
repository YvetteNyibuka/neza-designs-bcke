import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as teamService from '../services/teamService';

export const getTeam = asyncHandler(async (_req: Request, res: Response) => {
  const members = await teamService.getAllTeamMembers();
  sendSuccess(res, 'Team members fetched', members);
});

export const getTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.getTeamMemberById(req.params['id'] as string);
  if (!member) { sendNotFound(res, 'Team member'); return; }
  sendSuccess(res, 'Team member fetched', member);
});

export const createTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.createTeamMember(req.body);
  sendCreated(res, 'Team member created', member);
});

export const updateTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.updateTeamMember(req.params['id'] as string, req.body);
  if (!member) { sendNotFound(res, 'Team member'); return; }
  sendSuccess(res, 'Team member updated', member);
});

export const deleteTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.softDeleteTeamMember(req.params['id'] as string);
  if (!member) { sendNotFound(res, 'Team member'); return; }
  sendSuccess(res, 'Team member deleted');
});
