import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRoleInProject, getUserGroupInProject } from '../services/projectService';
import {
  canEditProject,
  canManageMembers,
  canDeleteProject,
  canInviteMembers,
  canViewActivityLog,
  canChangeRole,
  canRemoveMember,
  getAssignableRoles,
  Role
} from '../utils/permissions';
import {
  canViewDocument,
  canSetDocumentVisibility,
  canMoveUserBetweenGroups,
  getDefaultDocumentVisibility,
  Visibility
} from '../utils/groupPermissions';

export interface ProjectPermissions {
  role: string | null;
  group: string | null;
  loading: boolean;
  error: string | null;

  // Basic permission checks
  canEdit: boolean;
  canManageMembers: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canViewActivity: boolean;

  // Advanced permission checks
  canChangeRole: (targetRole: string) => boolean;
  canRemoveMember: (targetRole: string, targetUserId: string) => boolean;

  // Get assignable roles
  assignableRoles: Role[];

  // Group-based permission checks
  canViewDocument: (documentVisibility: string) => boolean;
  canSetDocumentVisibility: () => boolean;
  canMoveUserBetweenGroups: () => boolean;

  // Get default visibility for new documents
  defaultDocumentVisibility: Visibility;
}

/**
 * Custom hook to get user's permissions for a project
 */
export function useProjectPermissions(projectId: string | undefined): ProjectPermissions {
  const { currentUser } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoleAndGroup() {
      if (!currentUser || !projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [userRole, userGroup] = await Promise.all([
          getUserRoleInProject(currentUser.uid, projectId),
          getUserGroupInProject(currentUser.uid, projectId)
        ]);
        setRole(userRole);
        setGroup(userGroup);
      } catch (err) {
        console.error('Error fetching user role and group:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchRoleAndGroup();
  }, [currentUser, projectId]);

  // Permission check functions
  const permissions: ProjectPermissions = {
    role,
    group,
    loading,
    error,

    // Basic permission checks
    canEdit: role ? canEditProject(role) : false,
    canManageMembers: role ? canManageMembers(role) : false,
    canDelete: role ? canDeleteProject(role) : false,
    canInvite: role ? canInviteMembers(role) : false,
    canViewActivity: role ? canViewActivityLog(role) : false,

    // Advanced permission checks
    canChangeRole: (targetRole: string) => role ? canChangeRole(role, targetRole) : false,
    canRemoveMember: (targetRole: string, targetUserId: string) =>
      role && currentUser ? canRemoveMember(role, targetRole, currentUser.uid, targetUserId) : false,

    // Get assignable roles
    assignableRoles: role ? getAssignableRoles(role) : [],

    // Group-based permission checks
    canViewDocument: (documentVisibility: string) =>
      group && role ? canViewDocument(group, documentVisibility, role) : false,
    canSetDocumentVisibility: () =>
      role && group ? canSetDocumentVisibility(role, group) : false,
    canMoveUserBetweenGroups: () =>
      role ? canMoveUserBetweenGroups(role) : false,

    // Get default visibility for new documents
    defaultDocumentVisibility: group ? getDefaultDocumentVisibility(group) : 'both'
  };

  return permissions;
}
