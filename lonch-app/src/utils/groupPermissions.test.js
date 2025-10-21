import { describe, it, expect } from 'vitest';
import {
  GROUP,
  VISIBILITY,
  canViewDocument,
  canSetDocumentVisibility,
  canMoveUserBetweenGroups,
  getDefaultDocumentVisibility
} from './groupPermissions';

describe('groupPermissions', () => {
  describe('GROUP constants', () => {
    it('should export CONSULTING constant', () => {
      expect(GROUP.CONSULTING).toBe('consulting');
    });

    it('should export CLIENT constant', () => {
      expect(GROUP.CLIENT).toBe('client');
    });
  });

  describe('VISIBILITY constants', () => {
    it('should export CONSULTING_ONLY constant', () => {
      expect(VISIBILITY.CONSULTING_ONLY).toBe('consulting_only');
    });

    it('should export CLIENT_ONLY constant', () => {
      expect(VISIBILITY.CLIENT_ONLY).toBe('client_only');
    });

    it('should export BOTH constant', () => {
      expect(VISIBILITY.BOTH).toBe('both');
    });
  });

  describe('canViewDocument', () => {
    it('should allow owner to view any document regardless of visibility', () => {
      expect(canViewDocument('consulting', 'consulting_only', 'owner')).toBe(true);
      expect(canViewDocument('consulting', 'client_only', 'owner')).toBe(true);
      expect(canViewDocument('consulting', 'both', 'owner')).toBe(true);
      expect(canViewDocument('client', 'consulting_only', 'owner')).toBe(true);
      expect(canViewDocument('client', 'client_only', 'owner')).toBe(true);
      expect(canViewDocument('client', 'both', 'owner')).toBe(true);
    });

    it('should allow any user to view documents with "both" visibility', () => {
      expect(canViewDocument('consulting', 'both', 'admin')).toBe(true);
      expect(canViewDocument('consulting', 'both', 'editor')).toBe(true);
      expect(canViewDocument('consulting', 'both', 'viewer')).toBe(true);
      expect(canViewDocument('client', 'both', 'admin')).toBe(true);
      expect(canViewDocument('client', 'both', 'editor')).toBe(true);
      expect(canViewDocument('client', 'both', 'viewer')).toBe(true);
    });

    it('should allow consulting group to view consulting_only documents', () => {
      expect(canViewDocument('consulting', 'consulting_only', 'admin')).toBe(true);
      expect(canViewDocument('consulting', 'consulting_only', 'editor')).toBe(true);
      expect(canViewDocument('consulting', 'consulting_only', 'viewer')).toBe(true);
    });

    it('should not allow client group to view consulting_only documents', () => {
      expect(canViewDocument('client', 'consulting_only', 'admin')).toBe(false);
      expect(canViewDocument('client', 'consulting_only', 'editor')).toBe(false);
      expect(canViewDocument('client', 'consulting_only', 'viewer')).toBe(false);
    });

    it('should allow client group to view client_only documents', () => {
      expect(canViewDocument('client', 'client_only', 'admin')).toBe(true);
      expect(canViewDocument('client', 'client_only', 'editor')).toBe(true);
      expect(canViewDocument('client', 'client_only', 'viewer')).toBe(true);
    });

    it('should not allow consulting group to view client_only documents', () => {
      expect(canViewDocument('consulting', 'client_only', 'admin')).toBe(false);
      expect(canViewDocument('consulting', 'client_only', 'editor')).toBe(false);
      expect(canViewDocument('consulting', 'client_only', 'viewer')).toBe(false);
    });

    it('should work without role parameter (null role)', () => {
      expect(canViewDocument('consulting', 'both')).toBe(true);
      expect(canViewDocument('consulting', 'consulting_only')).toBe(true);
      expect(canViewDocument('client', 'both')).toBe(true);
      expect(canViewDocument('client', 'client_only')).toBe(true);
    });
  });

  describe('canSetDocumentVisibility', () => {
    it('should allow owner in consulting group to set document visibility', () => {
      expect(canSetDocumentVisibility('owner', 'consulting')).toBe(true);
    });

    it('should allow admin in consulting group to set document visibility', () => {
      expect(canSetDocumentVisibility('admin', 'consulting')).toBe(true);
    });

    it('should not allow editor in consulting group to set document visibility', () => {
      expect(canSetDocumentVisibility('editor', 'consulting')).toBe(false);
    });

    it('should not allow viewer in consulting group to set document visibility', () => {
      expect(canSetDocumentVisibility('viewer', 'consulting')).toBe(false);
    });

    it('should not allow owner in client group to set document visibility', () => {
      expect(canSetDocumentVisibility('owner', 'client')).toBe(false);
    });

    it('should not allow admin in client group to set document visibility', () => {
      expect(canSetDocumentVisibility('admin', 'client')).toBe(false);
    });

    it('should not allow editor in client group to set document visibility', () => {
      expect(canSetDocumentVisibility('editor', 'client')).toBe(false);
    });

    it('should not allow viewer in client group to set document visibility', () => {
      expect(canSetDocumentVisibility('viewer', 'client')).toBe(false);
    });
  });

  describe('canMoveUserBetweenGroups', () => {
    it('should allow owner to move users between groups', () => {
      expect(canMoveUserBetweenGroups('owner')).toBe(true);
    });

    it('should allow admin to move users between groups', () => {
      expect(canMoveUserBetweenGroups('admin')).toBe(true);
    });

    it('should not allow editor to move users between groups', () => {
      expect(canMoveUserBetweenGroups('editor')).toBe(false);
    });

    it('should not allow viewer to move users between groups', () => {
      expect(canMoveUserBetweenGroups('viewer')).toBe(false);
    });
  });

  describe('getDefaultDocumentVisibility', () => {
    it('should return "consulting_only" for consulting group', () => {
      expect(getDefaultDocumentVisibility('consulting')).toBe('consulting_only');
    });

    it('should return "both" for client group', () => {
      expect(getDefaultDocumentVisibility('client')).toBe('both');
    });

    it('should return "both" as fallback for unknown group', () => {
      expect(getDefaultDocumentVisibility('unknown')).toBe('both');
      expect(getDefaultDocumentVisibility(null)).toBe('both');
      expect(getDefaultDocumentVisibility(undefined)).toBe('both');
    });
  });
});
