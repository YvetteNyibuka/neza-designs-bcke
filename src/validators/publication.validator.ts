import { z } from 'zod';

const PUBLICATION_TYPES = ['Report', 'Portfolio', 'Law', 'Policy', 'Guide', 'Other'] as const;

const urlOrLocalPath = z
  .string()
  .refine((val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'), {
    message: 'Must be a valid URL or local upload path',
  });

const absoluteUrl = z.string().url();

export const createPublicationSchema = z.object({
  slug: z.string().min(1).toLowerCase().optional(),
  title: z.string().min(3).max(220),
  summary: z.string().min(10).max(1200),
  type: z.enum(PUBLICATION_TYPES).default('Report'),
  publishedAt: z.string().datetime().optional(),
  coverImage: urlOrLocalPath.optional(),
  fileUrl: urlOrLocalPath.optional(),
  externalUrl: absoluteUrl.optional(),
  tags: z.array(z.string().min(1).max(40)).default([]),
});

export const updatePublicationSchema = createPublicationSchema.partial();

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
