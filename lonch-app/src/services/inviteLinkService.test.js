import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateInviteLink,
  getInviteLink,
  getProjectInviteLinks,
  acceptInviteLink,
  revokeInviteLink
} from './inviteLinkService';
import * as firebase from '../config/firebase';
import * as projectService from './projectService';
import * as activityLogService from './activityLogService';

// Mock Firebase
vi.mock('../config/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockServerTimestamp = vi.fn(() => new Date());

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  setDoc: (...args) => mockSetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  serverTimestamp: () => mockServerTimestamp()
}));

// Mock project service
vi.mock('./projectService', () => ({
  addProjectMember: vi.fn(),
  getProjectMembers: vi.fn()
}));

// Mock activity log service
vi.mock('./activityLogService', () => ({
  logActivity: vi.fn()
}));

describe('inviteLinkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin
    delete window.location;
    window.location = { origin: 'http://localhost:5173' };
  });

  describe('generateInviteLink', () => {
    it('should generate an invite link with secure token', async () => {
      mockSetDoc.mockResolvedValue();
      vi.mocked(activityLogService.logActivity).mockResolvedValue();

      const result = await generateInviteLink(
        'project-123',
        'editor',
        'consulting',
        'user-456'
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('token');
      expect(result.token).toMatch(/^link_[0-9a-f]{64}$/);
      expect(result).toHaveProperty('url');
      expect(result.url).toMatch(/^http:\/\/localhost:5173\/invite\/link_/);
      expect(result.projectId).toBe('project-123');
      expect(result.role).toBe('editor');
      expect(result.group).toBe('consulting');
      expect(result.createdBy).toBe('user-456');
      expect(result.status).toBe('active');
    });

    it('should set expiration to 7 days from now', async () => {
      mockSetDoc.mockResolvedValue();
      vi.mocked(activityLogService.logActivity).mockResolvedValue();

      const beforeGeneration = new Date();
      const result = await generateInviteLink('project-123', 'viewer', 'client', 'user-456');
      const afterGeneration = new Date();

      const expectedMinExpiration = new Date(beforeGeneration);
      expectedMinExpiration.setDate(expectedMinExpiration.getDate() + 7);

      const expectedMaxExpiration = new Date(afterGeneration);
      expectedMaxExpiration.setDate(expectedMaxExpiration.getDate() + 7);

      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMinExpiration.getTime() - 1000);
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(expectedMaxExpiration.getTime() + 1000);
    });

    it('should save link to Firestore', async () => {
      mockSetDoc.mockResolvedValue();
      vi.mocked(activityLogService.logActivity).mockResolvedValue();

      await generateInviteLink('project-123', 'admin', 'consulting', 'user-456');

      expect(mockSetDoc).toHaveBeenCalled();
      const callArgs = mockSetDoc.mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        projectId: 'project-123',
        role: 'admin',
        group: 'consulting',
        createdBy: 'user-456',
        status: 'active'
      });
    });

    it('should log activity when link is created', async () => {
      mockSetDoc.mockResolvedValue();
      vi.mocked(activityLogService.logActivity).mockResolvedValue();

      await generateInviteLink('project-123', 'editor', 'client', 'user-456');

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        'project-123',
        'user-456',
        'invite_link_created',
        'invite_link',
        expect.any(String),
        expect.objectContaining({
          role: 'editor',
          group: 'client'
        }),
        'client'
      );
    });

    it('should not fail if activity logging fails', async () => {
      mockSetDoc.mockResolvedValue();
      vi.mocked(activityLogService.logActivity).mockRejectedValue(new Error('Logging failed'));

      await expect(
        generateInviteLink('project-123', 'viewer', 'client', 'user-456')
      ).resolves.toBeDefined();
    });

    it('should throw error if Firestore write fails', async () => {
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(
        generateInviteLink('project-123', 'editor', 'consulting', 'user-456')
      ).rejects.toThrow('Failed to generate invite link');
    });
  });

  describe('getInviteLink', () => {
    it('should return link when token is found', async () => {
      const mockLink = {
        id: 'link-123',
        token: 'link_abc123',
        projectId: 'project-123',
        role: 'editor',
        group: 'consulting',
        status: 'active'
      };

      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockLink });
        }
      });

      const result = await getInviteLink('link_abc123');

      expect(result).toEqual(mockLink);
    });

    it('should return null when token is not found', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        forEach: () => {}
      });

      const result = await getInviteLink('invalid_token');

      expect(result).toBeNull();
    });

    it('should throw error if Firestore read fails', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getInviteLink('token')).rejects.toThrow('Failed to get invite link');
    });
  });

  describe('getProjectInviteLinks', () => {
    const mockLinks = [
      {
        id: 'link-1',
        token: 'token1',
        projectId: 'project-123',
        role: 'editor',
        group: 'consulting',
        createdBy: 'user-1',
        status: 'active'
      },
      {
        id: 'link-2',
        token: 'token2',
        projectId: 'project-123',
        role: 'viewer',
        group: 'client',
        createdBy: 'user-2',
        status: 'used'
      }
    ];

    it('should return all links for owner', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          mockLinks.forEach(link => callback({ data: () => link }));
        }
      });

      const result = await getProjectInviteLinks('project-123', 'user-owner', 'owner');

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockLinks);
    });

    it('should return all links for admin', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          mockLinks.forEach(link => callback({ data: () => link }));
        }
      });

      const result = await getProjectInviteLinks('project-123', 'user-admin', 'admin');

      expect(result).toHaveLength(2);
    });

    it('should return only own links for editor', async () => {
      const ownLinks = [mockLinks[0]]; // Only links created by user-1

      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          ownLinks.forEach(link => callback({ data: () => link }));
        }
      });

      const result = await getProjectInviteLinks('project-123', 'user-1', 'editor');

      expect(result).toHaveLength(1);
      expect(result[0].createdBy).toBe('user-1');
    });

    it('should return only own links for viewer', async () => {
      const ownLinks = [mockLinks[1]]; // Only links created by user-2

      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          ownLinks.forEach(link => callback({ data: () => link }));
        }
      });

      const result = await getProjectInviteLinks('project-123', 'user-2', 'viewer');

      expect(result).toHaveLength(1);
      expect(result[0].createdBy).toBe('user-2');
    });

    it('should return empty array when no links exist', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        forEach: () => {}
      });

      const result = await getProjectInviteLinks('project-123', 'user-1', 'owner');

      expect(result).toEqual([]);
    });
  });

  describe('acceptInviteLink', () => {
    const mockActiveLink = {
      id: 'link-123',
      token: 'valid_token',
      projectId: 'project-123',
      role: 'editor',
      group: 'consulting',
      createdBy: 'user-creator',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days in future
    };

    beforeEach(() => {
      vi.mocked(projectService.addProjectMember).mockResolvedValue();
      vi.mocked(projectService.getProjectMembers).mockResolvedValue([]);
      vi.mocked(activityLogService.logActivity).mockResolvedValue();
    });

    it('should accept valid active link', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockActiveLink });
        }
      });
      mockUpdateDoc.mockResolvedValue();

      const result = await acceptInviteLink('valid_token', 'user-new');

      expect(result).toEqual({
        projectId: 'project-123',
        role: 'editor',
        group: 'consulting'
      });
      expect(projectService.addProjectMember).toHaveBeenCalledWith(
        'project-123',
        'user-new',
        'editor',
        'user-creator',
        'consulting'
      );
    });

    it('should update link status to used', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockActiveLink });
        }
      });
      mockUpdateDoc.mockResolvedValue();

      await acceptInviteLink('valid_token', 'user-new');

      expect(mockUpdateDoc).toHaveBeenCalled();
      const callArgs = mockUpdateDoc.mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        status: 'used',
        acceptedBy: 'user-new'
      });
    });

    it('should log activity when link is accepted', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockActiveLink });
        }
      });
      mockUpdateDoc.mockResolvedValue();

      await acceptInviteLink('valid_token', 'user-new');

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        'project-123',
        'user-new',
        'invite_link_accepted',
        'invite_link',
        'link-123',
        expect.objectContaining({
          role: 'editor',
          group: 'consulting',
          linkCreator: 'user-creator'
        }),
        'consulting'
      );
    });

    it('should throw error for non-existent link', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        forEach: () => {}
      });

      await expect(acceptInviteLink('invalid_token', 'user-new')).rejects.toThrow(
        'Invite link not found'
      );
    });

    it('should throw error for used link', async () => {
      const usedLink = { ...mockActiveLink, status: 'used' };
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => usedLink });
        }
      });

      await expect(acceptInviteLink('used_token', 'user-new')).rejects.toThrow(
        'This invite link has already been used'
      );
    });

    it('should throw error for revoked link', async () => {
      const revokedLink = { ...mockActiveLink, status: 'revoked' };
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => revokedLink });
        }
      });

      await expect(acceptInviteLink('revoked_token', 'user-new')).rejects.toThrow(
        'This invite link has been revoked'
      );
    });

    it('should throw error for expired link', async () => {
      const expiredLink = {
        ...mockActiveLink,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => expiredLink });
        }
      });

      await expect(acceptInviteLink('expired_token', 'user-new')).rejects.toThrow(
        'This invite link has expired'
      );
    });

    it('should throw error if user is already a project member', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        forEach: (callback) => {
          callback({ data: () => mockActiveLink });
        }
      });
      vi.mocked(projectService.getProjectMembers).mockResolvedValue([
        { userId: 'user-new', role: 'viewer' }
      ]);

      await expect(acceptInviteLink('valid_token', 'user-new')).rejects.toThrow(
        'You are already a member of this project'
      );
    });
  });

  describe('revokeInviteLink', () => {
    const mockActiveLink = {
      id: 'link-123',
      token: 'token123',
      projectId: 'project-123',
      role: 'editor',
      group: 'consulting',
      createdBy: 'user-creator',
      status: 'active'
    };

    beforeEach(() => {
      vi.mocked(activityLogService.logActivity).mockResolvedValue();
    });

    it('should revoke active link', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockActiveLink
      });
      mockUpdateDoc.mockResolvedValue();

      await revokeInviteLink('link-123', 'user-admin');

      expect(mockUpdateDoc).toHaveBeenCalled();
      const callArgs = mockUpdateDoc.mock.calls[0];
      expect(callArgs[1]).toEqual({ status: 'revoked' });
    });

    it('should log activity when link is revoked', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockActiveLink
      });
      mockUpdateDoc.mockResolvedValue();

      await revokeInviteLink('link-123', 'user-admin');

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        'project-123',
        'user-admin',
        'invite_link_revoked',
        'invite_link',
        'link-123',
        expect.objectContaining({
          role: 'editor',
          group: 'consulting',
          originalCreator: 'user-creator'
        }),
        'consulting'
      );
    });

    it('should throw error for non-existent link', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(revokeInviteLink('nonexistent', 'user-admin')).rejects.toThrow(
        'Invite link not found'
      );
    });

    it('should throw error when trying to revoke non-active link', async () => {
      const usedLink = { ...mockActiveLink, status: 'used' };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => usedLink
      });

      await expect(revokeInviteLink('link-123', 'user-admin')).rejects.toThrow(
        'Cannot revoke link that is used'
      );
    });

    it('should not fail if activity logging fails', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockActiveLink
      });
      mockUpdateDoc.mockResolvedValue();
      vi.mocked(activityLogService.logActivity).mockRejectedValue(new Error('Logging failed'));

      await expect(revokeInviteLink('link-123', 'user-admin')).resolves.toBeUndefined();
    });
  });
});
