import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  getUserNotificationPreferences,
  updateNotificationPreferences,
  shouldNotifyUser,
  deleteOldNotifications
} from './notificationService';
import * as firebase from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  updateDoc,
  setDoc
} from 'firebase/firestore';

// Mock Firestore
vi.mock('../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification with all parameters', async () => {
      const mockCollection = { id: 'notifications' };
      const mockDocRef = { id: 'notif123' };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await createNotification(
        'user123',
        'invitation',
        'You have been invited to a project',
        '/projects/project123',
        'project123'
      );

      expect(collection).toHaveBeenCalledWith(firebase.db, 'notifications');
      expect(addDoc).toHaveBeenCalledWith(mockCollection, {
        userId: 'user123',
        type: 'invitation',
        message: 'You have been invited to a project',
        link: '/projects/project123',
        projectId: 'project123',
        read: false,
        createdAt: 'mock-timestamp'
      });
      expect(result).toEqual({
        id: 'notif123',
        userId: 'user123',
        type: 'invitation',
        message: 'You have been invited to a project',
        link: '/projects/project123',
        projectId: 'project123',
        read: false,
        createdAt: 'mock-timestamp'
      });
    });

    it('should create a notification without optional link and projectId', async () => {
      const mockCollection = { id: 'notifications' };
      const mockDocRef = { id: 'notif456' };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await createNotification(
        'user456',
        'role_change',
        'Your role has been changed'
      );

      expect(addDoc).toHaveBeenCalledWith(mockCollection, expect.objectContaining({
        userId: 'user456',
        type: 'role_change',
        message: 'Your role has been changed',
        link: null,
        projectId: null,
        read: false
      }));
      expect(result.id).toBe('notif456');
    });

    it('should throw error if creation fails', async () => {
      const mockCollection = { id: 'notifications' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        createNotification('user123', 'invitation', 'Test message')
      ).rejects.toThrow('Failed to create notification: Firestore error');
    });
  });

  describe('getUserNotifications', () => {
    it('should get all notifications for a user', async () => {
      const mockNotifications = [
        { id: 'notif1', userId: 'user123', message: 'Message 1', read: false },
        { id: 'notif2', userId: 'user123', message: 'Message 2', read: true }
      ];

      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: (callback) => {
          mockNotifications.forEach(notif => callback({
            id: notif.id,
            data: () => notif
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'userId', operator: '==', value: 'user123' });
      vi.mocked(orderBy).mockReturnValue({ field: 'createdAt', direction: 'desc' });
      vi.mocked(firestoreLimit).mockReturnValue({ value: 20 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await getUserNotifications('user123');

      expect(where).toHaveBeenCalledWith('userId', '==', 'user123');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(firestoreLimit).toHaveBeenCalledWith(20);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('notif1');
    });

    it('should get only unread notifications when unreadOnly is true', async () => {
      const mockNotifications = [
        { id: 'notif1', userId: 'user123', message: 'Message 1', read: false }
      ];

      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: (callback) => {
          mockNotifications.forEach(notif => callback({
            id: notif.id,
            data: () => notif
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'read', operator: '==', value: false });
      vi.mocked(orderBy).mockReturnValue({ field: 'createdAt', direction: 'desc' });
      vi.mocked(firestoreLimit).mockReturnValue({ value: 20 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await getUserNotifications('user123', true);

      expect(where).toHaveBeenCalledWith('read', '==', false);
      expect(result).toHaveLength(1);
      expect(result[0].read).toBe(false);
    });

    it('should support custom limit', async () => {
      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = { forEach: () => {} };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(firestoreLimit).mockReturnValue({ value: 50 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      await getUserNotifications('user123', false, 50);

      expect(firestoreLimit).toHaveBeenCalledWith(50);
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'notifications' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserNotifications('user123'))
        .rejects.toThrow('Failed to get user notifications: Firestore error');
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockDocRef = { id: 'notif123' };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await markNotificationAsRead('notif123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'notifications', 'notif123');
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { read: true });
    });

    it('should throw error if update fails', async () => {
      const mockDocRef = { id: 'notif123' };
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(markNotificationAsRead('notif123'))
        .rejects.toThrow('Failed to mark notification as read: Firestore error');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const mockUnreadNotifications = [
        { id: 'notif1', read: false },
        { id: 'notif2', read: false },
        { id: 'notif3', read: false }
      ];

      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: (callback) => {
          mockUnreadNotifications.forEach(notif => callback({
            id: notif.id,
            data: () => notif
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);
      vi.mocked(doc).mockReturnValue({ id: 'mockDoc' });
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const count = await markAllNotificationsAsRead('user123');

      expect(count).toBe(3);
      expect(updateDoc).toHaveBeenCalledTimes(3);
    });

    it('should return 0 when no unread notifications exist', async () => {
      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: () => {}
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const count = await markAllNotificationsAsRead('user123');

      expect(count).toBe(0);
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return count of unread notifications', async () => {
      const mockUnreadNotifications = [
        { id: 'notif1', read: false },
        { id: 'notif2', read: false }
      ];

      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: (callback) => {
          mockUnreadNotifications.forEach(notif => callback({
            id: notif.id,
            data: () => notif
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const count = await getUnreadNotificationCount('user123');

      expect(count).toBe(2);
    });

    it('should return 0 when no unread notifications exist', async () => {
      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: () => {}
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const count = await getUnreadNotificationCount('user123');

      expect(count).toBe(0);
    });
  });

  describe('getUserNotificationPreferences', () => {
    it('should return user preferences when they exist', async () => {
      const mockPreferences = {
        emailNotifications: true,
        inAppNotifications: true,
        notifyOnInvitation: true,
        notifyOnRoleChange: false,
        notifyOnGroupChange: true,
        notifyOnMention: true
      };

      const mockDocRef = { id: 'user123' };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockPreferences
      };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot);

      const result = await getUserNotificationPreferences('user123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'notificationPreferences', 'user123');
      expect(result).toEqual({
        userId: 'user123',
        ...mockPreferences
      });
    });

    it('should return default preferences when none exist', async () => {
      const mockDocRef = { id: 'user123' };
      const mockDocSnapshot = {
        exists: () => false
      };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot);

      const result = await getUserNotificationPreferences('user123');

      expect(result).toEqual({
        userId: 'user123',
        emailNotifications: true,
        inAppNotifications: true,
        notifyOnInvitation: true,
        notifyOnRoleChange: true,
        notifyOnGroupChange: true,
        notifyOnMention: true
      });
    });

    it('should throw error if query fails', async () => {
      const mockDocRef = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserNotificationPreferences('user123'))
        .rejects.toThrow('Failed to get notification preferences: Firestore error');
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update user notification preferences', async () => {
      const mockDocRef = { id: 'user123' };
      const preferences = {
        emailNotifications: false,
        inAppNotifications: true,
        notifyOnInvitation: true,
        notifyOnRoleChange: false,
        notifyOnGroupChange: true,
        notifyOnMention: false
      };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await updateNotificationPreferences('user123', preferences);

      expect(doc).toHaveBeenCalledWith(firebase.db, 'notificationPreferences', 'user123');
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          ...preferences,
          userId: 'user123',
          updatedAt: 'mock-timestamp'
        }),
        { merge: true }
      );
      expect(result.userId).toBe('user123');
      expect(result.emailNotifications).toBe(false);
    });

    it('should throw error if update fails', async () => {
      const mockDocRef = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(updateNotificationPreferences('user123', {}))
        .rejects.toThrow('Failed to update notification preferences: Firestore error');
    });
  });

  describe('shouldNotifyUser', () => {
    it('should return false if in-app notifications are disabled', async () => {
      const mockDocRef = { id: 'user123' };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => ({
          inAppNotifications: false,
          notifyOnInvitation: true
        })
      };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot);

      const result = await shouldNotifyUser('user123', 'invitation');

      expect(result).toBe(false);
    });

    it('should return true if specific notification type is enabled', async () => {
      const mockDocRef = { id: 'user123' };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => ({
          inAppNotifications: true,
          notifyOnInvitation: true
        })
      };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot);

      const result = await shouldNotifyUser('user123', 'invitation');

      expect(result).toBe(true);
    });

    it('should return false if specific notification type is disabled', async () => {
      const mockDocRef = { id: 'user123' };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => ({
          inAppNotifications: true,
          notifyOnRoleChange: false
        })
      };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot);

      const result = await shouldNotifyUser('user123', 'role_change');

      expect(result).toBe(false);
    });

    it('should return true for unknown notification types', async () => {
      const mockDocRef = { id: 'user123' };
      const mockDocSnapshot = {
        exists: () => true,
        data: () => ({
          inAppNotifications: true
        })
      };

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot);

      const result = await shouldNotifyUser('user123', 'unknown_type');

      expect(result).toBe(true);
    });

    it('should return true if preferences cannot be fetched', async () => {
      const mockDocRef = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      const result = await shouldNotifyUser('user123', 'invitation');

      expect(result).toBe(true);
    });
  });

  describe('deleteOldNotifications', () => {
    it('should return count of old notifications to delete', async () => {
      const mockCollection = { id: 'notifications' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        size: 5
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'read', operator: '==', value: true });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await deleteOldNotifications('user123', 30);

      expect(result).toBe(5);
      expect(where).toHaveBeenCalledWith('userId', '==', 'user123');
      expect(where).toHaveBeenCalledWith('read', '==', true);
    });
  });
});
