import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createProject,
  getUserProjects,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectMembers,
  updateMemberRole,
  removeMember,
  getUserProjectsAsMember,
  getUserRoleInProject,
  getUserGroupInProject,
  updateMemberGroup,
  migrateExistingMembersToGroups
} from './projectService';
import * as firebase from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
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
  getDoc: vi.fn(),
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

  describe('addProjectMember', () => {
    it('should add a member to a project with role and default group', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await addProjectMember('project123', 'user456', 'editor', 'user789');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projectMembers', 'project123_user456');
      expect(setDoc).toHaveBeenCalledWith(mockDoc, {
        id: 'project123_user456',
        projectId: 'project123',
        userId: 'user456',
        role: 'editor',
        group: 'consulting', // Default group
        invitedBy: 'user789',
        joinedAt: 'mock-timestamp',
        lastActiveAt: 'mock-timestamp'
      });
      expect(result.id).toBe('project123_user456');
      expect(result.role).toBe('editor');
      expect(result.group).toBe('consulting');
    });

    it('should add a member with specified group', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await addProjectMember('project123', 'user456', 'viewer', 'user789', 'client');

      expect(setDoc).toHaveBeenCalledWith(mockDoc, expect.objectContaining({
        group: 'client'
      }));
      expect(result.group).toBe('client');
    });

    it('should throw error if adding member fails', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(setDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(addProjectMember('project123', 'user456', 'editor', 'user789'))
        .rejects.toThrow('Failed to add project member: Firestore error');
    });
  });

  describe('getProjectMembers', () => {
    it('should return all members of a project', async () => {
      const mockCollection = { id: 'projectMembers' };
      const mockQuery = { id: 'query' };
      const mockMembers = [
        { id: 'project123_user456', projectId: 'project123', userId: 'user456', role: 'owner' },
        { id: 'project123_user789', projectId: 'project123', userId: 'user789', role: 'editor' }
      ];
      const mockQuerySnapshot = {
        forEach: (callback) => {
          mockMembers.forEach(member => {
            callback({ data: () => member });
          });
        }
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(where).mockReturnValue({ field: 'projectId', operator: '==', value: 'project123' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);

      const result = await getProjectMembers('project123');

      expect(collection).toHaveBeenCalledWith(firebase.db, 'projectMembers');
      expect(where).toHaveBeenCalledWith('projectId', '==', 'project123');
      expect(result).toEqual(mockMembers);
    });

    it('should return empty array if project has no members', async () => {
      const mockCollection = { id: 'projectMembers' };
      const mockQuery = { id: 'query' };
      const mockQuerySnapshot = {
        forEach: () => {}
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(where).mockReturnValue({ field: 'projectId', operator: '==', value: 'project123' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);

      const result = await getProjectMembers('project123');

      expect(result).toEqual([]);
    });

    it('should throw error if query fails', async () => {
      const mockCollection = { id: 'projectMembers' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getProjectMembers('project123'))
        .rejects.toThrow('Failed to get project members: Firestore error');
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role in a project', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateMemberRole('project123', 'user456', 'admin');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projectMembers', 'project123_user456');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        role: 'admin',
        lastActiveAt: 'mock-timestamp'
      });
    });

    it('should throw error if update fails', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(updateMemberRole('project123', 'user456', 'admin'))
        .rejects.toThrow('Failed to update member role: Firestore error');
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a project', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await removeMember('project123', 'user456');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projectMembers', 'project123_user456');
      expect(deleteDoc).toHaveBeenCalledWith(mockDoc);
    });

    it('should throw error if removal fails', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(removeMember('project123', 'user456'))
        .rejects.toThrow('Failed to remove member: Firestore error');
    });
  });

  describe('getUserProjectsAsMember', () => {
    it('should return all projects where user is a member', async () => {
      const mockMembersCollection = { id: 'projectMembers' };
      const mockQuery = { id: 'query' };
      const mockMemberData = [
        { id: 'project123_user456', projectId: 'project123', userId: 'user456', role: 'editor' },
        { id: 'project789_user456', projectId: 'project789', userId: 'user456', role: 'viewer' }
      ];
      const mockMemberSnapshot = {
        empty: false,
        forEach: (callback) => {
          mockMemberData.forEach(member => {
            callback({ data: () => member });
          });
        }
      };
      const mockProjectDoc1 = {
        exists: () => true,
        data: () => ({ id: 'project123', name: 'Project 1', userId: 'owner123' })
      };
      const mockProjectDoc2 = {
        exists: () => true,
        data: () => ({ id: 'project789', name: 'Project 2', userId: 'owner789' })
      };

      vi.mocked(collection).mockReturnValue(mockMembersCollection);
      vi.mocked(where).mockReturnValue({ field: 'userId', operator: '==', value: 'user456' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockMemberSnapshot);
      vi.mocked(getDoc)
        .mockResolvedValueOnce(mockProjectDoc1)
        .mockResolvedValueOnce(mockProjectDoc2);

      const result = await getUserProjectsAsMember('user456');

      expect(collection).toHaveBeenCalledWith(firebase.db, 'projectMembers');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user456');
      expect(getDoc).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { id: 'project123', name: 'Project 1', userId: 'owner123' },
        { id: 'project789', name: 'Project 2', userId: 'owner789' }
      ]);
    });

    it('should return empty array if user is not a member of any project', async () => {
      const mockMembersCollection = { id: 'projectMembers' };
      const mockQuery = { id: 'query' };
      const mockMemberSnapshot = {
        empty: true,
        forEach: () => {}
      };

      vi.mocked(collection).mockReturnValue(mockMembersCollection);
      vi.mocked(where).mockReturnValue({ field: 'userId', operator: '==', value: 'user456' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockMemberSnapshot);

      const result = await getUserProjectsAsMember('user456');

      expect(result).toEqual([]);
    });

    it('should skip projects that do not exist', async () => {
      const mockMembersCollection = { id: 'projectMembers' };
      const mockQuery = { id: 'query' };
      const mockMemberData = [
        { id: 'project123_user456', projectId: 'project123', userId: 'user456', role: 'editor' }
      ];
      const mockMemberSnapshot = {
        empty: false,
        forEach: (callback) => {
          mockMemberData.forEach(member => {
            callback({ data: () => member });
          });
        }
      };
      const mockProjectDoc = {
        exists: () => false
      };

      vi.mocked(collection).mockReturnValue(mockMembersCollection);
      vi.mocked(where).mockReturnValue({ field: 'userId', operator: '==', value: 'user456' });
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(mockMemberSnapshot);
      vi.mocked(getDoc).mockResolvedValue(mockProjectDoc);

      const result = await getUserProjectsAsMember('user456');

      expect(result).toEqual([]);
    });

    it('should throw error if query fails', async () => {
      const mockMembersCollection = { id: 'projectMembers' };
      vi.mocked(collection).mockReturnValue(mockMembersCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserProjectsAsMember('user456'))
        .rejects.toThrow('Failed to get user projects as member: Firestore error');
    });
  });

  describe('getUserRoleInProject', () => {
    it('should return user role if member exists', async () => {
      const mockDoc = { id: 'project123_user456' };
      const mockMemberDoc = {
        exists: () => true,
        data: () => ({ id: 'project123_user456', role: 'editor' })
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockMemberDoc);

      const result = await getUserRoleInProject('user456', 'project123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projectMembers', 'project123_user456');
      expect(result).toBe('editor');
    });

    it('should return null if user is not a member', async () => {
      const mockDoc = { id: 'project123_user456' };
      const mockMemberDoc = {
        exists: () => false
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockMemberDoc);

      const result = await getUserRoleInProject('user456', 'project123');

      expect(result).toBeNull();
    });

    it('should throw error if query fails', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserRoleInProject('user456', 'project123'))
        .rejects.toThrow('Failed to get user role in project: Firestore error');
    });
  });

  describe('getUserGroupInProject', () => {
    it('should return user group if member exists', async () => {
      const mockDoc = { id: 'project123_user456' };
      const mockMemberDoc = {
        exists: () => true,
        data: () => ({ id: 'project123_user456', role: 'editor', group: 'consulting' })
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockMemberDoc);

      const result = await getUserGroupInProject('user456', 'project123');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projectMembers', 'project123_user456');
      expect(result).toBe('consulting');
    });

    it('should return default "consulting" if group field is missing', async () => {
      const mockDoc = { id: 'project123_user456' };
      const mockMemberDoc = {
        exists: () => true,
        data: () => ({ id: 'project123_user456', role: 'editor' }) // No group field
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockMemberDoc);

      const result = await getUserGroupInProject('user456', 'project123');

      expect(result).toBe('consulting');
    });

    it('should return null if user is not a member', async () => {
      const mockDoc = { id: 'project123_user456' };
      const mockMemberDoc = {
        exists: () => false
      };

      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockResolvedValue(mockMemberDoc);

      const result = await getUserGroupInProject('user456', 'project123');

      expect(result).toBeNull();
    });

    it('should throw error if query fails', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getUserGroupInProject('user456', 'project123'))
        .rejects.toThrow('Failed to get user group in project: Firestore error');
    });
  });

  describe('updateMemberGroup', () => {
    it('should update member group in a project', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateMemberGroup('project123', 'user456', 'client');

      expect(doc).toHaveBeenCalledWith(firebase.db, 'projectMembers', 'project123_user456');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, {
        group: 'client',
        lastActiveAt: 'mock-timestamp'
      });
    });

    it('should throw error if update fails', async () => {
      const mockDoc = { id: 'project123_user456' };
      vi.mocked(doc).mockReturnValue(mockDoc);
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(updateMemberGroup('project123', 'user456', 'client'))
        .rejects.toThrow('Failed to update member group: Firestore error');
    });
  });

  describe('migrateExistingMembersToGroups', () => {
    it('should migrate members without group field to consulting group', async () => {
      const mockCollection = { id: 'projectMembers' };
      const mockMembers = [
        { id: 'project1_user1', role: 'owner' }, // No group field
        { id: 'project2_user2', role: 'editor' }, // No group field
        { id: 'project3_user3', role: 'viewer', group: 'client' } // Already has group
      ];
      const mockDocs = mockMembers.map((data, index) => ({
        id: data.id,
        data: () => data,
        ref: { id: `ref_${index}` }
      }));
      const mockQuerySnapshot = {
        size: 3,
        docs: mockDocs,
        forEach: () => {} // Not used in this implementation
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const result = await migrateExistingMembersToGroups();

      expect(collection).toHaveBeenCalledWith(firebase.db, 'projectMembers');
      expect(getDocs).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledTimes(2); // Only 2 members without group
      expect(result).toEqual({
        total: 3,
        updated: 2,
        alreadyHasGroup: 1,
        errors: 0,
        success: true
      });
    });

    it('should handle migration errors gracefully', async () => {
      const mockCollection = { id: 'projectMembers' };
      const mockMembers = [
        { id: 'project1_user1', role: 'owner' }, // Will succeed
        { id: 'project2_user2', role: 'editor' } // Will fail
      ];
      const mockDocs = mockMembers.map((data, index) => ({
        id: data.id,
        data: () => data,
        ref: { id: `ref_${index}` }
      }));
      const mockQuerySnapshot = {
        size: 2,
        docs: mockDocs
      };

      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot);
      vi.mocked(updateDoc)
        .mockResolvedValueOnce(undefined) // First update succeeds
        .mockRejectedValueOnce(new Error('Update failed')); // Second update fails

      const result = await migrateExistingMembersToGroups();

      expect(result).toEqual({
        total: 2,
        updated: 1,
        alreadyHasGroup: 0,
        errors: 1,
        success: false
      });
    });

    it('should throw error if getDocs fails', async () => {
      const mockCollection = { id: 'projectMembers' };
      vi.mocked(collection).mockReturnValue(mockCollection);
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(migrateExistingMembersToGroups())
        .rejects.toThrow('Failed to migrate existing members: Firestore error');
    });
  });
});
