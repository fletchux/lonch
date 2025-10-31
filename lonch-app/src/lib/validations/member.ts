/**
 * Project member and user validation schemas using Zod
 */

import { z } from 'zod';
import { emailSchema } from './auth';

/**
 * User role validation
 */
export const userRoleSchema = z.enum(['owner', 'admin', 'editor', 'viewer'], {
  errorMap: () => ({ message: 'Invalid user role' }),
});

export type UserRole = z.infer<typeof userRoleSchema>;

/**
 * User group validation
 */
export const userGroupSchema = z.enum(['consulting', 'client'], {
  errorMap: () => ({ message: 'Invalid user group' }),
});

export type UserGroup = z.infer<typeof userGroupSchema>;

/**
 * User ID validation
 */
export const userIdSchema = z
  .string()
  .min(1, 'User ID is required')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid user ID format');

/**
 * Invite user schema (for adding members to a project)
 */
export const inviteUserSchema = z.object({
  email: emailSchema,
  role: userRoleSchema,
  group: userGroupSchema,
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim()
    .optional(),
});

export type InviteUserData = z.infer<typeof inviteUserSchema>;

/**
 * Update member role schema
 */
export const updateMemberRoleSchema = z.object({
  userId: userIdSchema,
  role: userRoleSchema,
});

export type UpdateMemberRoleData = z.infer<typeof updateMemberRoleSchema>;

/**
 * Update member group schema
 */
export const updateMemberGroupSchema = z.object({
  userId: userIdSchema,
  group: userGroupSchema,
});

export type UpdateMemberGroupData = z.infer<typeof updateMemberGroupSchema>;

/**
 * Remove member schema
 */
export const removeMemberSchema = z.object({
  userId: userIdSchema,
});

export type RemoveMemberData = z.infer<typeof removeMemberSchema>;

/**
 * Invite link creation schema
 */
export const createInviteLinkSchema = z.object({
  role: userRoleSchema,
  group: userGroupSchema,
  expiresInDays: z
    .number()
    .int()
    .min(1, 'Expiration must be at least 1 day')
    .max(365, 'Expiration cannot exceed 365 days')
    .optional(),
  maxUses: z
    .number()
    .int()
    .min(1, 'Max uses must be at least 1')
    .max(1000, 'Max uses cannot exceed 1000')
    .optional(),
});

export type CreateInviteLinkData = z.infer<typeof createInviteLinkSchema>;

/**
 * Accept invite link schema
 */
export const acceptInviteLinkSchema = z.object({
  token: z
    .string()
    .min(1, 'Invite token is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid invite token format'),
});

export type AcceptInviteLinkData = z.infer<typeof acceptInviteLinkSchema>;
