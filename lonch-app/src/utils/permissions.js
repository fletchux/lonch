/**
 * Permission utilities for role-based access control
 */

// Role constants
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY = [
  ROLES.VIEWER,
  ROLES.EDITOR,
  ROLES.ADMIN,
  ROLES.OWNER
];

/**
 * Check if a role has at least the same level as a required role
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean} True if user has sufficient permissions
 */
function hasRoleLevel(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Check if user can edit project content
 * Owner, Admin, and Editor can edit; Viewer cannot
 * @param {string} userRole - User's role in the project
 * @returns {boolean} True if user can edit project
 */
export function canEditProject(userRole) {
  return hasRoleLevel(userRole, ROLES.EDITOR);
}

/**
 * Check if user can manage project members
 * Only Owner and Admin can manage members
 * @param {string} userRole - User's role in the project
 * @returns {boolean} True if user can manage members
 */
export function canManageMembers(userRole) {
  return hasRoleLevel(userRole, ROLES.ADMIN);
}

/**
 * Check if user can delete the project
 * Only Owner can delete the project
 * @param {string} userRole - User's role in the project
 * @returns {boolean} True if user can delete project
 */
export function canDeleteProject(userRole) {
  return userRole === ROLES.OWNER;
}

/**
 * Check if user can change another user's role
 * Owner can change any role
 * Admin can change roles below Admin (Editor, Viewer)
 * @param {string} userRole - Current user's role
 * @param {string} targetRole - Role being changed
 * @returns {boolean} True if user can change the target role
 */
export function canChangeRole(userRole, targetRole) {
  if (userRole === ROLES.OWNER) {
    return true; // Owner can change any role
  }

  if (userRole === ROLES.ADMIN) {
    // Admin cannot change Owner or Admin roles
    return targetRole !== ROLES.OWNER && targetRole !== ROLES.ADMIN;
  }

  return false; // Editor and Viewer cannot change roles
}

/**
 * Check if user can remove another user from the project
 * Owner can remove anyone except themselves
 * Admin can remove Editor and Viewer, but not Owner or Admin
 * @param {string} userRole - Current user's role
 * @param {string} targetRole - Role of user being removed
 * @param {string} userId - Current user's ID
 * @param {string} targetUserId - ID of user being removed
 * @returns {boolean} True if user can remove the target user
 */
export function canRemoveMember(userRole, targetRole, userId, targetUserId) {
  // Cannot remove yourself
  if (userId === targetUserId) {
    return false;
  }

  if (userRole === ROLES.OWNER) {
    return true; // Owner can remove anyone except themselves (checked above)
  }

  if (userRole === ROLES.ADMIN) {
    // Admin cannot remove Owner or Admin
    return targetRole !== ROLES.OWNER && targetRole !== ROLES.ADMIN;
  }

  return false; // Editor and Viewer cannot remove members
}

/**
 * Check if user can invite new members
 * Owner and Admin can invite new members
 * @param {string} userRole - User's role in the project
 * @returns {boolean} True if user can invite members
 */
export function canInviteMembers(userRole) {
  return hasRoleLevel(userRole, ROLES.ADMIN);
}

/**
 * Check if user can view project activity log
 * All roles can view activity log
 * @param {string} userRole - User's role in the project
 * @returns {boolean} True if user can view activity log
 */
export function canViewActivityLog(userRole) {
  return Object.values(ROLES).includes(userRole);
}

/**
 * Get all available roles that a user can assign
 * Owner can assign any role
 * Admin can assign Editor and Viewer roles
 * @param {string} userRole - Current user's role
 * @returns {string[]} Array of roles that can be assigned
 */
export function getAssignableRoles(userRole) {
  if (userRole === ROLES.OWNER) {
    return [ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER];
  }

  if (userRole === ROLES.ADMIN) {
    return [ROLES.EDITOR, ROLES.VIEWER];
  }

  return []; // Editor and Viewer cannot assign roles
}

/**
 * Get human-readable role display name
 * @param {string} role - Role constant
 * @returns {string} Display name for the role
 */
export function getRoleDisplayName(role) {
  const displayNames = {
    [ROLES.OWNER]: 'Owner',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.EDITOR]: 'Editor',
    [ROLES.VIEWER]: 'Viewer'
  };

  return displayNames[role] || role;
}

/**
 * Get role color for UI display
 * @param {string} role - Role constant
 * @returns {string} Tailwind color class
 */
export function getRoleColor(role) {
  const colors = {
    [ROLES.OWNER]: 'teal', // Teal for owner (matches lonch branding)
    [ROLES.ADMIN]: 'yellow', // Gold for admin (matches lonch accent)
    [ROLES.EDITOR]: 'blue', // Blue for editor
    [ROLES.VIEWER]: 'gray' // Gray for viewer
  };

  return colors[role] || 'gray';
}
