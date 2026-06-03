import { z } from 'zod';

export const createPostSchema = z.object({
  slug: z.string().min(1).toLowerCase().optional(),
  title: z.string().min(5).max(300),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  category: z.string().min(2).max(100),
  readTime: z.number().int().min(1).max(120),
  publishedAt: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  author: z.object({
    name: z.string().min(2),
    role: z.string().min(2),
    avatarUrl: z.string().url().optional(),
  }),
  tags: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
