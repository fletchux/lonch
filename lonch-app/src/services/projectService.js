import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
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
 * Collection structure:
 *   - projects/{projectId}
 *   - projectMembers/{memberId} - subcollection for project collaborators
 *
 * Project document schema:
 * {
 *   id: string,
 *   userId: string (project owner),
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
 *   members: array of memberIds (reference to projectMembers collection),
 *   status: string,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 *
 * ProjectMember document schema (in projectMembers collection):
 * {
 *   id: string (memberId = `${projectId}_${userId}`),
 *   projectId: string,
 *   userId: string,
 *   role: 'owner' | 'admin' | 'editor' | 'viewer',
 *   group: 'consulting' | 'client',
 *   invitedBy: string (userId of inviter),
 *   joinedAt: timestamp,
 *   lastActiveAt: timestamp
 * }
 */

/**
 * Sanitize project data to remove non-serializable objects like File objects
 * @param {Object} projectData - Raw project data
 * @returns {Object} Sanitized project data safe for Firestore
 */
function sanitizeProjectData(projectData) {
  const sanitized = { ...projectData };

  // Convert documents array to serializable format
  if (sanitized.documents && Array.isArray(sanitized.documents)) {
    sanitized.documents = sanitized.documents.map(doc => {
      // If doc has a File object, extract only serializable metadata
      if (doc.file instanceof File) {
        const { file, ...serializableDoc } = doc;
        return {
          ...serializableDoc,
          // Keep file metadata but not the File object itself
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        };
      }
      return doc;
    });
  }

  return sanitized;
}

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

    // Sanitize project data to remove non-serializable objects
    const sanitizedData = sanitizeProjectData(projectData);

    const fullProjectData = {
      id: projectId,
      userId,
      ...sanitizedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(projectRef, fullProjectData);

    // Automatically add the creator as the project owner
    await addProjectMember(projectId, userId, 'owner', userId);

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

    // Sanitize updates to remove non-serializable objects
    const sanitizedUpdates = sanitizeProjectData(updates);

    // Add updatedAt timestamp to all updates
    const updatesWithTimestamp = {
      ...sanitizedUpdates,
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

/**
 * Add a member to a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to add as member
 * @param {string} role - Role to assign ('owner' | 'admin' | 'editor' | 'viewer')
 * @param {string} invitedBy - User ID of the person who invited this member
 * @param {string} group - Group to assign ('consulting' | 'client'), defaults to 'consulting'
 * @returns {Promise<Object>} The created project member document
 */
export async function addProjectMember(projectId, userId, role, invitedBy, group = 'consulting') {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);

    const memberData = {
      id: memberId,
      projectId,
      userId,
      role,
      group,
      invitedBy,
      joinedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    };

    await setDoc(memberRef, memberData);

    return memberData;
  } catch (error) {
    console.error('Error adding project member:', error);
    throw new Error(`Failed to add project member: ${error.message}`);
  }
}

/**
 * Get all members of a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of project member documents
 */
export async function getProjectMembers(projectId) {
  try {
    const membersRef = collection(db, 'projectMembers');
    const q = query(membersRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    const members = [];
    querySnapshot.forEach((doc) => {
      members.push(doc.data());
    });

    return members;
  } catch (error) {
    console.error('Error getting project members:', error);
    throw new Error(`Failed to get project members: ${error.message}`);
  }
}

/**
 * Update a member's role in a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID whose role to update
 * @param {string} newRole - New role to assign ('owner' | 'admin' | 'editor' | 'viewer')
 * @returns {Promise<void>}
 */
export async function updateMemberRole(projectId, userId, newRole) {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);

    await updateDoc(memberRef, {
      role: newRole,
      lastActiveAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    throw new Error(`Failed to update member role: ${error.message}`);
  }
}

/**
 * Remove a member from a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to remove from project
 * @returns {Promise<void>}
 */
export async function removeMember(projectId, userId) {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);
    await deleteDoc(memberRef);
  } catch (error) {
    console.error('Error removing member:', error);
    throw new Error(`Failed to remove member: ${error.message}`);
  }
}

/**
 * Get all projects where user is a member (not necessarily owner)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of project documents where user is a member
 */
export async function getUserProjectsAsMember(userId) {
  try {
    // First, get all projectMember records for this user
    const membersRef = collection(db, 'projectMembers');
    const q = query(membersRef, where('userId', '==', userId));
    const memberSnapshot = await getDocs(q);

    if (memberSnapshot.empty) {
      return [];
    }

    // Extract project IDs
    const projectIds = [];
    memberSnapshot.forEach((doc) => {
      projectIds.push(doc.data().projectId);
    });

    // Fetch all projects by their IDs
    const projects = [];
    for (const projectId of projectIds) {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        projects.push(projectDoc.data());
      }
    }

    return projects;
  } catch (error) {
    console.error('Error getting user projects as member:', error);
    throw new Error(`Failed to get user projects as member: ${error.message}`);
  }
}

/**
 * Get user's role in a project
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<string|null>} User's role or null if not a member
 */
export async function getUserRoleInProject(userId, projectId) {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      return null;
    }

    return memberDoc.data().role;
  } catch (error) {
    console.error('Error getting user role in project:', error);
    throw new Error(`Failed to get user role in project: ${error.message}`);
  }
}

/**
 * Get user's group in a project
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<string|null>} User's group ('consulting' | 'client') or null if not a member
 */
export async function getUserGroupInProject(userId, projectId) {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      return null;
    }

    return memberDoc.data().group || 'consulting'; // Default to 'consulting' for backwards compatibility
  } catch (error) {
    console.error('Error getting user group in project:', error);
    throw new Error(`Failed to get user group in project: ${error.message}`);
  }
}

/**
 * Update a member's group in a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID whose group to update
 * @param {string} newGroup - New group to assign ('consulting' | 'client')
 * @returns {Promise<void>}
 */
export async function updateMemberGroup(projectId, userId, newGroup) {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);

    await updateDoc(memberRef, {
      group: newGroup,
      lastActiveAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating member group:', error);
    throw new Error(`Failed to update member group: ${error.message}`);
  }
}
