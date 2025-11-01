import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectMembers, updateMemberRole, removeMember, updateMemberGroup } from '../../services/projectService';
import { getUser } from '../../services/userService';
import { getProjectPendingInvitations, cancelInvitation } from '../../services/invitationService';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { ROLES, getRoleDisplayName } from '../../utils/permissions';
import { GROUP } from '../../utils/groupPermissions';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from './GroupBadge';
import { logActivity } from '../../services/activityLogService';
import { createNotification, shouldNotifyUser } from '../../services/notificationService';
import ShareLinksTab from './ShareLinksTab';

interface Member {
  id: string;
  userId: string;
  role: typeof ROLES[keyof typeof ROLES];
  group?: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
  lastActiveAt?: any; // Firestore Timestamp
  [key: string]: any;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: typeof ROLES[keyof typeof ROLES];
  group?: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
  createdAt: any; // Firestore Timestamp
  expiresAt: any; // Firestore Timestamp
  [key: string]: any;
}

interface UserDetail {
  displayName?: string;
  email?: string;
  [key: string]: any;
}

interface RoleChangeConfirmation {
  member: Member;
  newRole: typeof ROLES[keyof typeof ROLES];
}

interface GroupChangeConfirmation {
  member: Member;
  newGroup: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
}

interface ProjectMembersPanelProps {
  projectId: string;
}

export default function ProjectMembersPanel({ projectId }: ProjectMembersPanelProps) {
  const { currentUser } = useAuth();
  const permissions = useProjectPermissions(projectId);
  const [activeTab, setActiveTab] = useState<'members' | 'shareLinks'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [memberDetails, setMemberDetails] = useState<Record<string, UserDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | typeof GROUP.CONSULTING | typeof GROUP.CLIENT>('all');
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<RoleChangeConfirmation | null>(null);
  const [confirmGroupChange, setConfirmGroupChange] = useState<GroupChangeConfirmation | null>(null);
  const [confirmCancelInvite, setConfirmCancelInvite] = useState<PendingInvitation | null>(null);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Bug #16 fix: Refetch members when Members tab becomes active
  // This ensures newly invited members appear without requiring page refresh
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Refresh members list when window gains focus
  // This handles the case where invitations are accepted in another tab/browser
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'members') {
        fetchMembers();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchMembers() {
    try {
      setLoading(true);
      setError(null);

      // Fetch both actual members and pending invitations
      const [projectMembers, pending] = await Promise.all([
        getProjectMembers(projectId),
        getProjectPendingInvitations(projectId)
      ]);

      setMembers(projectMembers);
      setPendingInvitations(pending);

      // Fetch user details for each member
      const details: Record<string, UserDetail> = {};
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
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(member: Member, newRole: string) {
    if (!permissions.canChangeRole(member.role)) {
      alert('You do not have permission to change this user\'s role');
      return;
    }

    setConfirmRoleChange({ member, newRole: newRole as typeof ROLES[keyof typeof ROLES] });
  }

  async function confirmRoleChangeAction() {
    if (!confirmRoleChange || !currentUser) return;

    const { member, newRole } = confirmRoleChange;
    const oldRole = member.role;
    try {
      await updateMemberRole(projectId, member.userId, newRole);

      // Log the activity
      try {
        await logActivity(
          projectId,
          currentUser.uid,
          'role_changed',
          'member',
          member.userId,
          {
            targetUserId: member.userId,
            targetUserEmail: memberDetails[member.userId]?.email,
            oldRole,
            newRole
          }
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
        // Don't fail the operation if logging fails
      }

      // Send notification to the user whose role was changed
      try {
        const shouldNotify = await shouldNotifyUser(member.userId, 'role_change');
        if (shouldNotify) {
          await createNotification(
            member.userId,
            'role_change',
            `Your role has been changed from ${getRoleDisplayName(oldRole)} to ${getRoleDisplayName(newRole)}`,
            `/projects/${projectId}`,
            projectId
          );
        }
      } catch (notificationError) {
        console.error('Failed to create notification for role change:', notificationError);
        // Don't fail the operation if notification fails
      }

      await fetchMembers();
      setConfirmRoleChange(null);
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role: ' + (err as Error).message);
    }
  }

  async function handleRemoveMember(member: Member) {
    if (!permissions.canRemoveMember(member.role, member.userId)) {
      alert('You do not have permission to remove this user');
      return;
    }

    setConfirmRemove(member);
  }

  async function confirmRemoveAction() {
    if (!confirmRemove || !currentUser) return;

    try {
      await removeMember(projectId, confirmRemove.userId);

      // Log the activity
      try {
        await logActivity(
          projectId,
          currentUser.uid,
          'member_removed',
          'member',
          confirmRemove.userId,
          {
            removedUserId: confirmRemove.userId,
            removedUserEmail: memberDetails[confirmRemove.userId]?.email,
            removedUserRole: confirmRemove.role
          }
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
        // Don't fail the operation if logging fails
      }

      await fetchMembers();
      setConfirmRemove(null);
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove member: ' + (err as Error).message);
    }
  }

  async function handleGroupChange(member: Member, newGroup: string) {
    if (!permissions.canMoveUserBetweenGroups()) {
      alert('You do not have permission to change user groups');
      return;
    }

    setConfirmGroupChange({ member, newGroup: newGroup as typeof GROUP.CONSULTING | typeof GROUP.CLIENT });
  }

  async function confirmGroupChangeAction() {
    if (!confirmGroupChange || !currentUser) return;

    const { member, newGroup } = confirmGroupChange;
    const oldGroup = member.group || 'consulting';
    try {
      await updateMemberGroup(projectId, member.userId, newGroup);

      // Log the activity
      try {
        await logActivity(
          projectId,
          currentUser.uid,
          'member_moved_to_group',
          'member',
          member.userId,
          {
            targetUserId: member.userId,
            targetUserEmail: memberDetails[member.userId]?.email,
            oldGroup,
            newGroup
          },
          newGroup
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }

      // Send notification to the user whose group was changed
      try {
        const shouldNotify = await shouldNotifyUser(member.userId, 'group_change');
        if (shouldNotify) {
          const oldGroupName = oldGroup === GROUP.CONSULTING ? 'Consulting Group' : 'Client Group';
          const newGroupName = newGroup === GROUP.CONSULTING ? 'Consulting Group' : 'Client Group';
          await createNotification(
            member.userId,
            'group_change',
            `You have been moved from ${oldGroupName} to ${newGroupName}. Your document visibility has been updated.`,
            `/projects/${projectId}`,
            projectId
          );
        }
      } catch (notificationError) {
        console.error('Failed to create notification for group change:', notificationError);
        // Don't fail the operation if notification fails
      }

      await fetchMembers();
      setConfirmGroupChange(null);
    } catch (err) {
      console.error('Error updating group:', err);
      alert('Failed to update group: ' + (err as Error).message);
    }
  }

  async function handleCancelInvite(invitation: PendingInvitation) {
    setConfirmCancelInvite(invitation);
  }

  async function confirmCancelInviteAction() {
    if (!confirmCancelInvite || !currentUser) return;

    try {
      await cancelInvitation(confirmCancelInvite.id);

      // Log the activity
      try {
        await logActivity(
          projectId,
          currentUser.uid,
          'invitation_cancelled',
          'invitation',
          confirmCancelInvite.id,
          {
            invitedEmail: confirmCancelInvite.email,
            invitedRole: confirmCancelInvite.role,
            invitedGroup: confirmCancelInvite.group
          },
          confirmCancelInvite.group
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }

      await fetchMembers();
      setConfirmCancelInvite(null);
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      alert('Failed to cancel invitation: ' + (err as Error).message);
    }
  }

  // Filter members based on search term and group
  const filteredMembers = members.filter(member => {
    // Group filter
    if (groupFilter !== 'all') {
      const memberGroup = member.group || 'consulting';
      if (memberGroup !== groupFilter) return false;
    }

    // Search filter
    if (!searchTerm) return true;
    const userDetails = memberDetails[member.userId];
    const searchLower = searchTerm.toLowerCase();
    return (
      userDetails?.displayName?.toLowerCase().includes(searchLower) ||
      userDetails?.email?.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  // Filter pending invitations based on search term and group
  const filteredPendingInvitations = pendingInvitations.filter(invitation => {
    // Group filter
    if (groupFilter !== 'all') {
      const inviteGroup = invitation.group || 'consulting';
      if (inviteGroup !== groupFilter) return false;
    }

    // Search filter
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      invitation.email.toLowerCase().includes(searchLower) ||
      invitation.role.toLowerCase().includes(searchLower)
    );
  });

  // Calculate total count (members + pending)
  const totalCount = members.length + pendingInvitations.length;

  // Format last active time
  function formatLastActive(timestamp: any): string {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Only show loading/error for members tab
  if (loading && activeTab === 'members') {
    return <div className="text-center py-8">Loading members...</div>;
  }

  if (error && activeTab === 'members') {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" data-testid="members-tabs">
          <button
            onClick={() => setActiveTab('members')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'members'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            data-testid="members-tab"
          >
            Members ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('shareLinks')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'shareLinks'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            data-testid="share-links-tab"
          >
            Share Links
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && (
        <>
          {/* Refresh Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={fetchMembers}
              disabled={loading}
              className="px-3 py-1 text-sm text-teal-600 hover:bg-teal-50 border border-teal-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="refresh-members-button"
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {/* Search/Filter */}
          <div className="mb-4 space-y-2">
        {members.length > 5 && (
          <input
            type="text"
            placeholder="Search members by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        )}
        <div className="flex gap-2">
          <label className="text-sm font-medium text-gray-700">Group:</label>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as typeof groupFilter)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500"
            data-testid="group-filter"
          >
            <option value="all">All Groups</option>
            <option value={GROUP.CONSULTING}>Consulting Group</option>
            <option value={GROUP.CLIENT}>Client Group</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.length === 0 && filteredPendingInvitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No members found matching your search' : 'No members yet'}
          </div>
        ) : (
          <>
          {/* Active Members */}
          {filteredMembers.map(member => {
            const userDetails = memberDetails[member.userId];
            const isCurrentUser = member.userId === currentUser?.uid;
            const canChangeThisRole = permissions.canChangeRole(member.role);
            const canRemoveThis = permissions.canRemoveMember(member.role, member.userId);

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {userDetails?.displayName || 'Unknown User'}
                        {isCurrentUser && (
                          <span className="text-sm text-gray-500 ml-2">(You)</span>
                        )}
                      </h4>
                      <GroupBadge group={member.group || 'consulting'} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userDetails?.email || 'No email'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Last active: {formatLastActive(member.lastActiveAt)}
                    </p>
                  </div>

                  {/* Role Badge/Dropdown */}
                  <div className="flex items-center gap-2">
                    {canChangeThisRole && !isCurrentUser ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member, e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700"
                        data-testid="role-select"
                      >
                        {permissions.assignableRoles.map((role: string) => (
                          <option key={role} value={role}>
                            {getRoleDisplayName(role)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}

                    {/* Group Dropdown */}
                    {permissions.canMoveUserBetweenGroups() && !isCurrentUser && (
                      <select
                        value={member.group || 'consulting'}
                        onChange={(e) => handleGroupChange(member, e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700"
                        data-testid="group-select"
                      >
                        <option value={GROUP.CONSULTING}>Consulting</option>
                        <option value={GROUP.CLIENT}>Client</option>
                      </select>
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
          })}

          {/* Pending Invitations */}
          {filteredPendingInvitations.map(invitation => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                  {invitation.email[0].toUpperCase()}
                </div>

                {/* Invitation Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {invitation.email}
                    </h4>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      Pending
                    </span>
                    <GroupBadge group={invitation.group || 'consulting'} />
                  </div>
                  <p className="text-sm text-gray-500">
                    Invited {new Date(invitation.createdAt?.seconds * 1000 || invitation.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Expires: {invitation.expiresAt?.seconds
                      ? new Date(invitation.expiresAt.seconds * 1000).toLocaleDateString()
                      : invitation.expiresAt instanceof Date
                        ? invitation.expiresAt.toLocaleDateString()
                        : new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2">
                  <RoleBadge role={invitation.role} />
                </div>

                {/* Cancel Button */}
                {permissions.canInvite && (
                  <button
                    onClick={() => handleCancelInvite(invitation)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    data-testid="cancel-invite-button"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          </>
        )}
      </div>

      {/* Role Change Confirmation Dialog */}
      {confirmRoleChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Role Change</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Removal</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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

      {/* Group Change Confirmation Dialog */}
      {confirmGroupChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Group Change</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Move <strong>{memberDetails[confirmGroupChange.member.userId]?.displayName}</strong> from{' '}
              <strong>{confirmGroupChange.member.group === GROUP.CONSULTING ? 'Consulting' : 'Client'} Group</strong> to{' '}
              <strong>{confirmGroupChange.newGroup === GROUP.CONSULTING ? 'Consulting' : 'Client'} Group</strong>?
              This will change their document visibility.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmGroupChange(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmGroupChangeAction}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                data-testid="confirm-group-change"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Share Links Tab */}
      {activeTab === 'shareLinks' && (
        <ShareLinksTab projectId={projectId} />
      )}

      {/* Cancel Invitation Confirmation Dialog */}
      {confirmCancelInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Cancel Invitation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cancel invitation for <strong>{confirmCancelInvite.email}</strong>?
              They will no longer be able to use this invitation link.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmCancelInvite(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
              >
                Keep Invitation
              </button>
              <button
                onClick={confirmCancelInviteAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                data-testid="confirm-cancel-invite"
              >
                Cancel Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
