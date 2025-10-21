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
  getAssignableRoles
} from '../utils/permissions';
import {
  canViewDocument,
  canSetDocumentVisibility,
  canMoveUserBetweenGroups,
  getDefaultDocumentVisibility
} from '../utils/groupPermissions';

/**
 * Custom hook to get user's permissions for a project
 * @param {string} projectId - Project ID
 * @returns {Object} Permission state and helper functions
 */
export function useProjectPermissions(projectId) {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRoleAndGroup();
  }, [currentUser, projectId]);

  // Permission check functions
  const permissions = {
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
    canChangeRole: (targetRole) => role ? canChangeRole(role, targetRole) : false,
    canRemoveMember: (targetRole, targetUserId) =>
      role && currentUser ? canRemoveMember(role, targetRole, currentUser.uid, targetUserId) : false,

    // Get assignable roles
    assignableRoles: role ? getAssignableRoles(role) : [],

    // Group-based permission checks
    canViewDocument: (documentVisibility) =>
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
