import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { getInviteLink, acceptInviteLink } from '../../services/inviteLinkService';
import { getProject } from '../../services/projectService';
import { getUser } from '../../services/userService';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from './GroupBadge';
import lonchLogo from '../../assets/lonch_logo.svg';

export default function AcceptInviteLinkPage({ token, onAccepted, onNavigateToLogin, onNavigateToHome }) {
  const { currentUser } = useAuth();
  const [link, setLink] = useState(null);
  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLinkDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchLinkDetails() {
    try {
      setLoading(true);
      setError(null);

      // Fetch link details
      const linkData = await getInviteLink(token);

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
      try {
        const creatorData = await getUser(linkData.createdBy);
        setCreator(creatorData);
      } catch (err) {
        console.error('Error fetching creator:', err);
        // Continue even if creator fetch fails
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching link details:', err);
      setError(err.message || 'Failed to load invite link details');
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!currentUser) {
      // Redirect to login
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      await acceptInviteLink(token, currentUser.uid);

      // Notify parent component
      if (onAccepted) {
        onAccepted(link.projectId);
      }
    } catch (err) {
      console.error('Error accepting invite link:', err);
      setError(err.message || 'Failed to accept invitation');
      setAccepting(false);
    }
  }

  function handleDecline() {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  }

  function formatExpirationDate(date) {
    const expirationDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return expirationDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function isLinkExpired() {
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

  // Show link status errors
  const linkExpired = isLinkExpired();
  const linkUsed = link.status === 'used';
  const linkRevoked = link.status === 'revoked';

  if (linkExpired || linkUsed || linkRevoked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <img src={lonchLogo} alt="lonch" className="h-10 mb-6" />

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800 font-medium mb-2">
              {linkExpired && 'This invite link has expired'}
              {linkUsed && 'This invite link has already been used'}
              {linkRevoked && 'This invite link has been revoked'}
            </p>
            <p className="text-yellow-700 text-sm">
              {linkExpired && `This link expired on ${formatExpirationDate(link.expiresAt)}`}
              {linkUsed && 'Someone has already accepted this invitation'}
              {linkRevoked && 'The link creator has revoked this invitation'}
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

AcceptInviteLinkPage.propTypes = {
  token: PropTypes.string.isRequired,
  onAccepted: PropTypes.func,
  onNavigateToLogin: PropTypes.func,
  onNavigateToHome: PropTypes.func
};
