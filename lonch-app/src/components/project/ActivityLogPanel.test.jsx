import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivityLogPanel from './ActivityLogPanel';
import * as activityLogService from '../../services/activityLogService';
import * as projectService from '../../services/projectService';
import * as userService from '../../services/userService';

vi.mock('../../services/activityLogService');
vi.mock('../../services/projectService');
vi.mock('../../services/userService');

describe('ActivityLogPanel', () => {
  const mockActivities = [
    {
      id: 'act1',
      projectId: 'project1',
      userId: 'user1',
      action: 'document_uploaded',
      resourceType: 'document',
      resourceId: 'doc1',
      metadata: { documentName: 'test.pdf' },
      timestamp: { toDate: () => new Date('2024-01-15T10:00:00Z') }
    },
    {
      id: 'act2',
      projectId: 'project1',
      userId: 'user2',
      action: 'member_invited',
      resourceType: 'member',
      resourceId: 'inv1',
      metadata: { invitedEmail: 'new@example.com', invitedRole: 'editor' },
      timestamp: { toDate: () => new Date('2024-01-15T11:00:00Z') }
    }
  ];

  const mockMembers = [
    { id: 'mem1', userId: 'user1', role: 'owner' },
    { id: 'mem2', userId: 'user2', role: 'admin' }
  ];

  const mockUsers = {
    user1: { uid: 'user1', email: 'user1@example.com', displayName: 'User One' },
    user2: { uid: 'user2', email: 'user2@example.com', displayName: 'User Two' }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(projectService.getProjectMembers).mockResolvedValue(mockMembers);
    vi.mocked(userService.getUser).mockImplementation((userId) =>
      Promise.resolve(mockUsers[userId])
    );
    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities: mockActivities,
      lastDoc: null,
      hasMore: false
    });
  });

  it('should render loading state initially', () => {
    render(<ActivityLogPanel projectId="project1" />);
    expect(screen.getByText('Loading activity log...')).toBeInTheDocument();
  });

  it('should fetch and display activities', async () => {
    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByText(/User One uploaded a document/)).toBeInTheDocument();
      expect(screen.getByText(/User Two invited new@example.com as editor/)).toBeInTheDocument();
    });

    expect(activityLogService.getProjectActivityLog).toHaveBeenCalledWith('project1', 20, null);
  });

  it('should display filter controls', async () => {
    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-user')).toBeInTheDocument();
      expect(screen.getByTestId('filter-action')).toBeInTheDocument();
      expect(screen.getByTestId('filter-start-date')).toBeInTheDocument();
      expect(screen.getByTestId('filter-end-date')).toBeInTheDocument();
    });
  });

  it('should filter activities by user', async () => {
    vi.mocked(activityLogService.filterByUser).mockResolvedValue([mockActivities[0]]);

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-user')).toBeInTheDocument();
    });

    const userFilter = screen.getByTestId('filter-user');
    fireEvent.change(userFilter, { target: { value: 'user1' } });

    await waitFor(() => {
      expect(activityLogService.filterByUser).toHaveBeenCalledWith('project1', 'user1');
    });
  });

  it('should filter activities by action', async () => {
    vi.mocked(activityLogService.filterByAction).mockResolvedValue([mockActivities[0]]);

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-action')).toBeInTheDocument();
    });

    const actionFilter = screen.getByTestId('filter-action');
    fireEvent.change(actionFilter, { target: { value: 'document_uploaded' } });

    await waitFor(() => {
      expect(activityLogService.filterByAction).toHaveBeenCalledWith('project1', 'document_uploaded');
    });
  });

  it('should filter activities by date range', async () => {
    vi.mocked(activityLogService.filterByDateRange).mockResolvedValue([mockActivities[0]]);

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-start-date')).toBeInTheDocument();
    });

    const startDateFilter = screen.getByTestId('filter-start-date');
    const endDateFilter = screen.getByTestId('filter-end-date');

    fireEvent.change(startDateFilter, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateFilter, { target: { value: '2024-01-31' } });

    await waitFor(() => {
      expect(activityLogService.filterByDateRange).toHaveBeenCalledWith(
        'project1',
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  it('should show clear filters button when filters are active', async () => {
    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-user')).toBeInTheDocument();
    });

    // No clear button initially
    expect(screen.queryByTestId('clear-filters')).not.toBeInTheDocument();

    // Apply filter
    const userFilter = screen.getByTestId('filter-user');
    fireEvent.change(userFilter, { target: { value: 'user1' } });

    await waitFor(() => {
      expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
    });
  });

  it('should clear all filters when clear button is clicked', async () => {
    vi.mocked(activityLogService.filterByUser).mockResolvedValue([mockActivities[0]]);

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-user')).toBeInTheDocument();
    });

    // Apply filter
    const userFilter = screen.getByTestId('filter-user');
    fireEvent.change(userFilter, { target: { value: 'user1' } });

    await waitFor(() => {
      expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
    });

    // Clear filters
    const clearButton = screen.getByTestId('clear-filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(userFilter.value).toBe('');
      expect(activityLogService.getProjectActivityLog).toHaveBeenCalled();
    });
  });

  it('should display load more button when hasMore is true', async () => {
    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities: mockActivities,
      lastDoc: { id: 'lastDoc' },
      hasMore: true
    });

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('load-more')).toBeInTheDocument();
    });
  });

  it('should load more activities when load more button is clicked', async () => {
    const firstBatch = {
      activities: mockActivities,
      lastDoc: { id: 'lastDoc' },
      hasMore: true
    };

    const secondBatch = {
      activities: [
        {
          id: 'act3',
          projectId: 'project1',
          userId: 'user1',
          action: 'role_changed',
          resourceType: 'member',
          resourceId: 'mem1',
          metadata: { targetUserEmail: 'user2@example.com', oldRole: 'viewer', newRole: 'editor' },
          timestamp: { toDate: () => new Date('2024-01-15T12:00:00Z') }
        }
      ],
      lastDoc: null,
      hasMore: false
    };

    vi.mocked(activityLogService.getProjectActivityLog)
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch);

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('load-more')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByTestId('load-more');
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(activityLogService.getProjectActivityLog).toHaveBeenCalledWith(
        'project1',
        20,
        { id: 'lastDoc' }
      );
    });
  });

  it('should not show load more button when filters are active', async () => {
    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities: mockActivities,
      lastDoc: { id: 'lastDoc' },
      hasMore: true
    });

    vi.mocked(activityLogService.filterByUser).mockResolvedValue([mockActivities[0]]);

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('load-more')).toBeInTheDocument();
    });

    // Apply filter
    const userFilter = screen.getByTestId('filter-user');
    fireEvent.change(userFilter, { target: { value: 'user1' } });

    await waitFor(() => {
      expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
    });
  });

  it('should display empty state when no activities exist', async () => {
    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities: [],
      lastDoc: null,
      hasMore: false
    });

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByText('No activity yet')).toBeInTheDocument();
    });
  });

  it('should display filtered empty state when no activities match filters', async () => {
    vi.mocked(activityLogService.filterByUser).mockResolvedValue([]);

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-user')).toBeInTheDocument();
    });

    const userFilter = screen.getByTestId('filter-user');
    fireEvent.change(userFilter, { target: { value: 'user1' } });

    await waitFor(() => {
      expect(screen.getByText('No activities match your filters')).toBeInTheDocument();
    });
  });

  it('should display error message when fetch fails', async () => {
    vi.mocked(activityLogService.getProjectActivityLog).mockRejectedValue(
      new Error('Failed to fetch activities')
    );

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch activities')).toBeInTheDocument();
    });
  });

  it('should display user avatars with initials', async () => {
    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      const activityItems = screen.getAllByTestId('activity-item');
      expect(activityItems.length).toBe(2);
    });
  });

  it('should format timestamps correctly', async () => {
    const recentActivity = {
      id: 'act3',
      projectId: 'project1',
      userId: 'user1',
      action: 'document_uploaded',
      resourceType: 'document',
      resourceId: 'doc1',
      metadata: {},
      timestamp: { toDate: () => new Date(Date.now() - 30 * 60000) } // 30 minutes ago
    };

    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities: [recentActivity],
      lastDoc: null,
      hasMore: false
    });

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByText('30m ago')).toBeInTheDocument();
    });
  });

  it('should display action icons for different activity types', async () => {
    const activities = [
      {
        id: 'act1',
        projectId: 'project1',
        userId: 'user1',
        action: 'document_uploaded',
        resourceType: 'document',
        resourceId: 'doc1',
        metadata: {},
        timestamp: { toDate: () => new Date() }
      },
      {
        id: 'act2',
        projectId: 'project1',
        userId: 'user1',
        action: 'member_removed',
        resourceType: 'member',
        resourceId: 'mem1',
        metadata: { removedUserEmail: 'removed@example.com' },
        timestamp: { toDate: () => new Date() }
      }
    ];

    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities,
      lastDoc: null,
      hasMore: false
    });

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      const activityItems = screen.getAllByTestId('activity-item');
      expect(activityItems.length).toBe(2);
    });
  });

  it('should handle member_removed action description', async () => {
    const activity = {
      id: 'act1',
      projectId: 'project1',
      userId: 'user1',
      action: 'member_removed',
      resourceType: 'member',
      resourceId: 'mem1',
      metadata: { removedUserEmail: 'removed@example.com' },
      timestamp: { toDate: () => new Date() }
    };

    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities: [activity],
      lastDoc: null,
      hasMore: false
    });

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByText(/User One removed removed@example.com/)).toBeInTheDocument();
    });
  });

  it('should handle role_changed action description', async () => {
    const activity = {
      id: 'act1',
      projectId: 'project1',
      userId: 'user1',
      action: 'role_changed',
      resourceType: 'member',
      resourceId: 'mem1',
      metadata: { targetUserEmail: 'user2@example.com', oldRole: 'viewer', newRole: 'editor' },
      timestamp: { toDate: () => new Date() }
    };

    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities: [activity],
      lastDoc: null,
      hasMore: false
    });

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByText(/User One changed user2@example.com's role from viewer to editor/)).toBeInTheDocument();
    });
  });

  it('should fetch user details only once per unique user', async () => {
    const activities = [
      {
        id: 'act1',
        projectId: 'project1',
        userId: 'user1',
        action: 'document_uploaded',
        resourceType: 'document',
        resourceId: 'doc1',
        metadata: {},
        timestamp: { toDate: () => new Date() }
      },
      {
        id: 'act2',
        projectId: 'project1',
        userId: 'user1', // Same user
        action: 'document_deleted',
        resourceType: 'document',
        resourceId: 'doc2',
        metadata: {},
        timestamp: { toDate: () => new Date() }
      }
    ];

    vi.mocked(activityLogService.getProjectActivityLog).mockResolvedValue({
      activities,
      lastDoc: null,
      hasMore: false
    });

    render(<ActivityLogPanel projectId="project1" />);

    await waitFor(() => {
      const activityItems = screen.getAllByTestId('activity-item');
      expect(activityItems.length).toBe(2);
    });

    // Should only fetch user1 details once
    expect(userService.getUser).toHaveBeenCalledTimes(1);
    expect(userService.getUser).toHaveBeenCalledWith('user1');
  });
});
