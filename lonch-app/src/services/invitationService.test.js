import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createInvitation,
  getInvitation,
  getUserInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation
} from './invitationService';
import * as firebase from '../config/firebase';
import * as projectService from './projectService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';

// Mock Firestore
vi.mock('../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

vi.mock('./projectService', () => ({
  addProjectMember: vi.fn()
}));

describe('invitationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a realistic timestamp (Nov 13, 2024 in milliseconds)
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
    // Mock window.location
    globalThis.window = { location: { origin: 'http://localhost:3000' } };
    // Mock Date constructor to use the mocked now() for new Date()
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1700000000000));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createInvitation', () => {
    it('should create a new invitation with token and expiration', async () => {
      const mockDoc = { id: 'project123_user@example.com_1700000000000' };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { forEach: () => {}, empty: true };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'email', operator: '==', value: 'user@example.com' });
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await createInvitation('project123', 'user@example.com', 'editor', 'owner123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'invitations', 'project123_user@example.com_1700000000000');
      expect(setDoc).toHaveBeenCalledWith(mockDoc, expect.objectContaining({
        id: 'project123_user@example.com_1700000000000',
        projectId: 'project123',
        email: 'user@example.com',
        role: 'editor',
        group: 'client',
        invitedBy: 'owner123',
        status: 'pending',
        acceptedAt: null,
        declinedAt: null
      }));
      expect(result.token).toMatch(/^inv_/);
    });

    it('should convert email to lowercase', async () => {
      const mockDoc = { id: 'project123_user@example.com_1234567890' };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { forEach: () => {}, empty: true };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'email', operator: '==', value: 'user@example.com' });
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await createInvitation('project123', 'USER@EXAMPLE.COM', 'editor', 'owner123');

      expect(setDoc).toHaveBeenCalledWith(mockDoc, expect.objectContaining({
        email: 'user@example.com'
      }));
    });

    it('should throw error if user already has pending invitation', async () => {
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const existingInvitations = [
        { projectId: 'project123', email: 'user@example.com', status: 'pending' }
      ];
      const mockSnapshot = {
        forEach: (callback) => {
          existingInvitations.forEach(inv => callback({ data: () => inv }));
        },
        empty: false
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'email', operator: '==', value: 'user@example.com' });
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      await expect(createInvitation('project123', 'user@example.com', 'editor', 'owner123'))
        .rejects.toThrow('User already has a pending invitation for this project');
    });

    it('should throw error if creation fails', async () => {
      const mockCollection = { id: 'invitations' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(createInvitation('project123', 'user@example.com', 'editor', 'owner123'))
        .rejects.toThrow('Failed to create invitation: Failed to get user invitations: Firestore error');
    });

    it('should create invitation with default group "client" when group not specified', async () => {
      const mockDoc = { id: 'project123_user@example.com_1700000000000' };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { forEach: () => {}, empty: true };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'email', operator: '==', value: 'user@example.com' });
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await createInvitation('project123', 'user@example.com', 'viewer', 'admin123');

      expect(setDoc).toHaveBeenCalledWith(mockDoc, expect.objectContaining({
        group: 'client'
      }));
      expect(result.group).toBe('client');
    });

    it('should create invitation with group "consulting" when explicitly specified', async () => {
      const mockDoc = { id: 'project123_user@example.com_1700000000000' };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { forEach: () => {}, empty: true };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(where).mockReturnValue({ field: 'email', operator: '==', value: 'user@example.com' });
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await createInvitation('project123', 'user@example.com', 'admin', 'owner123', 'consulting');

      expect(setDoc).toHaveBeenCalledWith(mockDoc, expect.objectContaining({
        group: 'consulting'
      }));
      expect(result.group).toBe('consulting');
    });
  });

  describe('getInvitation', () => {
    it('should retrieve invitation by token', async () => {
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockInvitation = {
        id: 'inv123',
        token: 'inv_1234567890_abc123',
        projectId: 'project123',
        email: 'user@example.com',
        role: 'editor',
        status: 'pending'
      };
      const mockSnapshot = {
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockInvitation });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(where).mockReturnValue({ field: 'token', operator: '==', value: 'inv_1234567890_abc123' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await getInvitation('inv_1234567890_abc123');

      expect(collection).toHaveBeenCalledWith(firebase.db, 'invitations');
      expect(where).toHaveBeenCalledWith('token', '==', 'inv_1234567890_abc123');
      expect(result).toEqual(mockInvitation);
    });

    it('should return null if invitation not found', async () => {
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { empty: true, forEach: () => {} };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);

      const result = await getInvitation('invalid_token');

      expect(result).toBeNull();
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'invitations' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getInvitation('inv_1234567890_abc123'))
        .rejects.toThrow('Failed to get invitation: Firestore error');
    });
  });

  describe('getUserInvitations', () => {
    it('should return all invitations for a user email', async () => {
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockInvitations = [
        { id: 'inv1', projectId: 'project123', email: 'user@example.com', status: 'pending' },
        { id: 'inv2', projectId: 'project456', email: 'user@example.com', status: 'accepted' }
      ];
      const mockSnapshot = {
        forEach: (callback) => {
          mockInvitations.forEach(inv => callback({ data: () => inv }));
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(where).mockReturnValue({ field: 'email', operator: '==', value: 'user@example.com' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      const result = await getUserInvitations('user@example.com');

      expect(collection).toHaveBeenCalledWith(firebase.db, 'invitations');
      expect(where).toHaveBeenCalledWith('email', '==', 'user@example.com');
      expect(result).toEqual(mockInvitations);
    });

    it('should return empty array if user has no invitations', async () => {
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { forEach: () => {} };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);

      const result = await getUserInvitations('user@example.com');

      expect(result).toEqual([]);
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'invitations' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserInvitations('user@example.com'))
        .rejects.toThrow('Failed to get user invitations: Firestore error');
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation and add user to project', async () => {
      const futureDate = new Date(1700000000000 + 86400000); // Mock Date.now() + 1 day
      const mockInvitation = {
        id: 'inv123',
        projectId: 'project123',
        email: 'user@example.com',
        role: 'editor',
        group: 'client',
        invitedBy: 'owner123',
        status: 'pending',
        expiresAt: futureDate
      };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockDoc = { id: 'inv123' };
      const mockSnapshot = {
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockInvitation });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(projectService.addProjectMember).mockResolvedValue(undefined);

      await acceptInvitation('inv_token_123', 'user456');

      expect(projectService.addProjectMember).toHaveBeenCalledWith('project123', 'user456', 'editor', 'owner123', 'client');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        status: 'accepted',
        acceptedAt: 'mock-timestamp'
      });
    });

    it('should throw error if invitation not found', async () => {
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { empty: true, forEach: () => {} };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);

      await expect(acceptInvitation('invalid_token', 'user456'))
        .rejects.toThrow('Failed to accept invitation: Invitation not found');
    });

    it('should throw error if invitation is not pending', async () => {
      const mockInvitation = {
        id: 'inv123',
        status: 'accepted',
        expiresAt: new Date(Date.now() + 86400000)
      };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockInvitation });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      await expect(acceptInvitation('inv_token_123', 'user456'))
        .rejects.toThrow('Invitation is accepted, cannot accept');
    });

    it('should throw error if invitation has expired', async () => {
      const pastDate = new Date(1700000000000 - 86400000); // Mock Date.now() - 1 day
      const mockInvitation = {
        id: 'inv123',
        projectId: 'project123',
        status: 'pending',
        expiresAt: pastDate
      };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockInvitation });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      await expect(acceptInvitation('inv_token_123', 'user456'))
        .rejects.toThrow('Invitation has expired');
    });

    it('should accept invitation with consulting group and add user to project', async () => {
      const futureDate = new Date(1700000000000 + 86400000); // Mock Date.now() + 1 day
      const mockInvitation = {
        id: 'inv123',
        projectId: 'project123',
        email: 'consultant@example.com',
        role: 'admin',
        group: 'consulting',
        invitedBy: 'owner123',
        status: 'pending',
        expiresAt: futureDate
      };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockDoc = { id: 'inv123' };
      const mockSnapshot = {
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockInvitation });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(projectService.addProjectMember).mockResolvedValue(undefined);

      await acceptInvitation('inv_token_456', 'user789');

      expect(projectService.addProjectMember).toHaveBeenCalledWith('project123', 'user789', 'admin', 'owner123', 'consulting');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        status: 'accepted',
        acceptedAt: 'mock-timestamp'
      });
    });
  });

  describe('declineInvitation', () => {
    it('should decline a pending invitation', async () => {
      const mockInvitation = {
        id: 'inv123',
        status: 'pending'
      };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockDoc = { id: 'inv123' };
      const mockSnapshot = {
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockInvitation });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await declineInvitation('inv_token_123');

      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        status: 'declined',
        declinedAt: 'mock-timestamp'
      });
    });

    it('should throw error if invitation not found', async () => {
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const emptySnapshot = { empty: true, forEach: () => {} };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(emptySnapshot);

      await expect(declineInvitation('invalid_token'))
        .rejects.toThrow('Failed to decline invitation: Invitation not found');
    });

    it('should throw error if invitation is not pending', async () => {
      const mockInvitation = {
        id: 'inv123',
        status: 'accepted'
      };
      const mockCollection = { id: 'invitations' };
      const mockQuery = { id: 'query' };
      const mockSnapshot = {
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockInvitation });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

      await expect(declineInvitation('inv_token_123'))
        .rejects.toThrow('Invitation is accepted, cannot decline');
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel a pending invitation', async () => {
      const mockInvitation = {
        id: 'inv123',
        status: 'pending'
      };
      const mockDoc = { id: 'inv123' };
      const mockInvitationDoc = {
        exists: () => true,
        data: () => mockInvitation
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockInvitationDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await cancelInvitation('inv123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'invitations', 'inv123');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        status: 'cancelled'
      });
    });

    it('should throw error if invitation not found', async () => {
      const mockDoc = { id: 'inv123' };
      const mockInvitationDoc = {
        exists: () => false
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockInvitationDoc);

      await expect(cancelInvitation('inv123'))
        .rejects.toThrow('Failed to cancel invitation: Invitation not found');
    });

    it('should throw error if invitation is not pending', async () => {
      const mockInvitation = {
        id: 'inv123',
        status: 'accepted'
      };
      const mockDoc = { id: 'inv123' };
      const mockInvitationDoc = {
        exists: () => true,
        data: () => mockInvitation
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockInvitationDoc);

      await expect(cancelInvitation('inv123'))
        .rejects.toThrow('Invitation is accepted, cannot cancel');
    });
  });
});
