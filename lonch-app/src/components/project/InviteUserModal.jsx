import { useState } from 'react';
import PropTypes from 'prop-types';
import { createInvitation } from '../../services/invitationService';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { getRoleDisplayName } from '../../utils/permissions';
import { GROUP } from '../../utils/groupPermissions';
import { logActivity } from '../../services/activityLogService';

export default function InviteUserModal({ projectId, isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const permissions = useProjectPermissions(projectId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [group, setGroup] = useState(GROUP.CLIENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail(email) {
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  async function handleInvite(e) {
    e.preventDefault();

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    // Validate group permissions (Task 3.3)
    // Only Owner/Admin can invite to Consulting Group
    if (group === GROUP.CONSULTING && !permissions.canMoveUserBetweenGroups()) {
      setError('Only Owner and Admin can invite users to the Consulting Group');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invitation = await createInvitation(
        projectId,
        email,
        role,
        currentUser.uid,
        group
      );

      // Log the activity
      try {
        await logActivity(
          projectId,
          currentUser.uid,
          'member_invited',
          'member',
          invitation.id,
          {
            invitedEmail: email,
            invitedRole: role,
            invitedGroup: group,
            invitationId: invitation.id
          },
          group
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
        // Don't fail the operation if logging fails
      }

      // Generate shareable invite link
      const link = `${window.location.origin}/invite/${invitation.token}`;
      setInviteLink(link);

      // Call success callback
      if (onSuccess) {
        onSuccess(invitation);
      }
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setEmail('');
    setRole('viewer');
    setGroup(GROUP.CLIENT);
    setError(null);
    setInviteLink(null);
    onClose();
  }

  function getGroupDisplayName(groupValue) {
    return groupValue === GROUP.CONSULTING ? 'Consulting Group' : 'Client Group';
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {inviteLink ? (
          // Success state with invite link
          <>
            <h3 className="text-lg font-semibold mb-4">Invitation Sent!</h3>
            <p className="text-gray-600 mb-4">
              Invitation sent to <strong>{email}</strong> as <strong>{getRoleDisplayName(role)}</strong> in the <strong>{getGroupDisplayName(group)}</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shareable Invite Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  data-testid="invite-link"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  data-testid="copy-link-button"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          // Invitation form
          <>
            <h3 className="text-lg font-semibold mb-4">Invite User to Project</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                  data-testid="email-input"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                  data-testid="role-select"
                >
                  {permissions.assignableRoles.map(r => (
                    <option key={r} value={r}>
                      {getRoleDisplayName(r)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
                  Group
                </label>
                <select
                  id="group"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                  data-testid="group-select"
                >
                  <option value={GROUP.CLIENT}>Client Group</option>
                  <option value={GROUP.CONSULTING}>Consulting Group</option>
                </select>
                {group === GROUP.CONSULTING && !permissions.canMoveUserBetweenGroups() && (
                  <p className="mt-2 text-sm text-amber-600">
                    Only Owner and Admin can invite to the Consulting Group
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" data-testid="error-message">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  disabled={loading}
                  data-testid="invite-button"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

InviteUserModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};
