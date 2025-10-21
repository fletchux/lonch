import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUserNotificationPreferences,
  updateNotificationPreferences,
  shouldNotify
} from './notificationService';
import { collection, addDoc, getDocs, getDoc, updateDoc, doc, where } from 'firebase/firestore';

// Mock Firebase Firestore
vi.mock('../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 }))
}));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification with all fields', async () => {
      const mockDocRef = { id: 'notification123' };
      vi.mocked(collection).mockReturnValue('notificationsCollection');
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await createNotification(
        'user456',
        'invitation',
        'You have been invited to join a project',
        '/projects/proj123'
      );

      expect(addDoc).toHaveBeenCalledWith(
        'notificationsCollection',
        expect.objectContaining({
          userId: 'user456',
          type: 'invitation',
          message: 'You have been invited to join a project',
          link: '/projects/proj123',
          read: false
        })
      );

      expect(result).toEqual({
        id: 'notification123',
        userId: 'user456',
        type: 'invitation',
        message: 'You have been invited to join a project',
        link: '/projects/proj123',
        read: false,
        createdAt: expect.any(Object)
      });
    });

    it('should create a notification without a link', async () => {
      const mockDocRef = { id: 'notification456' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await createNotification(
        'user789',
        'role_changed',
        'Your role has been updated'
      );

      expect(result.link).toBeNull();
    });

    it('should throw error when creation fails', async () => {
      vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        createNotification('user123', 'test', 'Test message')
      ).rejects.toThrow('Failed to create notification: Firestore error');
    });
  });

  describe('getUserNotifications', () => {
    it('should get all notifications for a user', async () => {
      const mockNotifications = [
        { id: 'notif1', userId: 'user123', message: 'Notification 1', read: false },
        { id: 'notif2', userId: 'user123', message: 'Notification 2', read: true }
      ];

      const mockQuerySnapshot = {
        forEach: (callback) => {
          mockNotifications.forEach((notif) => {
            callback({
              id: notif.id,
              data: () => ({ userId: notif.userId, message: notif.message, read: notif.read })
            });
          });
        }
      };

      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);

      const result = await getUserNotifications('user123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('notif1');
      expect(result[1].id).toBe('notif2');
    });

    it('should get only unread notifications when unreadOnly is true', async () => {
      const mockNotifications = [
        { id: 'notif1', userId: 'user123', message: 'Unread notification', read: false }
      ];

      const mockQuerySnapshot = {
        forEach: (callback) => {
          mockNotifications.forEach((notif) => {
            callback({
              id: notif.id,
              data: () => ({ userId: notif.userId, message: notif.message, read: notif.read })
            });
          });
        }
      };

      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);
      vi.mocked(where).mockImplementation((field, op, value) => `where-${field}-${op}-${value}`);

      const result = await getUserNotifications('user123', true);

      expect(result).toHaveLength(1);
      expect(result[0].read).toBe(false);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      vi.mocked(doc).mockReturnValue('notificationDoc');
      vi.mocked(updateDoc).mockResolvedValue();

      await markNotificationAsRead('notif123');

      expect(updateDoc).toHaveBeenCalledWith('notificationDoc', { read: true });
    });

    it('should throw error when update fails', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Update failed'));

      await expect(
        markNotificationAsRead('notif123')
      ).rejects.toThrow('Failed to mark notification as read');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const mockUnreadNotifications = [
        { id: 'notif1', read: false },
        { id: 'notif2', read: false }
      ];

      const mockQuerySnapshot = {
        forEach: (callback) => {
          mockUnreadNotifications.forEach((notif) => {
            callback({
              id: notif.id,
              data: () => ({ read: notif.read })
            });
          });
        }
      };

      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);
      vi.mocked(updateDoc).mockResolvedValue();

      const count = await markAllAsRead('user123');

      expect(count).toBe(2);
      expect(updateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserNotificationPreferences', () => {
    it('should return user preferences if they exist', async () => {
      const mockPreferences = {
        userId: 'user123',
        emailNotifications: true,
        inAppNotifications: false,
        notificationTypes: {
          invitations: true,
          roleChanges: false
        }
      };

      const mockDoc = {
        exists: () => true,
        id: 'settings',
        data: () => mockPreferences
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc);

      const result = await getUserNotificationPreferences('user123');

      expect(result.emailNotifications).toBe(true);
      expect(result.inAppNotifications).toBe(false);
    });

    it('should return default preferences if none exist', async () => {
      const mockDoc = {
        exists: () => false
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc);

      const result = await getUserNotificationPreferences('user123');

      expect(result.emailNotifications).toBe(true);
      expect(result.inAppNotifications).toBe(true);
      expect(result.notificationTypes.invitations).toBe(true);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update user notification preferences', async () => {
      vi.mocked(doc).mockReturnValue('preferencesDoc');
      vi.mocked(updateDoc).mockResolvedValue();

      const preferences = {
        emailNotifications: false,
        inAppNotifications: true,
        notificationTypes: {
          invitations: true,
          roleChanges: false
        }
      };

      await updateNotificationPreferences('user123', preferences);

      expect(updateDoc).toHaveBeenCalledWith(
        'preferencesDoc',
        expect.objectContaining({
          userId: 'user123',
          emailNotifications: false,
          inAppNotifications: true
        })
      );
    });
  });

  describe('shouldNotify', () => {
    it('should return true if all preferences allow notification', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => ({
          emailNotifications: true,
          inAppNotifications: true,
          notificationTypes: {
            invitations: true
          }
        })
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc);

      const result = await shouldNotify('user123', 'invitations', 'inApp');

      expect(result).toBe(true);
    });

    it('should return false if channel is disabled', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => ({
          emailNotifications: false,
          inAppNotifications: true
        })
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc);

      const result = await shouldNotify('user123', 'invitations', 'email');

      expect(result).toBe(false);
    });

    it('should return false if notification type is disabled', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => ({
          emailNotifications: true,
          inAppNotifications: true,
          notificationTypes: {
            invitations: false
          }
        })
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc);

      const result = await shouldNotify('user123', 'invitations', 'inApp');

      expect(result).toBe(false);
    });

    it('should default to true if preferences cannot be retrieved', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      const result = await shouldNotify('user123', 'invitations', 'inApp');

      expect(result).toBe(true);
    });
  });
});
