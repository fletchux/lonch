/**
 * Core application type definitions
 */

import { Timestamp } from 'firebase/firestore';

/**
 * User roles in a project
 */
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * User groups in a project
 */
export type UserGroup = 'consulting' | 'client';

/**
 * Document categories
 */
export type DocumentCategory =
  | 'intake'
  | 'checklist'
  | 'stakeholder'
  | 'team'
  | 'other';

/**
 * Document visibility settings
 */
export type DocumentVisibility = 'consulting' | 'client' | 'both';

/**
 * Project status
 */
export type ProjectStatus = 'active' | 'archived' | 'completed';

/**
 * Client types
 */
export type ClientType = string; // Flexible for now

/**
 * Activity types for logging
 */
export type ActivityType =
  | 'document_uploaded'
  | 'document_deleted'
  | 'document_updated'
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  | 'project_created'
  | 'project_updated';

/**
 * Document metadata
 */
export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  size: number;
  uploadedAt: string | Timestamp;
  uploadedBy: string;
  visibility: DocumentVisibility;
  downloadURL?: string;
  storagePath?: string;
  fileName?: string;
  file?: File;
}

/**
 * Project member
 */
export interface ProjectMember {
  userId: string;
  email: string;
  displayName?: string;
  role: UserRole;
  group: UserGroup;
  addedAt: Timestamp;
  addedBy: string;
}

/**
 * Project data structure
 */
export interface Project {
  id: string;
  name: string;
  clientType: ClientType;
  status: ProjectStatus;
  ownerId: string;
  members?: ProjectMember[];
  documents?: Document[];
  intakeTemplate?: string | null;
  checklistTemplate?: string | null;
  stakeholderTemplate?: string | null;
  teamTemplate?: string | null;
  extractedData?: Record<string, unknown> | null;
  extractionConflicts?: Record<string, unknown> | null;
  manuallyEditedFields?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userRole?: UserRole;
  userGroup?: UserGroup;
}

/**
 * Activity log entry
 */
export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  type: ActivityType;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  groupContext: UserGroup | null;
  timestamp: Timestamp;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  documentUploadNotifications: boolean;
  memberAddedNotifications: boolean;
  projectUpdateNotifications: boolean;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  projectId?: string;
  actionUrl?: string;
}

/**
 * Invite link
 */
export interface InviteLink {
  id: string;
  projectId: string;
  token: string;
  role: UserRole;
  group: UserGroup;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
}
