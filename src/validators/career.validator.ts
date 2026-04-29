import { z } from 'zod';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'] as const;
const CAREER_STATUS = ['Open', 'Closed'] as const;

export const createCareerSchema = z.object({
  slug: z.string().min(1).toLowerCase().optional(),
  title: z.string().min(3).max(200),
  department: z.string().min(2).max(100),
  location: z.string().min(2).max(120),
  employmentType: z.enum(EMPLOYMENT_TYPES).default('Full-time'),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).default('Mid'),
  description: z.string().min(30),
  requirements: z.array(z.string().min(2)).default([]),
  responsibilities: z.array(z.string().min(2)).default([]),
  deadline: z.string().datetime().optional(),
  status: z.enum(CAREER_STATUS).default('Open'),
  featured: z.boolean().optional().default(false),
});

export const updateCareerSchema = createCareerSchema.partial();

export type CreateCareerInput = z.infer<typeof createCareerSchema>;
export type UpdateCareerInput = z.infer<typeof updateCareerSchema>;
