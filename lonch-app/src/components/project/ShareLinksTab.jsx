import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectInviteLinks, revokeInviteLink } from '../../services/inviteLinkService';
import { getUser } from '../../services/userService';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from './GroupBadge';
import GenerateLinkModal from './GenerateLinkModal';

export default function ShareLinksTab({ projectId }) {
  const { currentUser } = useAuth();
  const permissions = useProjectPermissions(projectId);
  const [links, setLinks] = useState([]);
  const [linkCreators, setLinkCreators] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(null);

  useEffect(() => {
    // Only fetch links after permissions have loaded
    if (!permissions.loading && permissions.role) {
      fetchLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, permissions.loading, permissions.role]);

  async function fetchLinks() {
    if (!currentUser || !permissions.role) return;

    try {
      setLoading(true);
      setError(null);
      const inviteLinks = await getProjectInviteLinks(projectId, currentUser.uid, permissions.role);
      setLinks(inviteLinks);

      // Fetch creator details for each link
      const creators = {};
      for (const link of inviteLinks) {
        if (!creators[link.createdBy]) {
          try {
            const userInfo = await getUser(link.createdBy);
            if (userInfo) {
              creators[link.createdBy] = userInfo;
            }
          } catch (err) {
            console.error(`Error fetching user ${link.createdBy}:`, err);
          }
        }
      }
      setLinkCreators(creators);
    } catch (err) {
      console.error('Error fetching invite links:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRevoke(link) {
    if (link.status !== 'active') {
      return;
    }
    setConfirmRevoke(link);
  }

  async function confirmRevokeAction() {
    try {
      await revokeInviteLink(confirmRevoke.id, currentUser.uid);
      await fetchLinks();
      setConfirmRevoke(null);
    } catch (err) {
      console.error('Error revoking link:', err);
      alert('Failed to revoke link: ' + err.message);
    }
  }

  function handleLinkGenerated() {
    setShowGenerateModal(false);
    fetchLinks();
  }

  // Format timestamp to relative time
  function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Format expiration date
  function formatExpirationDate(timestamp) {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMs < 0) return 'Expired';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  }

  // Get status badge
  function getStatusBadge(link) {
    const expiresAt = link.expiresAt.toDate ? link.expiresAt.toDate() : new Date(link.expiresAt);
    const isExpired = new Date() > expiresAt;

    if (isExpired) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Expired</span>;
    }
    if (link.status === 'used') {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Used</span>;
    }
    if (link.status === 'revoked') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Revoked</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>;
  }

  // Check if link can be revoked
  function canRevokeLink(link) {
    if (link.status !== 'active') return false;
    // Owner/Admin can revoke any link, others can only revoke their own
    if (permissions.role === 'owner' || permissions.role === 'admin') return true;
    return link.createdBy === currentUser?.uid;
  }

  if (loading) {
    return <div className="text-center py-8">Loading invite links...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Share invite links with specific roles and groups. Links are single-use and expire in 7 days.
        </p>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 bg-[#2D9B9B] text-white rounded-lg hover:bg-[#267d7d] transition-colors text-sm font-medium"
          data-testid="generate-link-button"
        >
          + Generate Link
        </button>
      </div>

      {/* Links Table */}
      {links.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No invite links yet. Generate one to get started.</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-[#2D9B9B] text-white rounded-lg hover:bg-[#267d7d] transition-colors text-sm font-medium"
          >
            Generate First Link
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" data-testid="links-table">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Group</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created By</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Expires</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => {
                const creator = linkCreators[link.createdBy];
                const isCurrentUser = link.createdBy === currentUser?.uid;

                return (
                  <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <RoleBadge role={link.role} />
                    </td>
                    <td className="py-3 px-4">
                      <GroupBadge group={link.group} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                          {creator?.displayName?.[0]?.toUpperCase() ||
                           creator?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {creator?.displayName || 'Unknown'}
                            {isCurrentUser && <span className="text-gray-500 ml-1">(You)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatRelativeTime(link.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatExpirationDate(link.expiresAt)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(link)}
                    </td>
                    <td className="py-3 px-4">
                      {canRevokeLink(link) && (
                        <button
                          onClick={() => handleRevoke(link)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-md"
                          data-testid="revoke-button"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Link Modal */}
      {showGenerateModal && (
        <GenerateLinkModal
          projectId={projectId}
          onClose={() => setShowGenerateModal(false)}
          onLinkGenerated={handleLinkGenerated}
        />
      )}

      {/* Revoke Confirmation Dialog */}
      {confirmRevoke && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Revocation</h3>
            <p className="text-gray-600 mb-4">
              Revoke this invite link? It will no longer be usable.
            </p>
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <RoleBadge role={confirmRevoke.role} />
                <span className="text-gray-400">in</span>
                <GroupBadge group={confirmRevoke.group} />
              </div>
              <p className="text-xs text-gray-500">
                Created {formatRelativeTime(confirmRevoke.createdAt)}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmRevoke(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevokeAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                data-testid="confirm-revoke"
              >
                Revoke Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ShareLinksTab.propTypes = {
  projectId: PropTypes.string.isRequired
};
