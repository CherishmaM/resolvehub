import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Role must be either admin or member' }),
  }).optional().default('member'),
  jobTitle: z.string().trim().max(50).optional().default('Software Engineer'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().default('Welcome@123'),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Role must be either admin or member' }),
  }),
});

export const userIdParamSchema = z.object({
  id: objectIdValidator,
});
