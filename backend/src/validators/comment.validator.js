import { z } from 'zod';

export const createCommentSchema = z.object({
  text: z
    .string({ required_error: 'Comment text is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});
