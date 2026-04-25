import { z } from 'zod';

const featureSchema = z.object({
  name: z.string().min(1),
  meaning: z.string().min(1),
  icon: z.string().min(1),
});

export const createServiceSchema = z.object({
  title: z.string().min(2).max(200),
  shortDescription: z.string().min(10).max(300),
  fullDescription: z.string().min(20),
  features: z.array(featureSchema).min(1).max(20),
  imageUrl: z.string().url().optional(),
  buttonTitle: z.string().default('Learn More'),
  order: z.number().int().min(0).optional().default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
