import { describe, it, expect } from 'vitest';
import {
  ROLES,
  canEditProject,
  canManageMembers,
  canDeleteProject,
  canChangeRole,
  canRemoveMember,
  canInviteMembers,
  canViewActivityLog,
  getAssignableRoles,
  getRoleDisplayName,
  getRoleColor
} from './permissions';

describe('permissions', () => {
  describe('ROLES constants', () => {
    it('should define all role constants', () => {
      expect(ROLES.OWNER).toBe('owner');
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.EDITOR).toBe('editor');
      expect(ROLES.VIEWER).toBe('viewer');
    });
  });

  describe('canEditProject', () => {
    it('should allow Owner to edit', () => {
      expect(canEditProject(ROLES.OWNER)).toBe(true);
    });

    it('should allow Admin to edit', () => {
      expect(canEditProject(ROLES.ADMIN)).toBe(true);
    });

    it('should allow Editor to edit', () => {
      expect(canEditProject(ROLES.EDITOR)).toBe(true);
    });

    it('should not allow Viewer to edit', () => {
      expect(canEditProject(ROLES.VIEWER)).toBe(false);
    });
  });

  describe('canManageMembers', () => {
    it('should allow Owner to manage members', () => {
      expect(canManageMembers(ROLES.OWNER)).toBe(true);
    });

    it('should allow Admin to manage members', () => {
      expect(canManageMembers(ROLES.ADMIN)).toBe(true);
    });

    it('should not allow Editor to manage members', () => {
      expect(canManageMembers(ROLES.EDITOR)).toBe(false);
    });

    it('should not allow Viewer to manage members', () => {
      expect(canManageMembers(ROLES.VIEWER)).toBe(false);
    });
  });

  describe('canDeleteProject', () => {
    it('should allow only Owner to delete project', () => {
      expect(canDeleteProject(ROLES.OWNER)).toBe(true);
      expect(canDeleteProject(ROLES.ADMIN)).toBe(false);
      expect(canDeleteProject(ROLES.EDITOR)).toBe(false);
      expect(canDeleteProject(ROLES.VIEWER)).toBe(false);
    });
  });

  describe('canChangeRole', () => {
    it('should allow Owner to change any role', () => {
      expect(canChangeRole(ROLES.OWNER, ROLES.OWNER)).toBe(true);
      expect(canChangeRole(ROLES.OWNER, ROLES.ADMIN)).toBe(true);
      expect(canChangeRole(ROLES.OWNER, ROLES.EDITOR)).toBe(true);
      expect(canChangeRole(ROLES.OWNER, ROLES.VIEWER)).toBe(true);
    });

    it('should allow Admin to change Editor and Viewer roles only', () => {
      expect(canChangeRole(ROLES.ADMIN, ROLES.OWNER)).toBe(false);
      expect(canChangeRole(ROLES.ADMIN, ROLES.ADMIN)).toBe(false);
      expect(canChangeRole(ROLES.ADMIN, ROLES.EDITOR)).toBe(true);
      expect(canChangeRole(ROLES.ADMIN, ROLES.VIEWER)).toBe(true);
    });

    it('should not allow Editor to change any roles', () => {
      expect(canChangeRole(ROLES.EDITOR, ROLES.OWNER)).toBe(false);
      expect(canChangeRole(ROLES.EDITOR, ROLES.ADMIN)).toBe(false);
      expect(canChangeRole(ROLES.EDITOR, ROLES.EDITOR)).toBe(false);
      expect(canChangeRole(ROLES.EDITOR, ROLES.VIEWER)).toBe(false);
    });

    it('should not allow Viewer to change any roles', () => {
      expect(canChangeRole(ROLES.VIEWER, ROLES.VIEWER)).toBe(false);
    });
  });

  describe('canRemoveMember', () => {
    const userId = 'user123';
    const otherUserId = 'user456';

    it('should not allow user to remove themselves', () => {
      expect(canRemoveMember(ROLES.OWNER, ROLES.OWNER, userId, userId)).toBe(false);
      expect(canRemoveMember(ROLES.ADMIN, ROLES.ADMIN, userId, userId)).toBe(false);
    });

    it('should allow Owner to remove any other user', () => {
      expect(canRemoveMember(ROLES.OWNER, ROLES.ADMIN, userId, otherUserId)).toBe(true);
      expect(canRemoveMember(ROLES.OWNER, ROLES.EDITOR, userId, otherUserId)).toBe(true);
      expect(canRemoveMember(ROLES.OWNER, ROLES.VIEWER, userId, otherUserId)).toBe(true);
    });

    it('should allow Admin to remove Editor and Viewer only', () => {
      expect(canRemoveMember(ROLES.ADMIN, ROLES.OWNER, userId, otherUserId)).toBe(false);
      expect(canRemoveMember(ROLES.ADMIN, ROLES.ADMIN, userId, otherUserId)).toBe(false);
      expect(canRemoveMember(ROLES.ADMIN, ROLES.EDITOR, userId, otherUserId)).toBe(true);
      expect(canRemoveMember(ROLES.ADMIN, ROLES.VIEWER, userId, otherUserId)).toBe(true);
    });

    it('should not allow Editor to remove anyone', () => {
      expect(canRemoveMember(ROLES.EDITOR, ROLES.VIEWER, userId, otherUserId)).toBe(false);
    });

    it('should not allow Viewer to remove anyone', () => {
      expect(canRemoveMember(ROLES.VIEWER, ROLES.VIEWER, userId, otherUserId)).toBe(false);
    });
  });

  describe('canInviteMembers', () => {
    it('should allow Owner and Admin to invite members', () => {
      expect(canInviteMembers(ROLES.OWNER)).toBe(true);
      expect(canInviteMembers(ROLES.ADMIN)).toBe(true);
    });

    it('should not allow Editor and Viewer to invite members', () => {
      expect(canInviteMembers(ROLES.EDITOR)).toBe(false);
      expect(canInviteMembers(ROLES.VIEWER)).toBe(false);
    });
  });

  describe('canViewActivityLog', () => {
    it('should allow all roles to view activity log', () => {
      expect(canViewActivityLog(ROLES.OWNER)).toBe(true);
      expect(canViewActivityLog(ROLES.ADMIN)).toBe(true);
      expect(canViewActivityLog(ROLES.EDITOR)).toBe(true);
      expect(canViewActivityLog(ROLES.VIEWER)).toBe(true);
    });
  });

  describe('getAssignableRoles', () => {
    it('should return all roles for Owner', () => {
      const roles = getAssignableRoles(ROLES.OWNER);
      expect(roles).toEqual([ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER]);
    });

    it('should return Editor and Viewer roles for Admin', () => {
      const roles = getAssignableRoles(ROLES.ADMIN);
      expect(roles).toEqual([ROLES.EDITOR, ROLES.VIEWER]);
    });

    it('should return empty array for Editor', () => {
      const roles = getAssignableRoles(ROLES.EDITOR);
      expect(roles).toEqual([]);
    });

    it('should return empty array for Viewer', () => {
      const roles = getAssignableRoles(ROLES.VIEWER);
      expect(roles).toEqual([]);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return display names for all roles', () => {
      expect(getRoleDisplayName(ROLES.OWNER)).toBe('Owner');
      expect(getRoleDisplayName(ROLES.ADMIN)).toBe('Admin');
      expect(getRoleDisplayName(ROLES.EDITOR)).toBe('Editor');
      expect(getRoleDisplayName(ROLES.VIEWER)).toBe('Viewer');
    });

    it('should return original value for unknown role', () => {
      expect(getRoleDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('getRoleColor', () => {
    it('should return colors for all roles', () => {
      expect(getRoleColor(ROLES.OWNER)).toBe('teal');
      expect(getRoleColor(ROLES.ADMIN)).toBe('yellow');
      expect(getRoleColor(ROLES.EDITOR)).toBe('blue');
      expect(getRoleColor(ROLES.VIEWER)).toBe('gray');
    });

    it('should return gray for unknown role', () => {
      expect(getRoleColor('unknown')).toBe('gray');
    });
  });
});
