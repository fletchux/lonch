import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProject, getUserProjects, updateProject, deleteProject } from './projectService';
import * as firebase from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
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
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('projectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Date.now to consistent value for testing
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  describe('createProject', () => {
    it('should create a new project document in Firestore', async () => {
      const mockDoc = { id: 'user123_1234567890' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const projectData = {
        name: 'Test Project',
        clientType: 'enterprise',
        status: 'active'
      };

      const result = await createProject('user123', projectData);

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projects', 'user123_1234567890');
      expect(setDoc).toHaveBeenCalledWith(mockDoc, {
        id: 'user123_1234567890',
        userId: 'user123',
        name: 'Test Project',
        clientType: 'enterprise',
        status: 'active',
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
      expect(result.id).toBe('user123_1234567890');
      expect(result.userId).toBe('user123');
    });

    it('should throw error if creation fails', async () => {
      const mockDoc = { id: 'user123_1234567890' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(createProject('user123', { name: 'Test Project' }))
        .rejects.toThrow('Failed to create project: Firestore error');
    });
  });

  describe('getUserProjects', () => {
    it('should return all projects for a user', async () => {
      const mockCollection = { id: 'projects' };
      const mockQuery = { id: 'query' };
      const mockProjects = [
        { id: 'project1', name: 'Project 1', userId: 'user123' },
        { id: 'project2', name: 'Project 2', userId: 'user123' }
      ];
      const mockQuerySnapshot = {
        forEach: (callback) => {
          mockProjects.forEach(project => {
            callback({ data: () => project });
          });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(where).mockReturnValue({ field: 'userId', operator: '==', value: 'user123' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);

      const result = await getUserProjects('user123');

      expect(collection).toHaveBeenCalledWith(firebase.db, 'projects');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user123');
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array if user has no projects', async () => {
      const mockCollection = { id: 'projects' };
      const mockQuery = { id: 'query' };
      const mockQuerySnapshot = {
        forEach: () => {}
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(where).mockReturnValue({ field: 'userId', operator: '==', value: 'user123' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);

      const result = await getUserProjects('user123');

      expect(result).toEqual([]);
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'projects' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserProjects('user123'))
        .rejects.toThrow('Failed to get user projects: Firestore error');
    });
  });

  describe('updateProject', () => {
    it('should update project document with new data and timestamp', async () => {
      const mockDoc = { id: 'project123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const updates = { name: 'Updated Project Name' };
      await updateProject('project123', updates);

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projects', 'project123');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        name: 'Updated Project Name',
        updatedAt: 'mock-timestamp'
      });
    });

    it('should throw error if update fails', async () => {
      const mockDoc = { id: 'project123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(updateProject('project123', { name: 'Updated Name' }))
        .rejects.toThrow('Failed to update project: Firestore error');
    });
  });

  describe('deleteProject', () => {
    it('should delete project document from Firestore', async () => {
      const mockDoc = { id: 'project123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await deleteProject('project123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projects', 'project123');
      expect(deleteDoc).toHaveBeenCalledWith(mockDoc);
    });

    it('should throw error if delete fails', async () => {
      const mockDoc = { id: 'project123' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(deleteProject('project123'))
        .rejects.toThrow('Failed to delete project: Firestore error');
    });
  });
});
