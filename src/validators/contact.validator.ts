import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export const replyContactSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(['new', 'replied', 'closed']),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type ReplyContactInput = z.infer<typeof replyContactSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
