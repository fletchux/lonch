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
  serverTimestamp
} from 'firebase/firestore';
import { addProjectMember, getProject } from './projectService';
import { createNotification, shouldNotifyUser } from './notificationService';
import { getUser } from './userService';
import { sendInvitationEmail as sendEmail } from './emailService';

/**
 * Invitation Service
 *
 * Manages project invitations in Firestore.
 * Collection structure:
 *   - invitations/{invitationId}
 *
 * Invitation document schema:
 * {
 *   id: string (invitationId),
 *   projectId: string,
 *   email: string,
 *   role: 'owner' | 'admin' | 'editor' | 'viewer',
 *   group: 'consulting' | 'client',
 *   invitedBy: string (userId of inviter),
 *   token: string (unique invitation token),
 *   status: 'pending' | 'accepted' | 'declined' | 'cancelled',
 *   expiresAt: timestamp (7 days from creation),
 *   createdAt: timestamp,
 *   acceptedAt: timestamp | null,
 *   declinedAt: timestamp | null
 * }
 */

/**
 * Generate a unique invitation token
 * @returns {string} Unique token string
 */
function generateInvitationToken() {
  return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
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
 * Send email notification for invitation
 * Uses emailService to queue email via Firebase Extensions
 * @param {Object} invitation - Invitation object with email, role, group, token, projectId, expiresAt
 * @param {string} inviterUserId - User ID of person sending invitation
 * @returns {Promise<void>}
 */
async function sendInvitationEmail(invitation, inviterUserId) {
  try {
    // Get project and inviter information
    const [project, inviter] = await Promise.all([
      getProject(invitation.projectId),
      getUser(inviterUserId)
    ]);

    if (!project || !inviter) {
      throw new Error('Project or inviter not found');
    }

    const inviterName = inviter.displayName || inviter.email || 'A team member';
    const projectName = project.name || 'a project';

    // Send email using email service
    await sendEmail(invitation, inviterName, projectName);

    console.log('Invitation email sent successfully:', {
      to: invitation.email,
      projectId: invitation.projectId,
      role: invitation.role,
      group: invitation.group
    });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Create a new project invitation
 * @param {string} projectId - Project ID
 * @param {string} email - Email address of invitee
 * @param {string} role - Role to assign ('owner' | 'admin' | 'editor' | 'viewer')
 * @param {string} invitedBy - User ID of the person sending the invitation
 * @param {string} group - Group to assign ('consulting' | 'client'), defaults to 'client'
 * @returns {Promise<Object>} The created invitation document
 */
export async function createInvitation(projectId, email, role, invitedBy, group = 'client') {
  try {
    // Check for existing pending invitation
    const existingInvitations = await getUserInvitations(email);
    const existingPendingInvite = existingInvitations.find(
      inv => inv.projectId === projectId && inv.status === 'pending'
    );

    if (existingPendingInvite) {
      throw new Error('User already has a pending invitation for this project');
    }

    const invitationId = `${projectId}_${email}_${Date.now()}`;
    const token = generateInvitationToken();
    const invitationRef = doc(db, 'invitations', invitationId);

    const invitationData = {
      id: invitationId,
      projectId,
      email: email.toLowerCase(),
      role,
      group,
      invitedBy,
      token,
      status: 'pending',
      expiresAt: calculateExpirationDate(),
      createdAt: serverTimestamp(),
      acceptedAt: null,
      declinedAt: null
    };

    await setDoc(invitationRef, invitationData);

    // Send email notification
    // Always send email for new invitations - user may not have an account yet
    // If they have an account and preferences, those are checked in emailService
    try {
      await sendInvitationEmail(invitationData, invitedBy);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation creation if email fails
    }

    return invitationData;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw new Error(`Failed to create invitation: ${error.message}`);
  }
}

/**
 * Get an invitation by token
 * @param {string} token - Invitation token
 * @returns {Promise<Object|null>} Invitation document or null if not found
 */
export async function getInvitation(token) {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('token', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Return the first matching invitation
    let invitation = null;
    querySnapshot.forEach((doc) => {
      invitation = doc.data();
    });

    return invitation;
  } catch (error) {
    console.error('Error getting invitation:', error);
    throw new Error(`Failed to get invitation: ${error.message}`);
  }
}

/**
 * Get all invitations for a user by email
 * @param {string} email - User's email address
 * @returns {Promise<Array>} Array of invitation documents
 */
export async function getUserInvitations(email) {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    const invitations = [];
    querySnapshot.forEach((doc) => {
      invitations.push(doc.data());
    });

    return invitations;
  } catch (error) {
    console.error('Error getting user invitations:', error);
    throw new Error(`Failed to get user invitations: ${error.message}`);
  }
}

/**
 * Get all pending invitations for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of pending invitation documents
 */
export async function getProjectPendingInvitations(projectId) {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(
      invitationsRef,
      where('projectId', '==', projectId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);

    const invitations = [];
    querySnapshot.forEach((doc) => {
      invitations.push(doc.data());
    });

    return invitations;
  } catch (error) {
    console.error('Error getting project pending invitations:', error);
    throw new Error(`Failed to get project pending invitations: ${error.message}`);
  }
}

/**
 * Accept an invitation and add user to project
 * @param {string} token - Invitation token
 * @param {string} userId - User ID accepting the invitation
 * @returns {Promise<void>}
 */
export async function acceptInvitation(token, userId) {
  try {
    const invitation = await getInvitation(token);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is ${invitation.status}, cannot accept`);
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = invitation.expiresAt.toDate ? invitation.expiresAt.toDate() : new Date(invitation.expiresAt);
    if (now > expiresAt) {
      throw new Error('Invitation has expired');
    }

    // Add user to project members with group
    console.log('Adding user to project:', {
      projectId: invitation.projectId,
      userId,
      role: invitation.role,
      group: invitation.group || 'client'
    });
    await addProjectMember(invitation.projectId, userId, invitation.role, invitation.invitedBy, invitation.group || 'client');
    console.log('User successfully added to project');

    // Update invitation status
    const invitationRef = doc(db, 'invitations', invitation.id);
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });
    console.log('Invitation status updated to accepted');

    // Send notification to the person who sent the invitation
    try {
      const shouldNotify = await shouldNotifyUser(invitation.invitedBy, 'invitation');
      if (shouldNotify) {
        const groupName = invitation.group === 'consulting' ? 'Consulting Group' : 'Client Group';
        await createNotification(
          invitation.invitedBy,
          'invitation',
          `${invitation.email} accepted your invitation to join as ${invitation.role} in ${groupName}`,
          `/projects/${invitation.projectId}`,
          invitation.projectId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create notification for invitation acceptance:', notificationError);
      // Don't fail the invitation acceptance if notification fails
    }
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw new Error(`Failed to accept invitation: ${error.message}`);
  }
}

/**
 * Decline an invitation
 * @param {string} token - Invitation token
 * @returns {Promise<void>}
 */
export async function declineInvitation(token) {
  try {
    const invitation = await getInvitation(token);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is ${invitation.status}, cannot decline`);
    }

    const invitationRef = doc(db, 'invitations', invitation.id);
    await updateDoc(invitationRef, {
      status: 'declined',
      declinedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    throw new Error(`Failed to decline invitation: ${error.message}`);
  }
}

/**
 * Cancel an invitation (for owners/admins)
 * @param {string} invitationId - Invitation ID
 * @returns {Promise<void>}
 */
export async function cancelInvitation(invitationId) {
  try {
    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);

    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = invitationDoc.data();

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is ${invitation.status}, cannot cancel`);
    }

    await updateDoc(invitationRef, {
      status: 'cancelled'
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    throw new Error(`Failed to cancel invitation: ${error.message}`);
  }
}
