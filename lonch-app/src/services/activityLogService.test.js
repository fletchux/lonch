import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  logActivity,
  getProjectActivityLog,
  filterByUser,
  filterByAction,
  filterByDateRange
} from './activityLogService';
import * as firebase from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter
} from 'firebase/firestore';

// Mock Firestore
vi.mock('../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('activityLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logActivity', () => {
    it('should log an activity with all parameters', async () => {
      const mockCollection = { id: 'activityLogs' };
      const mockDocRef = { id: 'activity123' };
      const metadata = { documentName: 'test.pdf', size: 1024 };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await logActivity(
        'project123',
        'user456',
        'document_uploaded',
        'document',
        'doc789',
        metadata,
        null
      );

      expect(collection).toHaveBeenCalledWith(firebase.db, 'activityLogs');
      expect(addDoc).toHaveBeenCalledWith(mockCollection, {
        projectId: 'project123',
        userId: 'user456',
        action: 'document_uploaded',
        resourceType: 'document',
        resourceId: 'doc789',
        groupContext: null,
        metadata,
        timestamp: 'mock-timestamp'
      });
      expect(result).toEqual({
        id: 'activity123',
        projectId: 'project123',
        userId: 'user456',
        action: 'document_uploaded',
        resourceType: 'document',
        resourceId: 'doc789',
        groupContext: null,
        metadata,
        timestamp: 'mock-timestamp'
      });
    });

    // Task 6.7: Test group-aware activity logging
    it('should log an activity with groupContext (consulting)', async () => {
      const mockCollection = { id: 'activityLogs' };
      const mockDocRef = { id: 'activity456' };
      const metadata = { invitedEmail: 'user@example.com', invitedRole: 'editor', invitedGroup: 'consulting' };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await logActivity(
        'project123',
        'user456',
        'member_invited',
        'member',
        'invitation789',
        metadata,
        'consulting'
      );

      expect(addDoc).toHaveBeenCalledWith(mockCollection, {
        projectId: 'project123',
        userId: 'user456',
        action: 'member_invited',
        resourceType: 'member',
        resourceId: 'invitation789',
        groupContext: 'consulting',
        metadata,
        timestamp: 'mock-timestamp'
      });
      expect(result.groupContext).toBe('consulting');
    });

    it('should log an activity with groupContext (client)', async () => {
      const mockCollection = { id: 'activityLogs' };
      const mockDocRef = { id: 'activity789' };
      const metadata = { documentName: 'contract.pdf', newVisibility: 'client_only' };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await logActivity(
        'project123',
        'user456',
        'document_visibility_changed',
        'document',
        'doc123',
        metadata,
        'client'
      );

      expect(addDoc).toHaveBeenCalledWith(mockCollection, expect.objectContaining({
        groupContext: 'client'
      }));
      expect(result.groupContext).toBe('client');
    });

    it('should log activity without metadata', async () => {
      const mockCollection = { id: 'activityLogs' };
      const mockDocRef = { id: 'activity123' };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await logActivity(
        'project123',
        'user456',
        'member_invited',
        'member',
        'member789'
      );

      expect(addDoc).toHaveBeenCalledWith(mockCollection, expect.objectContaining({
        metadata: {}
      }));
      expect(result.id).toBe('activity123');
    });

    it('should throw error if logging fails', async () => {
      const mockCollection = { id: 'activityLogs' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(
        logActivity('project123', 'user456', 'document_uploaded', 'document', 'doc789')
      ).rejects.toThrow('Failed to log activity: Firestore error');
    });
  });

  describe('getProjectActivityLog', () => {
    it('should get activity log with default limit', async () => {
      const mockActivities = [
        { id: 'act1', action: 'document_uploaded', userId: 'user1' },
        { id: 'act2', action: 'member_invited', userId: 'user2' }
      ];
      const mockCollection = { id: 'activityLogs' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        size: 2,
        forEach: (callback) => {
          mockActivities.forEach(act => callback({
            id: act.id,
            data: () => act
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'projectId', operator: '==', value: 'project123' });
      vi.mocked(orderBy).mockReturnValue({ field: 'timestamp', direction: 'desc' });
      vi.mocked(firestoreLimit).mockReturnValue({ value: 50 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await getProjectActivityLog('project123');

      expect(collection).toHaveBeenCalledWith(firebase.db, 'activityLogs');
      expect(where).toHaveBeenCalledWith('projectId', '==', 'project123');
      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(firestoreLimit).toHaveBeenCalledWith(50);
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0].id).toBe('act1');
      expect(result.hasMore).toBe(false);
    });

    it('should support pagination with lastDoc', async () => {
      const mockActivities = [
        { id: 'act3', action: 'role_changed', userId: 'user3' }
      ];
      const mockCollection = { id: 'activityLogs' };
      const mockQuery = { id: 'query' };
      const mockLastDoc = { id: 'act2' };
      const mockSnapshot = {
        size: 1,
        forEach: (callback) => {
          mockActivities.forEach(act => callback({
            id: act.id,
            data: () => act
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'projectId', operator: '==', value: 'project123' });
      vi.mocked(orderBy).mockReturnValue({ field: 'timestamp', direction: 'desc' });
      vi.mocked(startAfter).mockReturnValue({ doc: mockLastDoc });
      vi.mocked(firestoreLimit).mockReturnValue({ value: 50 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await getProjectActivityLog('project123', 50, mockLastDoc);

      expect(startAfter).toHaveBeenCalledWith(mockLastDoc);
      expect(result.activities).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it('should indicate hasMore when results equal limit', async () => {
      const mockActivities = Array(50).fill(null).map((_, i) => ({
        id: `act${i}`,
        action: 'test_action'
      }));
      const mockCollection = { id: 'activityLogs' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        size: 50,
        forEach: (callback) => {
          mockActivities.forEach(act => callback({
            id: act.id,
            data: () => act
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await getProjectActivityLog('project123', 50);

      expect(result.hasMore).toBe(true);
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'activityLogs' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getProjectActivityLog('project123'))
        .rejects.toThrow('Failed to get project activity log: Firestore error');
    });
  });

  describe('filterByUser', () => {
    it('should filter activities by user', async () => {
      const mockActivities = [
        { id: 'act1', action: 'document_uploaded', userId: 'user123' },
        { id: 'act2', action: 'document_deleted', userId: 'user123' }
      ];
      const mockCollection = { id: 'activityLogs' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: (callback) => {
          mockActivities.forEach(act => callback({
            id: act.id,
            data: () => act
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'userId', operator: '==', value: 'user123' });
      vi.mocked(orderBy).mockReturnValue({ field: 'timestamp', direction: 'desc' });
      vi.mocked(firestoreLimit).mockReturnValue({ value: 50 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await filterByUser('project123', 'user123');

      expect(where).toHaveBeenCalledWith('projectId', '==', 'project123');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user123');
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user123');
    });

    it('should support custom limit', async () => {
      const mockCollection = { id: 'activityLogs' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = { forEach: () => {} };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(firestoreLimit).mockReturnValue({ value: 10 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      await filterByUser('project123', 'user123', 10);

      expect(firestoreLimit).toHaveBeenCalledWith(10);
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'activityLogs' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(filterByUser('project123', 'user123'))
        .rejects.toThrow('Failed to filter activity log by user: Firestore error');
    });
  });

  describe('filterByAction', () => {
    it('should filter activities by action type', async () => {
      const mockActivities = [
        { id: 'act1', action: 'document_uploaded', resourceType: 'document' },
        { id: 'act2', action: 'document_uploaded', resourceType: 'document' }
      ];
      const mockCollection = { id: 'activityLogs' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: (callback) => {
          mockActivities.forEach(act => callback({
            id: act.id,
            data: () => act
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'action', operator: '==', value: 'document_uploaded' });
      vi.mocked(orderBy).mockReturnValue({ field: 'timestamp', direction: 'desc' });
      vi.mocked(firestoreLimit).mockReturnValue({ value: 50 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await filterByAction('project123', 'document_uploaded');

      expect(where).toHaveBeenCalledWith('projectId', '==', 'project123');
      expect(where).toHaveBeenCalledWith('action', '==', 'document_uploaded');
      expect(result).toHaveLength(2);
      expect(result[0].action).toBe('document_uploaded');
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'activityLogs' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(filterByAction('project123', 'document_uploaded'))
        .rejects.toThrow('Failed to filter activity log by action: Firestore error');
    });
  });

  describe('filterByDateRange', () => {
    it('should filter activities by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockActivities = [
        { id: 'act1', action: 'document_uploaded', timestamp: new Date('2024-01-15') }
      ];
      const mockCollection = { id: 'activityLogs' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        forEach: (callback) => {
          mockActivities.forEach(act => callback({
            id: act.id,
            data: () => act
          }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'timestamp', operator: '>=', value: startDate });
      vi.mocked(orderBy).mockReturnValue({ field: 'timestamp', direction: 'desc' });
      vi.mocked(firestoreLimit).mockReturnValue({ value: 50 });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await filterByDateRange('project123', startDate, endDate);

      expect(where).toHaveBeenCalledWith('projectId', '==', 'project123');
      expect(where).toHaveBeenCalledWith('timestamp', '>=', startDate);
      expect(where).toHaveBeenCalledWith('timestamp', '<=', endDate);
      expect(result).toHaveLength(1);
    });

    it('should throw error if query fails', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockCollection = { id: 'activityLogs' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(filterByDateRange('project123', startDate, endDate))
        .rejects.toThrow('Failed to filter activity log by date range: Firestore error');
    });
  });
});
