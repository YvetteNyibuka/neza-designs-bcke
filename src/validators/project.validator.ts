import { z } from 'zod';

const PROJECT_CATEGORIES = [
  'Architecture',
  'Civil Engineering',
  'Project Management',
  'Masterplanning',
  'Interior',
] as const;

const PROJECT_STATUSES = ['Completed', 'Ongoing'] as const;

export const createProjectSchema = z.object({
  slug: z.string().min(1).toLowerCase().optional(),
  title: z.string().min(2).max(200),
  category: z.enum(PROJECT_CATEGORIES),
  status: z.enum(PROJECT_STATUSES).default('Completed'),
  description: z.string().min(10),
  imageUrl: z.string().url().optional(),
  location: z.string().optional(),
  completionYear: z.number().int().min(1900).max(2100).optional(),
  client: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
