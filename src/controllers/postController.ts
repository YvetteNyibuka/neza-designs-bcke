import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import * as postService from '../services/postService';
import { notifyNewPost } from '../services/newsletterService';

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.getAllPosts(req.query as any);
  sendSuccess(res, 'Blog posts fetched', result);
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPostBySlug(req.params['slug'] as string);
  if (!post) { sendNotFound(res, 'Post'); return; }
  sendSuccess(res, 'Post fetched', post);
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.createPost(req.body);
  notifyNewPost({
    title: post.title,
    slug: post.slug,
    excerpt: (post as any).excerpt,
    category: (post as any).category,
  }).catch(() => {/* suppress */});
  sendCreated(res, 'Post created', post);
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.updatePost(req.params['slug'] as string, req.body);
  if (!post) { sendNotFound(res, 'Post'); return; }
  sendSuccess(res, 'Post updated', post);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.softDeletePost(req.params['slug'] as string);
  if (!post) { sendNotFound(res, 'Post'); return; }
  sendSuccess(res, 'Post deleted');
});
