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
import { addProjectMember } from './projectService';
import { createNotification, shouldNotifyUser } from './notificationService';

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
 * TODO: Integrate with Firebase Extensions (Trigger Email) or SendGrid
 * @param {string} email - Recipient email
 * @param {string} token - Invitation token
 * @param {string} projectId - Project ID
 * @param {string} group - Group being invited to ('consulting' | 'client')
 */
async function sendInvitationEmail(email, token, projectId, group) {
  // Placeholder for email notification
  // In production, this would integrate with:
  // - Firebase Extensions: Trigger Email extension
  // - OR SendGrid/other email service

  const inviteLink = `${window.location.origin}/invite/${token}`;
  const groupName = group === 'consulting' ? 'Consulting Group' : 'Client Group';

  console.log('Email notification placeholder:', {
    to: email,
    subject: `You've been invited to collaborate on a project (${groupName})`,
    inviteLink,
    projectId,
    group: groupName
  });

  // TODO: Implement actual email sending when email service is configured
  // Example with Firebase Extensions:
  // await addDoc(collection(db, 'mail'), {
  //   to: email,
  //   message: {
  //     subject: 'You\'ve been invited to collaborate on a project',
  //     html: `<p>Click here to accept: <a href="${inviteLink}">${inviteLink}</a></p>`
  //   }
  // });
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

    // Send email notification (placeholder)
    try {
      await sendInvitationEmail(email, token, projectId, group);
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
    await addProjectMember(invitation.projectId, userId, invitation.role, invitation.invitedBy, invitation.group || 'client');

    // Update invitation status
    const invitationRef = doc(db, 'invitations', invitation.id);
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });

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
