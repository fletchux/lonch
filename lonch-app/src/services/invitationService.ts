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
  FieldValue
} from 'firebase/firestore';
import { addProjectMember, getProject } from './projectService';
import { createNotification, shouldNotifyUser } from './notificationService';
import { getUser } from './userService';
import { sendInvitationEmail as sendEmail, Invitation as EmailInvitation } from './emailService';

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

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface Invitation {
  id: string;
  projectId: string;
  email: string;
  role: string;
  group: string;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date | any;
  createdAt: FieldValue | any;
  acceptedAt: FieldValue | any | null;
  declinedAt: FieldValue | any | null;
}

/**
 * Generate a unique invitation token
 */
function generateInvitationToken(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Calculate expiration date (7 days from now)
 */
function calculateExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  return expiresAt;
}

/**
 * Send email notification for invitation
 * Uses emailService to queue email via Firebase Extensions
 */
async function sendInvitationEmail(invitation: Invitation, inviterUserId: string): Promise<void> {
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

    // Convert invitation to EmailInvitation format
    const emailInvitation: EmailInvitation = {
      email: invitation.email,
      role: invitation.role,
      group: invitation.group,
      token: invitation.token,
      projectId: invitation.projectId,
      expiresAt: invitation.expiresAt
    };

    // Send email using email service
    await sendEmail(emailInvitation, inviterName, projectName);

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
 */
export async function createInvitation(
  projectId: string,
  email: string,
  role: string,
  invitedBy: string,
  group: string = 'client'
): Promise<Invitation> {
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

    const invitationData: Invitation = {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating invitation:', error);
    throw new Error(`Failed to create invitation: ${message}`);
  }
}

/**
 * Get an invitation by token
 */
export async function getInvitation(token: string): Promise<Invitation | null> {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('token', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Return the first matching invitation
    let invitation: Invitation | null = null;
    querySnapshot.forEach((doc) => {
      invitation = doc.data() as Invitation;
    });

    return invitation;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting invitation:', error);
    throw new Error(`Failed to get invitation: ${message}`);
  }
}

/**
 * Get all invitations for a user by email
 */
export async function getUserInvitations(email: string): Promise<Invitation[]> {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    const invitations: Invitation[] = [];
    querySnapshot.forEach((doc) => {
      invitations.push(doc.data() as Invitation);
    });

    return invitations;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting user invitations:', error);
    throw new Error(`Failed to get user invitations: ${message}`);
  }
}

/**
 * Get all pending invitations for a project
 */
export async function getProjectPendingInvitations(projectId: string): Promise<Invitation[]> {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(
      invitationsRef,
      where('projectId', '==', projectId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);

    const invitations: Invitation[] = [];
    querySnapshot.forEach((doc) => {
      invitations.push(doc.data() as Invitation);
    });

    return invitations;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting project pending invitations:', error);
    throw new Error(`Failed to get project pending invitations: ${message}`);
  }
}

/**
 * Accept an invitation and add user to project
 */
export async function acceptInvitation(token: string, userId: string): Promise<void> {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error accepting invitation:', error);
    throw new Error(`Failed to accept invitation: ${message}`);
  }
}

/**
 * Decline an invitation
 */
export async function declineInvitation(token: string): Promise<void> {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error declining invitation:', error);
    throw new Error(`Failed to decline invitation: ${message}`);
  }
}

/**
 * Cancel an invitation (for owners/admins)
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  try {
    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);

    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = invitationDoc.data() as Invitation;

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is ${invitation.status}, cannot cancel`);
    }

    await updateDoc(invitationRef, {
      status: 'cancelled'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error cancelling invitation:', error);
    throw new Error(`Failed to cancel invitation: ${message}`);
  }
}
