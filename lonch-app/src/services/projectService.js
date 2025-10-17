import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Project Service
 *
 * Manages project data in Firestore.
 * Collection structure: projects/{projectId}
 *
 * Project document schema:
 * {
 *   id: string,
 *   userId: string,
 *   name: string,
 *   clientType: string,
 *   intakeTemplate: object | null,
 *   checklistTemplate: object | null,
 *   stakeholderTemplate: object | null,
 *   teamTemplate: object | null,
 *   documents: array,
 *   extractedData: object | null,
 *   extractionConflicts: object | null,
 *   manuallyEditedFields: array,
 *   status: string,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

/**
 * Create a new project in Firestore
 * @param {string} userId - User ID who owns the project
 * @param {Object} projectData - Project data object
 * @returns {Promise<Object>} The created project document with ID
 */
export async function createProject(userId, projectData) {
  try {
    // Generate a unique project ID
    const projectId = `${userId}_${Date.now()}`;
    const projectRef = doc(db, 'projects', projectId);

    const fullProjectData = {
      id: projectId,
      userId,
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(projectRef, fullProjectData);

    return fullProjectData;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error.message}`);
  }
}

/**
 * Get all projects for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of project documents
 */
export async function getUserProjects(userId) {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data());
    });

    return projects;
  } catch (error) {
    console.error('Error getting user projects:', error);
    throw new Error(`Failed to get user projects: ${error.message}`);
  }
}

/**
 * Update a project in Firestore
 * @param {string} projectId - Project ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<void>}
 */
export async function updateProject(projectId, updates) {
  try {
    const projectRef = doc(db, 'projects', projectId);

    // Add updatedAt timestamp to all updates
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(projectRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error(`Failed to update project: ${error.message}`);
  }
}

/**
 * Delete a project from Firestore
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export async function deleteProject(projectId) {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}
