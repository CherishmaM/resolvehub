import { z } from 'zod';
import { PROJECT_STATUSES, PROJECT_MEMBER_ROLES } from '../models/Project.js';

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .trim()
    .min(2, 'Project name must be at least 2 characters long')
    .max(60, 'Project name cannot exceed 60 characters'),
  key: z
    .string({ required_error: 'Project key is required' })
    .trim()
    .toUpperCase()
    .min(2, 'Project key must be at least 2 characters long')
    .max(10, 'Project key cannot exceed 10 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Project key must contain only uppercase letters, numbers, hyphens, or underscores'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .default(''),
  status: z.enum(PROJECT_STATUSES).optional().default('Active'),
  initialMemberIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'))
    .optional()
    .default([]),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Project name must be at least 2 characters long')
    .max(60, 'Project name cannot exceed 60 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export const addMemberSchema = z.object({
  userId: z
    .string({ required_error: 'User ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format'),
  role: z
    .enum(PROJECT_MEMBER_ROLES, {
      invalid_type_error: 'Invalid project role',
    })
    .default('project_member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(PROJECT_MEMBER_ROLES, {
    required_error: 'Project role is required',
    invalid_type_error: 'Invalid project role',
  }),
});

export const projectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Project ID format'),
});

export const memberIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Project ID format'),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format'),
});
