import { z } from 'zod';

const PROJECT_STATUSES = ['Completed', 'Ongoing', 'Handed Over', 'Consulted'] as const;

export const createProjectSchema = z.object({
  slug: z.string().min(1).toLowerCase().optional(),
  title: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  status: z.enum(PROJECT_STATUSES).default('Completed'),
  description: z
    .string()
    .min(10, 'Must be at least 10 characters')
    .optional()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .refine((val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'), {
      message: 'Must be a valid URL or local upload path',
    }),
  location: z.string().optional(),
  completionYear: z.number().int().min(1900).max(2100).optional(),
  client: z.string().optional(),
  featured: z.boolean().optional().default(false),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
