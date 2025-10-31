import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getInviteLink, acceptInviteLink } from '../../services/inviteLinkService';
import { getInvitation, acceptInvitation } from '../../services/invitationService';
import { getProject } from '../../services/projectService';
import { getUser } from '../../services/userService';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from './GroupBadge';
import lonchLogo from '../../assets/lonch_logo.svg';
import { ROLES } from '../../utils/permissions';
import { GROUP } from '../../utils/groupPermissions';

interface InviteLinkData {
  projectId: string;
  role: typeof ROLES[keyof typeof ROLES];
  group: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
  expiresAt: any; // Firestore Timestamp or Date
  status: 'active' | 'used' | 'revoked' | 'pending' | 'accepted' | 'cancelled' | 'declined';
  createdBy?: string;
  invitedBy?: string;
  [key: string]: any;
}

interface ProjectData {
  name: string;
  [key: string]: any;
}

interface UserData {
  displayName?: string;
  email?: string;
  [key: string]: any;
}

interface AcceptInviteLinkPageProps {
  token: string;
  onAccepted?: (projectId: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
}

export default function AcceptInviteLinkPage({
  token,
  onAccepted,
  onNavigateToLogin,
  onNavigateToHome
}: AcceptInviteLinkPageProps) {
  const { currentUser } = useAuth();
  const [link, setLink] = useState<InviteLinkData | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [creator, setCreator] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchLinkDetails() {
    try {
      setLoading(true);
      setError(null);

      // Bug #16 fix: Handle both shareable link tokens and email invitation tokens
      // Shareable links start with "link_", email invitations start with "inv_"
      let linkData;
      if (token.startsWith('inv_')) {
        // Email invitation token - look in invitations collection
        linkData = await getInvitation(token);
      } else {
        // Shareable link token - look in inviteLinks collection
        linkData = await getInviteLink(token);
      }

      if (!linkData) {
        setError('Invite link not found. It may have been deleted or is invalid.');
        setLoading(false);
        return;
      }

      setLink(linkData);

      // Fetch project details
      try {
        const projectData = await getProject(linkData.projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        // Continue even if project fetch fails
      }

      // Fetch creator details
      // Bug #16 fix: Email invitations use 'invitedBy', shareable links use 'createdBy'
      const creatorId = linkData.invitedBy || linkData.createdBy;
      if (creatorId) {
        try {
          const creatorData = await getUser(creatorId);
          setCreator(creatorData);
        } catch (err) {
          console.error('Error fetching creator:', err);
          // Continue even if creator fetch fails
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching link details:', err);
      setError((err as Error).message || 'Failed to load invite link details');
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!currentUser || !link) {
      // Redirect to login
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      // Bug #16 fix: Use correct acceptance method based on token type
      if (token.startsWith('inv_')) {
        // Email invitation - use invitation service
        await acceptInvitation(token, currentUser.uid);
      } else {
        // Shareable link - use invite link service
        await acceptInviteLink(token, currentUser.uid);
      }

      // Notify parent component
      if (onAccepted) {
        onAccepted(link.projectId);
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError((err as Error).message || 'Failed to accept invitation');
      setAccepting(false);
    }
  }

  function handleDecline() {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  }

  function formatExpirationDate(date: any): string {
    const expirationDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return expirationDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function isLinkExpired(): boolean {
    if (!link) return false;
    const now = new Date();
    const expiresAt = link.expiresAt instanceof Date ? link.expiresAt :
                      link.expiresAt.toDate ? link.expiresAt.toDate() :
                      new Date(link.expiresAt);
    return now > expiresAt;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <img src={lonchLogo} alt="lonch" className="h-10 mb-6" />
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={handleDecline}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <img src={lonchLogo} alt="lonch" className="h-10 mb-6" />

          <h1 className="text-2xl font-bold text-gray-900 mb-2">You've Been Invited!</h1>
          {project && (
            <p className="text-gray-600 mb-6">
              Join <strong className="text-teal-600">{project.name}</strong>
            </p>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-700">
              Log in or sign up to accept this invitation
            </p>
          </div>

          <button
            onClick={onNavigateToLogin}
            className="w-full px-4 py-2 bg-[#2D9B9B] text-white rounded-md hover:bg-[#267d7d] transition-colors"
            data-testid="login-button"
          >
            Log in or Sign up
          </button>
        </div>
      </div>
    );
  }

  if (!link) {
    return null;
  }

  // Show link status errors
  const linkExpired = isLinkExpired();
  // Bug #16 fix: Handle both status types - email invitations use 'pending'/'accepted', shareable links use 'active'/'used'
  const linkUsed = link.status === 'used' || link.status === 'accepted';
  const linkRevoked = link.status === 'revoked' || link.status === 'cancelled';
  const linkInvalid = link.status === 'declined';

  if (linkExpired || linkUsed || linkRevoked || linkInvalid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <img src={lonchLogo} alt="lonch" className="h-10 mb-6" />

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800 font-medium mb-2">
              {linkExpired && 'This invite has expired'}
              {linkUsed && 'This invite has already been used'}
              {linkRevoked && 'This invite has been revoked'}
              {linkInvalid && 'This invite has been declined'}
            </p>
            <p className="text-yellow-700 text-sm">
              {linkExpired && `This link expired on ${formatExpirationDate(link.expiresAt)}`}
              {linkUsed && 'Someone has already accepted this invitation'}
              {linkRevoked && 'The link creator has revoked this invitation'}
              {linkInvalid && 'This invitation was declined'}
            </p>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Please contact the project owner to request a new invitation.
          </p>

          <button
            onClick={handleDecline}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show accept invitation page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <img src={lonchLogo} alt="lonch" className="h-10 mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You've Been Invited!</h1>

        {project && (
          <p className="text-lg text-gray-700 mb-6">
            Join <strong className="text-teal-600">{project.name}</strong>
          </p>
        )}

        {/* Invitation Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Invited by</p>
            <p className="font-medium text-gray-900">
              {creator ? (creator.displayName || creator.email) : 'Loading...'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">You will join as</p>
            <div className="flex items-center gap-2">
              <RoleBadge role={link.role} />
              <span className="text-gray-400">in</span>
              <GroupBadge group={link.group} />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Link expires</p>
            <p className="text-sm text-gray-700">{formatExpirationDate(link.expiresAt)}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full px-4 py-3 bg-[#2D9B9B] text-white rounded-md hover:bg-[#267d7d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            data-testid="accept-button"
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>

          <button
            onClick={handleDecline}
            disabled={accepting}
            className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            data-testid="decline-button"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
