/**
 * Project validation schemas using Zod
 */

import { z } from 'zod';
import { emailSchema } from './auth';

/**
 * Client type validation
 */
export const clientTypeSchema = z
  .string()
  .min(1, 'Client type is required')
  .max(100, 'Client type must be less than 100 characters')
  .trim();

/**
 * Project name validation
 */
export const projectNameSchema = z
  .string()
  .min(1, 'Project name is required')
  .max(200, 'Project name must be less than 200 characters')
  .trim();

/**
 * Project status validation
 */
export const projectStatusSchema = z.enum(['active', 'archived', 'completed'], {
  errorMap: () => ({ message: 'Invalid project status' }),
});

/**
 * Create project schema
 */
export const createProjectSchema = z.object({
  name: projectNameSchema,
  clientType: clientTypeSchema,
  intakeTemplate: z.string().nullable().optional(),
  checklistTemplate: z.string().nullable().optional(),
  stakeholderTemplate: z.string().nullable().optional(),
  teamTemplate: z.string().nullable().optional(),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

/**
 * Update project schema (all fields optional)
 */
export const updateProjectSchema = z.object({
  name: projectNameSchema.optional(),
  clientType: clientTypeSchema.optional(),
  status: projectStatusSchema.optional(),
  intakeTemplate: z.string().nullable().optional(),
  checklistTemplate: z.string().nullable().optional(),
  stakeholderTemplate: z.string().nullable().optional(),
  teamTemplate: z.string().nullable().optional(),
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

/**
 * Project ID validation
 */
export const projectIdSchema = z
  .string()
  .min(1, 'Project ID is required')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid project ID format');

/**
 * Document extraction data schema
 */
export const extractedDataSchema = z.record(z.unknown()).nullable();

/**
 * Manually edited fields schema
 */
export const manuallyEditedFieldsSchema = z.array(z.string()).default([]);
