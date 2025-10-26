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
};

// Document visibility constants
export const VISIBILITY = {
  CONSULTING_ONLY: 'consulting_only',
  CLIENT_ONLY: 'client_only',
  BOTH: 'both'
};

/**
 * Check if a user can view a document based on their group and document visibility
 * @param {string} userGroup - User's group ('consulting' | 'client')
 * @param {string} documentVisibility - Document visibility ('consulting_only' | 'client_only' | 'both')
 * @param {string} userRole - User's role ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns {boolean} True if user can view the document
 */
export function canViewDocument(userGroup, documentVisibility, userRole = null) {
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
 * @param {string} userRole - User's role ('owner' | 'admin' | 'editor' | 'viewer')
 * @param {string} userGroup - User's group ('consulting' | 'client') - parameter kept for API consistency
 * @returns {boolean} True if user can set document visibility
 */
// eslint-disable-next-line no-unused-vars
export function canSetDocumentVisibility(userRole, userGroup) {
  // Owner and Admin from any group can set document visibility
  return userRole === 'owner' || userRole === 'admin';
}

/**
 * Check if a user can move users between groups
 * Only Owner/Admin can move users between groups
 * @param {string} userRole - User's role ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns {boolean} True if user can move users between groups
 */
export function canMoveUserBetweenGroups(userRole) {
  return userRole === 'owner' || userRole === 'admin';
}

/**
 * Get default document visibility based on user's group
 * Consulting Group → 'consulting_only'
 * Client Group → 'both'
 * @param {string} userGroup - User's group ('consulting' | 'client')
 * @returns {string} Default visibility ('consulting_only' | 'client_only' | 'both')
 */
export function getDefaultDocumentVisibility(userGroup) {
  if (userGroup === GROUP.CONSULTING) {
    return VISIBILITY.CONSULTING_ONLY;
  }

  if (userGroup === GROUP.CLIENT) {
    return VISIBILITY.BOTH;
  }

  // Fallback to 'both' for unknown groups
  return VISIBILITY.BOTH;
}
