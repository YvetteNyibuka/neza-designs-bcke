import { z } from 'zod';

const urlOrLocalPath = z
  .string()
  .refine((val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'), {
    message: 'Must be a valid URL or local upload path',
  });

const absoluteUrl = z.string().url();

export const updateSettingsSchema = z.object({
  metaTitle: z.string().min(1).max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: absoluteUrl.optional().or(z.literal('')),
  ogImage: urlOrLocalPath.optional().or(z.literal('')),
  indexingEnabled: z.boolean().optional(),
  sitemapEnabled: z.boolean().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logoLight: urlOrLocalPath.optional().or(z.literal('')),
  logoDark: urlOrLocalPath.optional().or(z.literal('')),
  favicon: urlOrLocalPath.optional().or(z.literal('')),
  font: z.string().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
