import { z } from 'zod';

const urlOrLocalPath = z
  .string()
  .refine((val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/'), {
    message: 'Must be a valid URL or local upload path',
  });

export const createTeamMemberSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  bio: z.string().min(10).max(1000),
  imageUrl: urlOrLocalPath.optional(),
  order: z.number().int().min(0).optional().default(0),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
