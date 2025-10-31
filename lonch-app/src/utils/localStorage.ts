/**
 * LocalStorage Utilities
 *
 * Helper functions for managing localStorage project data.
 * Used for migrating projects from localStorage to Firestore when users sign up/login.
 */

const PROJECTS_KEY = 'lonch_projects';

/**
 * Get projects from localStorage
 * @returns Array of project objects from localStorage, or empty array if none exist
 */
export function getLocalStorageProjects(): any[] {
  try {
    const projectsJSON = localStorage.getItem(PROJECTS_KEY);

    if (!projectsJSON) {
      return [];
    }

    const projects = JSON.parse(projectsJSON);

    // Validate that it's an array
    if (!Array.isArray(projects)) {
      console.warn('localStorage projects is not an array, returning empty array');
      return [];
    }

    return projects;
  } catch (error) {
    console.error('Error reading projects from localStorage:', error);
    return [];
  }
}

/**
 * Clear projects from localStorage
 * @returns True if successful, false otherwise
 */
export function clearLocalStorageProjects(): boolean {
  try {
    localStorage.removeItem(PROJECTS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing projects from localStorage:', error);
    return false;
  }
}

/**
 * Save projects to localStorage
 * @param projects - Array of project objects to save
 * @returns True if successful, false otherwise
 */
export function saveLocalStorageProjects(projects: any[]): boolean {
  try {
    if (!Array.isArray(projects)) {
      throw new Error('Projects must be an array');
    }

    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error('Error saving projects to localStorage:', error);
    return false;
  }
}
