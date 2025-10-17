import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLocalStorageProjects, clearLocalStorageProjects, saveLocalStorageProjects } from './localStorage';

describe('localStorage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('getLocalStorageProjects', () => {
    it('should return empty array when no projects exist', () => {
      const result = getLocalStorageProjects();
      expect(result).toEqual([]);
    });

    it('should return array of projects when they exist', () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', clientType: 'enterprise' },
        { id: '2', name: 'Project 2', clientType: 'startup' }
      ];
      localStorage.setItem('lonch_projects', JSON.stringify(mockProjects));

      const result = getLocalStorageProjects();
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array if localStorage data is not an array', () => {
      localStorage.setItem('lonch_projects', JSON.stringify({ id: '1', name: 'Not an array' }));

      const result = getLocalStorageProjects();
      expect(result).toEqual([]);
    });

    it('should return empty array if localStorage data is corrupted', () => {
      localStorage.setItem('lonch_projects', 'invalid json');

      const result = getLocalStorageProjects();
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', () => {
      // Mock localStorage.getItem to throw error
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getLocalStorageProjects();
      expect(result).toEqual([]);
    });
  });

  describe('clearLocalStorageProjects', () => {
    it('should clear projects from localStorage', () => {
      const mockProjects = [
        { id: '1', name: 'Project 1' }
      ];
      localStorage.setItem('lonch_projects', JSON.stringify(mockProjects));

      const result = clearLocalStorageProjects();

      expect(result).toBe(true);
      expect(localStorage.getItem('lonch_projects')).toBeNull();
    });

    it('should return true even if no projects exist', () => {
      const result = clearLocalStorageProjects();
      expect(result).toBe(true);
    });

    it('should return false if clearing fails', () => {
      // Mock localStorage.removeItem to throw error
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = clearLocalStorageProjects();
      expect(result).toBe(false);
    });
  });

  describe('saveLocalStorageProjects', () => {
    it('should save projects to localStorage', () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', clientType: 'enterprise' },
        { id: '2', name: 'Project 2', clientType: 'startup' }
      ];

      const result = saveLocalStorageProjects(mockProjects);

      expect(result).toBe(true);
      const saved = JSON.parse(localStorage.getItem('lonch_projects'));
      expect(saved).toEqual(mockProjects);
    });

    it('should return false if projects is not an array', () => {
      const result = saveLocalStorageProjects({ id: '1', name: 'Not an array' });
      expect(result).toBe(false);
    });

    it('should save empty array successfully', () => {
      const result = saveLocalStorageProjects([]);
      expect(result).toBe(true);
      const saved = JSON.parse(localStorage.getItem('lonch_projects'));
      expect(saved).toEqual([]);
    });

    it('should return false if saving fails', () => {
      // Mock localStorage.setItem to throw error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = saveLocalStorageProjects([{ id: '1', name: 'Project 1' }]);
      expect(result).toBe(false);
    });
  });
});
