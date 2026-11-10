import { z } from 'zod';
import {
  IDEA_CATEGORIES,
  IDEA_STAGES,
  IDEA_IMPACTS,
} from '../models/Idea.js';

export const createIdeaSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters long')
    .max(140, 'Title cannot exceed 140 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(3, 'Description must be at least 3 characters long')
    .max(4000, 'Description cannot exceed 4000 characters'),
  category: z
    .enum(IDEA_CATEGORIES, {
      invalid_type_error: 'Invalid category selected',
    })
    .default('Feature Proposal'),
  impact: z
    .enum(IDEA_IMPACTS, {
      invalid_type_error: 'Invalid impact level selected',
    })
    .default('Medium'),
  tags: z
    .union([
      z.array(z.string().trim().max(50)),
      z.string().transform((val) =>
        val ? val.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean) : []
      ),
    ])
    .optional()
    .default([]),
  imageUrl: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export const updateIdeaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters long')
    .max(140, 'Title cannot exceed 140 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters long')
    .max(4000, 'Description cannot exceed 4000 characters')
    .optional(),
  category: z.enum(IDEA_CATEGORIES).optional(),
  impact: z.enum(IDEA_IMPACTS).optional(),
  stage: z.enum(IDEA_STAGES).optional(),
  tags: z
    .union([
      z.array(z.string().trim().max(50)),
      z.string().transform((val) =>
        val ? val.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean) : []
      ),
    ])
    .optional(),
  imageUrl: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export const updateStageSchema = z.object({
  stage: z.enum(IDEA_STAGES, {
    required_error: 'Stage is required',
    invalid_type_error: 'Invalid idea stage',
  }),
});

export const addIdeaCommentSchema = z.object({
  text: z
    .string({ required_error: 'Comment text is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

export const ideaQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  stage: z.string().trim().optional(),
  sort: z.enum(['popular', 'recent', 'discussed']).default('popular').optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
});

export const ideaIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Idea ID format'),
});

export const commentIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Idea ID format'),
  commentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Comment ID format'),
});
