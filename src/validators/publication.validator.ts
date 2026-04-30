import { z } from 'zod';

const PUBLICATION_TYPES = ['Report', 'Portfolio', 'Law', 'Policy', 'Guide', 'Other'] as const;

export const createPublicationSchema = z.object({
  slug: z.string().min(1).toLowerCase().optional(),
  title: z.string().min(3).max(220),
  summary: z.string().min(10).max(1200),
  type: z.enum(PUBLICATION_TYPES).default('Report'),
  publishedAt: z.string().datetime().optional(),
  coverImage: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  tags: z.array(z.string().min(1).max(40)).default([]),
});

export const updatePublicationSchema = createPublicationSchema.partial();

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
