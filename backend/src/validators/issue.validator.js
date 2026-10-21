import { z } from 'zod';
import mongoose from 'mongoose';
import {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
} from '../models/Issue.js';

const objectIdValidator = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

export const createIssueSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.enum(ISSUE_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${ISSUE_CATEGORIES.join(', ')}` }),
  }),
  priority: z.enum(ISSUE_PRIORITIES, {
    errorMap: () => ({ message: `Priority must be one of: ${ISSUE_PRIORITIES.join(', ')}` }),
  }).optional().default('Medium'),
  assignedTo: objectIdValidator.nullable().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(5).max(2000).optional(),
  category: z.enum(ISSUE_CATEGORIES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  assignedTo: objectIdValidator.nullable().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(ISSUE_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${ISSUE_STATUSES.join(', ')}` }),
  }),
});

export const assignIssueSchema = z.object({
  assignedTo: objectIdValidator.nullable(),
});

export const issueQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  category: z.enum(ISSUE_CATEGORIES).optional(),
  assignedTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const issueIdParamSchema = z.object({
  id: objectIdValidator,
});
