import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as categoryService from '../services/categoryService';

// Career Categories
export const getCareerCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getAllCareerCategories(req.query as any);
  sendSuccess(res, 'Career categories fetched', result);
});

export const getCareerCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCareerCategoryById(req.params.id as string);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category fetched', category);
});

export const createCareerCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCareerCategory(req.body);
  sendCreated(res, 'Category created', category);
});

export const updateCareerCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCareerCategory(req.params.id as string, req.body);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category updated', category);
});

export const deleteCareerCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.deleteCareerCategory(req.params.id as string);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category deleted');
});

// Blog Categories
export const getBlogCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getAllBlogCategories(req.query as any);
  sendSuccess(res, 'Blog categories fetched', result);
});

export const getBlogCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getBlogCategoryById(req.params.id as string);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category fetched', category);
});

export const createBlogCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createBlogCategory(req.body);
  sendCreated(res, 'Category created', category);
});

export const updateBlogCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateBlogCategory(req.params.id as string, req.body);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category updated', category);
});

export const deleteBlogCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.deleteBlogCategory(req.params.id as string);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category deleted');
});

// Project Categories
export const getProjectCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getAllProjectCategories(req.query as any);
  sendSuccess(res, 'Project categories fetched', result);
});

export const getProjectCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getProjectCategoryById(req.params.id as string);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category fetched', category);
});

export const createProjectCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createProjectCategory(req.body);
  sendCreated(res, 'Category created', category);
});

export const updateProjectCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateProjectCategory(req.params.id as string, req.body);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category updated', category);
});

export const deleteProjectCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.deleteProjectCategory(req.params.id as string);
  if (!category) {
    sendNotFound(res, 'Category');
    return;
  }
  sendSuccess(res, 'Category deleted');
});
