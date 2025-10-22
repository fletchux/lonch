import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { addProjectMember, getProjectMembers } from './projectService';
import { logActivity } from './activityLogService';

/**
 * Invite Link Service
 *
 * Manages shareable invite links for project collaboration.
 * Collection structure:
 *   - inviteLinks/{linkId}
 *
 * Invite link document schema:
 * {
 *   id: string (linkId),
 *   token: string (unique, cryptographically secure),
 *   projectId: string,
 *   role: 'owner' | 'admin' | 'editor' | 'viewer',
 *   group: 'consulting' | 'client',
 *   createdBy: string (userId of creator),
 *   createdAt: timestamp,
 *   expiresAt: timestamp (7 days from creation),
 *   status: 'active' | 'used' | 'revoked',
 *   acceptedBy: string | null (userId who accepted),
 *   acceptedAt: timestamp | null
 * }
 */

/**
 * Generate a cryptographically secure invite link token
 * @returns {string} Unique secure token
 */
function generateSecureToken() {
  // Generate 32 random bytes and convert to hex string
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `link_${token}`;
}

/**
 * Calculate expiration date (7 days from now)
 * @returns {Date} Expiration date
 */
function calculateExpirationDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  return expiresAt;
}

/**
 * Generate a shareable invite link
 * @param {string} projectId - Project ID
 * @param {string} role - Role to assign ('owner' | 'admin' | 'editor' | 'viewer')
 * @param {string} group - Group to assign ('consulting' | 'client')
 * @param {string} createdBy - User ID of link creator
 * @returns {Promise<Object>} The created invite link with full URL
 */
export async function generateInviteLink(projectId, role, group, createdBy) {
  try {
    const token = generateSecureToken();
    const linkId = `${projectId}_${role}_${group}_${Date.now()}`;
    const linkRef = doc(db, 'inviteLinks', linkId);

    const linkData = {
      id: linkId,
      token,
      projectId,
      role,
      group,
      createdBy,
      status: 'active',
      expiresAt: calculateExpirationDate(),
      createdAt: serverTimestamp(),
      acceptedBy: null,
      acceptedAt: null
    };

    await setDoc(linkRef, linkData);

    // Log activity
    try {
      await logActivity(
        projectId,
        createdBy,
        'invite_link_created',
        'invite_link',
        linkId,
        {
          role,
          group,
          tokenPreview: token.substring(token.length - 8) // Last 8 chars only for security
        },
        group
      );
    } catch (logError) {
      console.error('Failed to log invite link creation:', logError);
      // Don't fail link creation if logging fails
    }

    // Generate full URL
    const fullUrl = `${window.location.origin}/invite/${token}`;

    return {
      ...linkData,
      url: fullUrl
    };
  } catch (error) {
    console.error('Error generating invite link:', error);
    throw new Error(`Failed to generate invite link: ${error.message}`);
  }
}

/**
 * Get an invite link by token
 * @param {string} token - Invite link token
 * @returns {Promise<Object|null>} Invite link document or null if not found
 */
export async function getInviteLink(token) {
  try {
    const linksRef = collection(db, 'inviteLinks');
    const q = query(linksRef, where('token', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Return the first matching link
    let link = null;
    querySnapshot.forEach((doc) => {
      link = doc.data();
    });

    return link;
  } catch (error) {
    console.error('Error getting invite link:', error);
    throw new Error(`Failed to get invite link: ${error.message}`);
  }
}

/**
 * Get all invite links for a project (filtered by user permissions)
 * @param {string} projectId - Project ID
 * @param {string} userId - Current user ID
 * @param {string} userRole - Current user's role in project ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns {Promise<Array>} Array of invite link documents
 */
export async function getProjectInviteLinks(projectId, userId, userRole) {
  try {
    const linksRef = collection(db, 'inviteLinks');
    let q;

    // Owner and Admin can see all links, others only see their own
    if (userRole === 'owner' || userRole === 'admin') {
      q = query(
        linksRef,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        linksRef,
        where('projectId', '==', projectId),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);

    const links = [];
    querySnapshot.forEach((doc) => {
      links.push(doc.data());
    });

    return links;
  } catch (error) {
    console.error('Error getting project invite links:', error);
    throw new Error(`Failed to get project invite links: ${error.message}`);
  }
}

/**
 * Accept an invite link and add user to project
 * @param {string} token - Invite link token
 * @param {string} userId - User ID accepting the link
 * @returns {Promise<Object>} The project ID and role assigned
 */
export async function acceptInviteLink(token, userId) {
  try {
    const link = await getInviteLink(token);

    if (!link) {
      throw new Error('Invite link not found');
    }

    // Validate link status
    if (link.status !== 'active') {
      if (link.status === 'used') {
        throw new Error('This invite link has already been used');
      } else if (link.status === 'revoked') {
        throw new Error('This invite link has been revoked');
      } else {
        throw new Error(`Invite link is ${link.status}`);
      }
    }

    // Check if link has expired
    const now = new Date();
    const expiresAt = link.expiresAt.toDate ? link.expiresAt.toDate() : new Date(link.expiresAt);
    if (now > expiresAt) {
      throw new Error('This invite link has expired');
    }

    // Check if user is already a member of the project
    const projectMembers = await getProjectMembers(link.projectId);
    const existingMember = projectMembers.find(member => member.userId === userId);
    if (existingMember) {
      throw new Error('You are already a member of this project');
    }

    // Add user to project with specified role and group
    await addProjectMember(link.projectId, userId, link.role, link.createdBy, link.group);

    // Update link status to 'used'
    const linkRef = doc(db, 'inviteLinks', link.id);
    await updateDoc(linkRef, {
      status: 'used',
      acceptedBy: userId,
      acceptedAt: serverTimestamp()
    });

    // Log activity
    try {
      await logActivity(
        link.projectId,
        userId,
        'invite_link_accepted',
        'invite_link',
        link.id,
        {
          role: link.role,
          group: link.group,
          linkCreator: link.createdBy
        },
        link.group
      );
    } catch (logError) {
      console.error('Failed to log invite link acceptance:', logError);
      // Don't fail link acceptance if logging fails
    }

    return {
      projectId: link.projectId,
      role: link.role,
      group: link.group
    };
  } catch (error) {
    console.error('Error accepting invite link:', error);
    throw error; // Re-throw to preserve specific error messages
  }
}

/**
 * Revoke an invite link
 * @param {string} linkId - Invite link ID
 * @param {string} revokedBy - User ID revoking the link
 * @returns {Promise<void>}
 */
export async function revokeInviteLink(linkId, revokedBy) {
  try {
    const linkRef = doc(db, 'inviteLinks', linkId);
    const linkDoc = await getDoc(linkRef);

    if (!linkDoc.exists()) {
      throw new Error('Invite link not found');
    }

    const link = linkDoc.data();

    if (link.status !== 'active') {
      throw new Error(`Cannot revoke link that is ${link.status}`);
    }

    await updateDoc(linkRef, {
      status: 'revoked'
    });

    // Log activity
    try {
      await logActivity(
        link.projectId,
        revokedBy,
        'invite_link_revoked',
        'invite_link',
        linkId,
        {
          role: link.role,
          group: link.group,
          originalCreator: link.createdBy
        },
        link.group
      );
    } catch (logError) {
      console.error('Failed to log invite link revocation:', logError);
      // Don't fail revocation if logging fails
    }
  } catch (error) {
    console.error('Error revoking invite link:', error);
    throw new Error(`Failed to revoke invite link: ${error.message}`);
  }
}
