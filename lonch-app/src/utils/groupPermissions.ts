/**
 * Group Permissions Utilities
 *
 * Provides group-based permission checks for the dual-group architecture.
 * Groups are hardcoded: "consulting" and "client" (no dynamic group creation).
 */

// Group constants
export const GROUP = {
  CONSULTING: 'consulting',
  CLIENT: 'client'
} as const;

export type Group = typeof GROUP[keyof typeof GROUP];

// Document visibility constants
export const VISIBILITY = {
  CONSULTING_ONLY: 'consulting_only',
  CLIENT_ONLY: 'client_only',
  BOTH: 'both'  // Note: Display label is "All" but value stays "both" for backwards compatibility
} as const;

export type Visibility = typeof VISIBILITY[keyof typeof VISIBILITY];

/**
 * Check if a user can view a document based on their group and document visibility
 */
export function canViewDocument(
  userGroup: string,
  documentVisibility: string,
  userRole: string | null = null
): boolean {
  // Owner can always see everything
  if (userRole === 'owner') {
    return true;
  }

  // Check group-based visibility
  if (documentVisibility === VISIBILITY.BOTH) {
    return true;
  }

  if (documentVisibility === VISIBILITY.CONSULTING_ONLY && userGroup === GROUP.CONSULTING) {
    return true;
  }

  if (documentVisibility === VISIBILITY.CLIENT_ONLY && userGroup === GROUP.CLIENT) {
    return true;
  }

  return false;
}

/**
 * Check if a user can set document visibility settings
 * Owner and Admin from ANY group (consulting or client) can change document visibility
 */
export function canSetDocumentVisibility(userRole: string, _userGroup: string): boolean {
  // Owner and Admin from any group can set document visibility
  return userRole === 'owner' || userRole === 'admin';
}

/**
 * Check if a user can move users between groups
 * Only Owner/Admin can move users between groups
 */
export function canMoveUserBetweenGroups(userRole: string): boolean {
  return userRole === 'owner' || userRole === 'admin';
}

/**
 * Get default document visibility based on user's group
 * Consulting Group ’ 'consulting_only'
 * Client Group ’ 'both'
 */
export function getDefaultDocumentVisibility(userGroup: string): Visibility {
  if (userGroup === GROUP.CONSULTING) {
    return VISIBILITY.CONSULTING_ONLY;
  }

  if (userGroup === GROUP.CLIENT) {
    return VISIBILITY.BOTH;
  }

  // Fallback to 'both' for unknown groups
  return VISIBILITY.BOTH;
}
