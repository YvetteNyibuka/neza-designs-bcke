import { z } from 'zod';

const featureSchema = z.object({
  name: z.string().min(1),
  meaning: z.string().min(1),
  icon: z.string().min(1),
});

const urlOrLocalPath = z
  .string()
  .refine((val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'), {
    message: 'Must be a valid URL or local upload path',
  });

export const createServiceSchema = z.object({
  title: z.string().min(2).max(200),
  shortDescription: z.string().min(10).max(300),
  features: z.array(featureSchema).min(1).max(20),
  imageUrl: urlOrLocalPath.optional(),
  buttonTitle: z.string().default('Learn More'),
  order: z.number().int().min(0).optional().default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
