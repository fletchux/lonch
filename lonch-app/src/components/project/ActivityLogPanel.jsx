import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getProjectActivityLog, filterByUser, filterByAction, filterByDateRange } from '../../services/activityLogService';
import { getProjectMembers } from '../../services/projectService';
import { getUser } from '../../services/userService';
import GroupBadge from './GroupBadge';

export default function ActivityLogPanel({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Filter states (Task 6.3: Add group filter)
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Available action types for filtering (Task 6.2)
  const actionTypes = [
    { value: 'document_uploaded', label: 'Document Uploaded' },
    { value: 'document_deleted', label: 'Document Deleted' },
    { value: 'document_visibility_changed', label: 'Document Visibility Changed' },
    { value: 'member_invited', label: 'Member Invited' },
    { value: 'member_removed', label: 'Member Removed' },
    { value: 'role_changed', label: 'Role Changed' },
    { value: 'member_moved_to_group', label: 'Member Moved to Group' },
    { value: 'project_created', label: 'Project Created' },
    { value: 'project_updated', label: 'Project Updated' },
    { value: 'project_deleted', label: 'Project Deleted' }
  ];

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, filterUser, filterAction, filterGroup, filterStartDate, filterEndDate]);

  async function fetchMembers() {
    try {
      const projectMembers = await getProjectMembers(projectId);
      setMembers(projectMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }

  async function fetchActivities(loadMore = false) {
    try {
      setLoading(true);
      setError(null);

      let result;

      // Apply filters if any are set
      if (filterUser) {
        const filteredActivities = await filterByUser(projectId, filterUser);
        result = { activities: filteredActivities, lastDoc: null, hasMore: false };
      } else if (filterAction) {
        const filteredActivities = await filterByAction(projectId, filterAction);
        result = { activities: filteredActivities, lastDoc: null, hasMore: false };
      } else if (filterStartDate && filterEndDate) {
        const startDate = new Date(filterStartDate);
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        const filteredActivities = await filterByDateRange(projectId, startDate, endDate);
        result = { activities: filteredActivities, lastDoc: null, hasMore: false };
      } else {
        // No filters, use pagination
        result = await getProjectActivityLog(projectId, 20, loadMore ? lastDoc : null);
      }

      // Fetch user details for activities
      const uniqueUserIds = [...new Set(result.activities.map(a => a.userId))];
      const details = { ...userDetails };

      for (const userId of uniqueUserIds) {
        if (!details[userId]) {
          try {
            const user = await getUser(userId);
            if (user) {
              details[userId] = user;
            }
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
          }
        }
      }

      setUserDetails(details);

      // Task 6.4: Filter by group on client-side (since Firestore doesn't have a filterByGroup query)
      let filteredActivities = result.activities;
      if (filterGroup) {
        filteredActivities = result.activities.filter(activity => activity.groupContext === filterGroup);
      }

      if (loadMore) {
        setActivities([...activities, ...filteredActivities]);
      } else {
        setActivities(filteredActivities);
      }

      setLastDoc(result.lastDoc || null);
      setHasMore(result.hasMore || false);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    fetchActivities(true);
  }

  function handleClearFilters() {
    setFilterUser('');
    setFilterAction('');
    setFilterGroup('');
    setFilterStartDate('');
    setFilterEndDate('');
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown time';

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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Task 6.2, 6.6: Update descriptions to include group context
  function getActionDescription(activity) {
    const user = userDetails[activity.userId];
    const userName = user?.displayName || user?.email || 'Unknown user';
    const groupName = activity.metadata?.invitedGroup === 'consulting' ? 'Consulting Group' :
                      activity.metadata?.invitedGroup === 'client' ? 'Client Group' : '';

    switch (activity.action) {
      case 'document_uploaded':
        return `${userName} uploaded a document${activity.metadata?.documentName ? `: ${activity.metadata.documentName}` : ''}`;
      case 'document_deleted':
        return `${userName} deleted a document${activity.metadata?.documentName ? `: ${activity.metadata.documentName}` : ''}`;
      case 'document_visibility_changed':
        return `${userName} changed visibility of ${activity.metadata?.documentName || 'a document'}`;
      case 'member_invited':
        return `${userName} invited ${activity.metadata?.invitedEmail || 'a user'} as ${activity.metadata?.invitedRole || 'member'}${groupName ? ` to ${groupName}` : ''}`;
      case 'member_removed':
        return `${userName} removed ${activity.metadata?.removedUserEmail || 'a member'}`;
      case 'role_changed':
        return `${userName} changed ${activity.metadata?.targetUserEmail || 'a member'}'s role from ${activity.metadata?.oldRole || '?'} to ${activity.metadata?.newRole || '?'}`;
      case 'member_moved_to_group':
        const oldGroup = activity.metadata?.oldGroup === 'consulting' ? 'Consulting' : 'Client';
        const newGroup = activity.metadata?.newGroup === 'consulting' ? 'Consulting' : 'Client';
        return `${userName} moved ${activity.metadata?.targetUserEmail || 'a member'} from ${oldGroup} Group to ${newGroup} Group`;
      case 'project_created':
        return `${userName} created the project`;
      case 'project_updated':
        return `${userName} updated the project`;
      case 'project_deleted':
        return `${userName} deleted the project`;
      default:
        return `${userName} performed ${activity.action}`;
    }
  }

  function getActionIcon(action) {
    switch (action) {
      case 'document_uploaded':
        return '📄';
      case 'document_deleted':
        return '🗑️';
      case 'document_visibility_changed':
        return '👁️';
      case 'member_invited':
        return '✉️';
      case 'member_removed':
        return '👋';
      case 'role_changed':
        return '🔄';
      case 'member_moved_to_group':
        return '↔️';
      case 'project_created':
        return '🎉';
      case 'project_updated':
        return '✏️';
      case 'project_deleted':
        return '❌';
      default:
        return '📌';
    }
  }

  const hasActiveFilters = filterUser || filterAction || filterGroup || filterStartDate || filterEndDate;

  if (loading && activities.length === 0) {
    return <div className="text-center py-8">Loading activity log...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls (Task 6.3: Add group filter) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Filter by User */}
          <div>
            <label htmlFor="filter-user" className="block text-xs font-medium text-gray-600 mb-1">
              User
            </label>
            <select
              id="filter-user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              data-testid="filter-user"
            >
              <option value="">All users</option>
              {members.map(member => {
                const user = userDetails[member.userId];
                return (
                  <option key={member.userId} value={member.userId}>
                    {user?.displayName || user?.email || member.userId}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter by Action */}
          <div>
            <label htmlFor="filter-action" className="block text-xs font-medium text-gray-600 mb-1">
              Action
            </label>
            <select
              id="filter-action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              data-testid="filter-action"
            >
              <option value="">All actions</option>
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Group (Task 6.3) */}
          <div>
            <label htmlFor="filter-group" className="block text-xs font-medium text-gray-600 mb-1">
              Group
            </label>
            <select
              id="filter-group"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              data-testid="filter-group"
            >
              <option value="">All Groups</option>
              <option value="consulting">Consulting Group</option>
              <option value="client">Client Group</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="filter-start-date" className="block text-xs font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="filter-start-date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              data-testid="filter-start-date"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="filter-end-date" className="block text-xs font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="filter-end-date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              data-testid="filter-end-date"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="mt-3 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 border border-teal-200 rounded-md"
            data-testid="clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {hasActiveFilters ? 'No activities match your filters' : 'No activity yet'}
          </div>
        ) : (
          activities.map((activity) => {
            const user = userDetails[activity.userId];

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="activity-item"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Activity Content (Task 6.2: Add groupContext display) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{getActionIcon(activity.action)}</span>
                    <p className="text-sm text-gray-900">
                      {getActionDescription(activity)}
                    </p>
                    {/* Task 6.5: Show group badge where relevant */}
                    {activity.groupContext && (
                      <GroupBadge group={activity.groupContext} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {hasMore && !hasActiveFilters && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="load-more"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

ActivityLogPanel.propTypes = {
  projectId: PropTypes.string.isRequired
};
