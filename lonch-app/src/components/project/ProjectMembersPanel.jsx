import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectMembers, updateMemberRole, removeMember } from '../../services/projectService';
import { getUser } from '../../services/userService';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { ROLES, getRoleDisplayName } from '../../utils/permissions';
import RoleBadge from '../shared/RoleBadge';

export default function ProjectMembersPanel({ projectId }) {
  const { currentUser } = useAuth();
  const permissions = useProjectPermissions(projectId);
  const [members, setMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState(null);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchMembers() {
    try {
      setLoading(true);
      setError(null);
      const projectMembers = await getProjectMembers(projectId);
      setMembers(projectMembers);

      // Fetch user details for each member
      const details = {};
      for (const member of projectMembers) {
        try {
          const userInfo = await getUser(member.userId);
          if (userInfo) {
            details[member.userId] = userInfo;
          }
        } catch (err) {
          console.error(`Error fetching user ${member.userId}:`, err);
        }
      }
      setMemberDetails(details);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(member, newRole) {
    if (!permissions.canChangeRole(member.role)) {
      alert('You do not have permission to change this user\'s role');
      return;
    }

    setConfirmRoleChange({ member, newRole });
  }

  async function confirmRoleChangeAction() {
    const { member, newRole } = confirmRoleChange;
    try {
      await updateMemberRole(projectId, member.userId, newRole);
      await fetchMembers();
      setConfirmRoleChange(null);
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role: ' + err.message);
    }
  }

  async function handleRemoveMember(member) {
    if (!permissions.canRemoveMember(member.role, member.userId)) {
      alert('You do not have permission to remove this user');
      return;
    }

    setConfirmRemove(member);
  }

  async function confirmRemoveAction() {
    try {
      await removeMember(projectId, confirmRemove.userId);
      await fetchMembers();
      setConfirmRemove(null);
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove member: ' + err.message);
    }
  }

  // Filter members based on search term
  const filteredMembers = members.filter(member => {
    if (!searchTerm) return true;
    const userDetails = memberDetails[member.userId];
    const searchLower = searchTerm.toLowerCase();
    return (
      userDetails?.displayName?.toLowerCase().includes(searchLower) ||
      userDetails?.email?.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  // Format last active time
  function formatLastActive(timestamp) {
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

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search/Filter */}
      {members.length > 5 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search members by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No members found matching your search' : 'No members yet'}
          </div>
        ) : (
          filteredMembers.map(member => {
            const userDetails = memberDetails[member.userId];
            const isCurrentUser = member.userId === currentUser?.uid;
            const canChangeThisRole = permissions.canChangeRole(member.role);
            const canRemoveThis = permissions.canRemoveMember(member.role, member.userId);

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                    {userDetails?.displayName?.[0]?.toUpperCase() ||
                     userDetails?.email?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {userDetails?.displayName || 'Unknown User'}
                        {isCurrentUser && (
                          <span className="text-sm text-gray-500 ml-2">(You)</span>
                        )}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500">{userDetails?.email || 'No email'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last active: {formatLastActive(member.lastActiveAt)}
                    </p>
                  </div>

                  {/* Role Badge/Dropdown */}
                  <div className="flex items-center gap-2">
                    {canChangeThisRole && !isCurrentUser ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500"
                        data-testid="role-select"
                      >
                        {permissions.assignableRoles.map(role => (
                          <option key={role} value={role}>
                            {getRoleDisplayName(role)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </div>

                  {/* Remove Button */}
                  {canRemoveThis && !isCurrentUser && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-md"
                      data-testid="remove-button"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Role Change Confirmation Dialog */}
      {confirmRoleChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Role Change</h3>
            <p className="text-gray-600 mb-4">
              Change {memberDetails[confirmRoleChange.member.userId]?.displayName}'s role from{' '}
              <strong>{getRoleDisplayName(confirmRoleChange.member.role)}</strong> to{' '}
              <strong>{getRoleDisplayName(confirmRoleChange.newRole)}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmRoleChange(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChangeAction}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                data-testid="confirm-role-change"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Removal</h3>
            <p className="text-gray-600 mb-4">
              Remove <strong>{memberDetails[confirmRemove.userId]?.displayName}</strong> from this project?
              They will lose all access immediately.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmRemove(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                data-testid="confirm-remove"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ProjectMembersPanel.propTypes = {
  projectId: PropTypes.string.isRequired
};
