import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NotificationBell from './NotificationBell';
import * as notificationService from '../../services/notificationService';

// Mock the AuthContext
const mockCurrentUser = { uid: 'user123' };
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: mockCurrentUser })
}));

// Mock the notification service
vi.mock('../../services/notificationService', () => ({
  getUserNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  getUnreadNotificationCount: vi.fn()
}));

describe('NotificationBell', () => {
  const mockNotifications = [
    {
      id: 'notif1',
      userId: 'user123',
      type: 'invitation',
      message: 'You have been invited to a project',
      link: '/projects/proj1',
      projectId: 'proj1',
      read: false,
      createdAt: new Date()
    },
    {
      id: 'notif2',
      userId: 'user123',
      type: 'role_change',
      message: 'Your role has been changed to Admin',
      link: '/projects/proj2',
      projectId: 'proj2',
      read: true,
      createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 'notif3',
      userId: 'user123',
      type: 'group_change',
      message: 'You have been moved to Consulting Group',
      link: '/projects/proj3',
      projectId: 'proj3',
      read: false,
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    notificationService.getUnreadNotificationCount.mockResolvedValue(2);
    notificationService.getUserNotifications.mockResolvedValue(mockNotifications);
    notificationService.markNotificationAsRead.mockResolvedValue();
  });

  describe('Rendering', () => {
    it('should render notification bell icon', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });
    });

    it('should display unread count badge', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('unread-badge')).toBeInTheDocument();
      });

      expect(screen.getByTestId('unread-badge')).toHaveTextContent('2');
    });

    it('should not display badge when no unread notifications', async () => {
      notificationService.getUnreadNotificationCount.mockResolvedValue(0);

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
    });

    it('should display "99+" for unread count over 99', async () => {
      notificationService.getUnreadNotificationCount.mockResolvedValue(150);

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('unread-badge')).toHaveTextContent('99+');
      });
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when bell is clicked', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
      });
    });

    it('should close dropdown when bell is clicked again', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      // Open
      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
      });

      // Close
      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should fetch notifications when dropdown is opened', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(notificationService.getUserNotifications).toHaveBeenCalledWith('user123', false, 10);
      });
    });

    it('should display notifications in dropdown', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByText('You have been invited to a project')).toBeInTheDocument();
      });

      expect(screen.getByText('Your role has been changed to Admin')).toBeInTheDocument();
      expect(screen.getByText('You have been moved to Consulting Group')).toBeInTheDocument();
    });

    it('should fetch and display notifications after opening dropdown', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      // Notifications should be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('You have been invited to a project')).toBeInTheDocument();
      });
    });

    it('should show empty state when no notifications', async () => {
      notificationService.getUserNotifications.mockResolvedValue([]);

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      });
    });
  });

  describe('Notification Click', () => {
    it('should mark notification as read when clicked', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByText('You have been invited to a project')).toBeInTheDocument();
      });

      const notificationItems = screen.getAllByTestId('notification-item');
      fireEvent.click(notificationItems[0]); // Click first unread notification

      await waitFor(() => {
        expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith('notif1');
      });
    });

    it('should not mark already-read notification as read again', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByText('Your role has been changed to Admin')).toBeInTheDocument();
      });

      const notificationItems = screen.getAllByTestId('notification-item');
      fireEvent.click(notificationItems[1]); // Click already-read notification

      await waitFor(() => {
        // Should not call markNotificationAsRead for already-read notification
        expect(notificationService.markNotificationAsRead).not.toHaveBeenCalled();
      });
    });

    it('should decrement unread count when notification is marked as read', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('unread-badge')).toHaveTextContent('2');
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByText('You have been invited to a project')).toBeInTheDocument();
      });

      const notificationItems = screen.getAllByTestId('notification-item');
      fireEvent.click(notificationItems[0]); // Mark first as read

      await waitFor(() => {
        expect(screen.getByTestId('unread-badge')).toHaveTextContent('1');
      });
    });
  });

  describe('Polling', () => {
    it('should fetch unread count on mount', async () => {
      render(<NotificationBell />);

      // Initial call
      await waitFor(() => {
        expect(notificationService.getUnreadNotificationCount).toHaveBeenCalledWith('user123');
      });

      expect(notificationService.getUnreadNotificationCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timestamp Formatting', () => {
    it('should format recent timestamps correctly', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByText('Just now')).toBeInTheDocument();
      });

      expect(screen.getByText('1h ago')).toBeInTheDocument();
      expect(screen.getByText('1d ago')).toBeInTheDocument();
    });
  });

  describe('View All Link', () => {
    it('should display "View all notifications" link when notifications exist', async () => {
      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.getByText('View all notifications')).toBeInTheDocument();
      });
    });

    it('should not display "View all" link when no notifications', async () => {
      notificationService.getUserNotifications.mockResolvedValue([]);

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('notification-bell'));

      await waitFor(() => {
        expect(screen.queryByText('View all notifications')).not.toBeInTheDocument();
      });
    });
  });
});
