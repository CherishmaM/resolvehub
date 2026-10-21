import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Role must be either admin or member' }),
  }),
});

export const userIdParamSchema = z.object({
  id: objectIdValidator,
});
