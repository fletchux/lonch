import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, getUser, updateUser } from './userService';
import * as firebase from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Mock Firestore
vi.mock('../config/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user document in Firestore', async () => {
      const mockDoc = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await createUser('user123', 'test@example.com', 'Test User', 'email', null);

      expect(doc).toHaveBeenCalledWith(firebase.db, 'users', 'user123');
      expect(setDoc).toHaveBeenCalledWith(mockDoc, {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        authProvider: 'email',
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
      expect(result).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        authProvider: 'email',
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
    });

    it('should throw error if creation fails', async () => {
      const mockDoc = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(createUser('user123', 'test@example.com', 'Test User', 'email'))
        .rejects.toThrow('Failed to create user: Firestore error');
    });
  });

  describe('getUser', () => {
    it('should return user document if it exists', async () => {
      const mockDoc = { id: 'user123' };
      const mockUserData = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      const mockSnap = {
        exists: () => true,
        data: () => mockUserData
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockSnap);

      const result = await getUser('user123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'users', 'user123');
      expect(getDoc).toHaveBeenCalledWith(mockDoc);
      expect(result).toEqual(mockUserData);
    });

    it('should return null if user does not exist', async () => {
      const mockDoc = { id: 'user123' };
      const mockSnap = {
        exists: () => false
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockSnap);

      const result = await getUser('user123');

      expect(result).toBeNull();
    });

    it('should throw error if get fails', async () => {
      const mockDoc = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getUser('user123'))
        .rejects.toThrow('Failed to get user: Firestore error');
    });
  });

  describe('updateUser', () => {
    it('should update user document with new data and timestamp', async () => {
      const mockDoc = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const updates = { displayName: 'Updated Name' };
      await updateUser('user123', updates);

      expect(doc).toHaveBeenCalledWith(firebase.db, 'users', 'user123');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        displayName: 'Updated Name',
        updatedAt: 'mock-timestamp'
      });
    });

    it('should throw error if update fails', async () => {
      const mockDoc = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(updateUser('user123', { displayName: 'Updated Name' }))
        .rejects.toThrow('Failed to update user: Firestore error');
    });
  });
});
