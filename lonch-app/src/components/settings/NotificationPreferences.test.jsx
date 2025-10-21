import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPreferences from './NotificationPreferences';
import * as notificationService from '../../services/notificationService';

// Mock the AuthContext
const mockCurrentUser = { uid: 'user123' };
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: mockCurrentUser })
}));

// Mock the notification service
vi.mock('../../services/notificationService', () => ({
  getUserNotificationPreferences: vi.fn(),
  updateNotificationPreferences: vi.fn()
}));

describe('NotificationPreferences', () => {
  const mockPreferences = {
    userId: 'user123',
    emailNotifications: true,
    inAppNotifications: true,
    notifyOnInvitation: true,
    notifyOnRoleChange: true,
    notifyOnGroupChange: true,
    notifyOnMention: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    notificationService.getUserNotificationPreferences.mockResolvedValue(mockPreferences);
    notificationService.updateNotificationPreferences.mockResolvedValue(mockPreferences);
  });

  describe('Loading and Rendering', () => {
    it('should display loading state initially', () => {
      notificationService.getUserNotificationPreferences.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<NotificationPreferences />);

      expect(screen.getByText(/Loading notification preferences/i)).toBeInTheDocument();
    });

    it('should fetch and display user preferences', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(notificationService.getUserNotificationPreferences).toHaveBeenCalledWith('user123');
      });

      expect(screen.getByTestId('toggle-inAppNotifications')).toBeChecked();
      expect(screen.getByTestId('toggle-emailNotifications')).toBeChecked();
      expect(screen.getByTestId('toggle-notifyOnInvitation')).toBeChecked();
      expect(screen.getByTestId('toggle-notifyOnRoleChange')).toBeChecked();
      expect(screen.getByTestId('toggle-notifyOnGroupChange')).toBeChecked();
      expect(screen.getByTestId('toggle-notifyOnMention')).toBeChecked();
    });

    it('should display error message when loading fails', async () => {
      notificationService.getUserNotificationPreferences.mockRejectedValue(
        new Error('Failed to load preferences')
      );

      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByText(/Error loading preferences/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Failed to load preferences/i)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should retry loading preferences when retry button is clicked', async () => {
      notificationService.getUserNotificationPreferences
        .mockRejectedValueOnce(new Error('Failed to load'))
        .mockResolvedValueOnce(mockPreferences);

      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByTestId('toggle-inAppNotifications')).toBeInTheDocument();
      });

      expect(notificationService.getUserNotificationPreferences).toHaveBeenCalledTimes(2);
    });
  });

  describe('Toggle Switches', () => {
    it('should toggle in-app notifications', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-inAppNotifications')).toBeChecked();
      });

      const toggle = screen.getByTestId('toggle-inAppNotifications');
      fireEvent.click(toggle);

      expect(toggle).not.toBeChecked();
    });

    it('should toggle email notifications', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-emailNotifications')).toBeChecked();
      });

      const toggle = screen.getByTestId('toggle-emailNotifications');
      fireEvent.click(toggle);

      expect(toggle).not.toBeChecked();
    });

    it('should toggle invitation notifications', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-notifyOnInvitation')).toBeChecked();
      });

      const toggle = screen.getByTestId('toggle-notifyOnInvitation');
      fireEvent.click(toggle);

      expect(toggle).not.toBeChecked();
    });

    it('should toggle role change notifications', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-notifyOnRoleChange')).toBeChecked();
      });

      const toggle = screen.getByTestId('toggle-notifyOnRoleChange');
      fireEvent.click(toggle);

      expect(toggle).not.toBeChecked();
    });

    it('should toggle group change notifications', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-notifyOnGroupChange')).toBeChecked();
      });

      const toggle = screen.getByTestId('toggle-notifyOnGroupChange');
      fireEvent.click(toggle);

      expect(toggle).not.toBeChecked();
    });

    it('should toggle mention notifications', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-notifyOnMention')).toBeChecked();
      });

      const toggle = screen.getByTestId('toggle-notifyOnMention');
      fireEvent.click(toggle);

      expect(toggle).not.toBeChecked();
    });
  });

  describe('Disabled State', () => {
    it('should disable specific toggles when both channels are off', async () => {
      const prefsWithChannelsOff = {
        ...mockPreferences,
        emailNotifications: false,
        inAppNotifications: false
      };
      notificationService.getUserNotificationPreferences.mockResolvedValue(prefsWithChannelsOff);

      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-notifyOnInvitation')).toBeDisabled();
      });

      expect(screen.getByTestId('toggle-notifyOnRoleChange')).toBeDisabled();
      expect(screen.getByTestId('toggle-notifyOnGroupChange')).toBeDisabled();
      expect(screen.getByTestId('toggle-notifyOnMention')).toBeDisabled();
    });

    it('should show warning when all channels are disabled', async () => {
      const prefsWithChannelsOff = {
        ...mockPreferences,
        emailNotifications: false,
        inAppNotifications: false
      };
      notificationService.getUserNotificationPreferences.mockResolvedValue(prefsWithChannelsOff);

      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByText(/All notifications are currently disabled/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Enable at least one notification channel/i)).toBeInTheDocument();
    });

    it('should enable specific toggles when at least one channel is on', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-notifyOnInvitation')).not.toBeDisabled();
      });

      expect(screen.getByTestId('toggle-notifyOnRoleChange')).not.toBeDisabled();
      expect(screen.getByTestId('toggle-notifyOnGroupChange')).not.toBeDisabled();
      expect(screen.getByTestId('toggle-notifyOnMention')).not.toBeDisabled();
    });
  });

  describe('Saving Preferences', () => {
    it('should save preferences when save button is clicked', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      // Toggle a preference
      const toggle = screen.getByTestId('toggle-notifyOnInvitation');
      fireEvent.click(toggle);

      // Click save
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(notificationService.updateNotificationPreferences).toHaveBeenCalledWith(
          'user123',
          expect.objectContaining({
            notifyOnInvitation: false // Should be toggled to false
          })
        );
      });
    });

    it('should display success message after successful save', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });

      expect(screen.getByText(/Notification preferences saved successfully/i)).toBeInTheDocument();
    });

    it('should display error message when save fails', async () => {
      notificationService.updateNotificationPreferences.mockRejectedValue(
        new Error('Save failed')
      );

      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText(/Save failed/i)).toBeInTheDocument();
    });

    it('should show "Saving..." text while saving', async () => {
      notificationService.updateNotificationPreferences.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Should show "Saving..." text
      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      // Wait for save to complete
      await waitFor(() => {
        expect(screen.getByText('Save Preferences')).toBeInTheDocument();
      });
    });

    it('should disable save button while saving', async () => {
      notificationService.updateNotificationPreferences.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Should be disabled while saving
      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });

      // Wait for save to complete
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Multiple Toggles', () => {
    it('should handle multiple toggle changes before saving', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle-notifyOnInvitation')).toBeChecked();
      });

      // Toggle multiple preferences
      fireEvent.click(screen.getByTestId('toggle-notifyOnInvitation'));
      fireEvent.click(screen.getByTestId('toggle-notifyOnRoleChange'));
      fireEvent.click(screen.getByTestId('toggle-emailNotifications'));

      expect(screen.getByTestId('toggle-notifyOnInvitation')).not.toBeChecked();
      expect(screen.getByTestId('toggle-notifyOnRoleChange')).not.toBeChecked();
      expect(screen.getByTestId('toggle-emailNotifications')).not.toBeChecked();

      // Save
      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(notificationService.updateNotificationPreferences).toHaveBeenCalledWith(
          'user123',
          expect.objectContaining({
            notifyOnInvitation: false,
            notifyOnRoleChange: false,
            emailNotifications: false
          })
        );
      });
    });
  });

  describe('UI Text and Labels', () => {
    it('should display all channel labels', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByText('Notification Channels')).toBeInTheDocument();
      });

      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });

    it('should display all notification type labels', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByText('Notification Types')).toBeInTheDocument();
      });

      expect(screen.getByText('Project Invitations')).toBeInTheDocument();
      expect(screen.getByText('Role Changes')).toBeInTheDocument();
      expect(screen.getByText('Group Changes')).toBeInTheDocument();
      expect(screen.getByText('Mentions')).toBeInTheDocument();
    });

    it('should display descriptive text for each option', async () => {
      render(<NotificationPreferences />);

      await waitFor(() => {
        expect(screen.getByText(/Receive notifications within the application/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Receive notifications via email/i)).toBeInTheDocument();
      expect(screen.getByText(/When you're invited to a project/i)).toBeInTheDocument();
      expect(screen.getByText(/When your role in a project changes/i)).toBeInTheDocument();
      expect(screen.getByText(/When you're moved between Consulting and Client groups/i)).toBeInTheDocument();
      expect(screen.getByText(/When someone mentions you \(future feature\)/i)).toBeInTheDocument();
    });
  });
});
