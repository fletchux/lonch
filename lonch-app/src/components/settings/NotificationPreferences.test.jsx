import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPreferences from './NotificationPreferences';
import { getUserNotificationPreferences, updateNotificationPreferences } from '../../services/notificationService';

// Mock the notification service
vi.mock('../../services/notificationService', () => ({
  getUserNotificationPreferences: vi.fn(),
  updateNotificationPreferences: vi.fn()
}));

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'user123', email: 'test@example.com' }
  })
}));

describe('NotificationPreferences', () => {
  const mockPreferences = {
    userId: 'user123',
    emailNotifications: true,
    inAppNotifications: true,
    notificationTypes: {
      invitations: true,
      roleChanges: true,
      groupChanges: false,
      mentions: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(getUserNotificationPreferences).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<NotificationPreferences />);

    expect(screen.getByText(/loading notification preferences/i)).toBeInTheDocument();
  });

  it('should fetch and display user preferences', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('email-notifications-toggle')).toBeChecked();
      expect(screen.getByTestId('inapp-notifications-toggle')).toBeChecked();
      expect(screen.getByTestId('invitations-notifications-toggle')).toBeChecked();
      expect(screen.getByTestId('role-changes-notifications-toggle')).toBeChecked();
      expect(screen.getByTestId('group-changes-notifications-toggle')).not.toBeChecked();
    });
  });

  it('should toggle email notifications', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('email-notifications-toggle')).toBeInTheDocument();
    });

    const emailToggle = screen.getByTestId('email-notifications-toggle');
    fireEvent.click(emailToggle);

    expect(emailToggle).not.toBeChecked();
  });

  it('should toggle in-app notifications', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('inapp-notifications-toggle')).toBeInTheDocument();
    });

    const inAppToggle = screen.getByTestId('inapp-notifications-toggle');
    fireEvent.click(inAppToggle);

    expect(inAppToggle).not.toBeChecked();
  });

  it('should toggle notification type preferences', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('invitations-notifications-toggle')).toBeInTheDocument();
    });

    const invitationsToggle = screen.getByTestId('invitations-notifications-toggle');
    fireEvent.click(invitationsToggle);

    expect(invitationsToggle).not.toBeChecked();
  });

  it('should save preferences when save button is clicked', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);
    vi.mocked(updateNotificationPreferences).mockResolvedValue({});

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('save-preferences-button')).toBeInTheDocument();
    });

    // Toggle a preference
    const emailToggle = screen.getByTestId('email-notifications-toggle');
    fireEvent.click(emailToggle);

    // Click save
    const saveButton = screen.getByTestId('save-preferences-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateNotificationPreferences).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          emailNotifications: false
        })
      );
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
      expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
    });
  });

  it('should show error message when save fails', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);
    vi.mocked(updateNotificationPreferences).mockRejectedValue(new Error('Save failed'));

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('save-preferences-button')).toBeInTheDocument();
    });

    const saveButton = screen.getByTestId('save-preferences-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    });
  });

  it('should disable mentions toggle (future feature)', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('mentions-notifications-toggle')).toBeInTheDocument();
    });

    const mentionsToggle = screen.getByTestId('mentions-notifications-toggle');
    expect(mentionsToggle).toBeDisabled();
  });

  it('should display error when fetching preferences fails', async () => {
    vi.mocked(getUserNotificationPreferences).mockRejectedValue(new Error('Fetch failed'));

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByText(/error: fetch failed/i)).toBeInTheDocument();
    });
  });

  it('should show saving state when saving preferences', async () => {
    vi.mocked(getUserNotificationPreferences).mockResolvedValue(mockPreferences);
    vi.mocked(updateNotificationPreferences).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<NotificationPreferences />);

    await waitFor(() => {
      expect(screen.getByTestId('save-preferences-button')).toBeInTheDocument();
    });

    const saveButton = screen.getByTestId('save-preferences-button');
    fireEvent.click(saveButton);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});
