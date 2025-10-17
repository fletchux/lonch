import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRoleInProject } from '../services/projectService';
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

/**
 * Custom hook to get user's permissions for a project
 * @param {string} projectId - Project ID
 * @returns {Object} Permission state and helper functions
 */
export function useProjectPermissions(projectId) {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRole() {
      if (!currentUser || !projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userRole = await getUserRoleInProject(currentUser.uid, projectId);
        setRole(userRole);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [currentUser, projectId]);

  // Permission check functions
  const permissions = {
    role,
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
    assignableRoles: role ? getAssignableRoles(role) : []
  };

  return permissions;
}
