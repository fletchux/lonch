/**
 * Permission utilities for role-based access control
 */

// Role constants
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: Role[] = [
  ROLES.VIEWER,
  ROLES.EDITOR,
  ROLES.ADMIN,
  ROLES.OWNER
];

/**
 * Check if a role has at least the same level as a required role
 */
function hasRoleLevel(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole as Role);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Check if user can edit project content
 * Owner, Admin, and Editor can edit; Viewer cannot
 */
export function canEditProject(userRole: string): boolean {
  return hasRoleLevel(userRole, ROLES.EDITOR);
}

/**
 * Check if user can manage project members
 * Only Owner and Admin can manage members
 */
export function canManageMembers(userRole: string): boolean {
  return hasRoleLevel(userRole, ROLES.ADMIN);
}

/**
 * Check if user can delete the project
 * Only Owner can delete the project
 */
export function canDeleteProject(userRole: string): boolean {
  return userRole === ROLES.OWNER;
}

/**
 * Check if user can change another user's role
 * Owner can change any role
 * Admin can change roles below Admin (Editor, Viewer)
 */
export function canChangeRole(userRole: string, targetRole: string): boolean {
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
 */
export function canRemoveMember(
  userRole: string,
  targetRole: string,
  userId: string,
  targetUserId: string
): boolean {
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
 */
export function canInviteMembers(userRole: string): boolean {
  return hasRoleLevel(userRole, ROLES.ADMIN);
}

/**
 * Check if user can view project activity log
 * All roles can view activity log
 */
export function canViewActivityLog(userRole: string): boolean {
  return Object.values(ROLES).includes(userRole as Role);
}

/**
 * Get all available roles that a user can assign
 * Owner can assign any role
 * Admin can assign Editor and Viewer roles
 */
export function getAssignableRoles(userRole: string): Role[] {
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
 */
export function getRoleDisplayName(role: string): string {
  const displayNames: Record<string, string> = {
    [ROLES.OWNER]: 'Owner',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.EDITOR]: 'Editor',
    [ROLES.VIEWER]: 'Viewer'
  };

  return displayNames[role] || role;
}

/**
 * Get role color for UI display
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    [ROLES.OWNER]: 'teal', // Teal for owner (matches lonch branding)
    [ROLES.ADMIN]: 'yellow', // Gold for admin (matches lonch accent)
    [ROLES.EDITOR]: 'blue', // Blue for editor
    [ROLES.VIEWER]: 'gray' // Gray for viewer
  };

  return colors[role] || 'gray';
}
