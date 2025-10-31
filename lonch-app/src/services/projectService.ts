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
  serverTimestamp,
  FieldValue
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
 *   documents: array of {
 *     id: string,
 *     name: string,
 *     category: string,
 *     size: number,
 *     type: string,
 *     visibility: 'consulting_only' | 'client_only' | 'both' (defaults to 'both'),
 *     uploadedAt: timestamp,
 *     uploadedBy: string (userId),
 *     ...other metadata
 *   },
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

export interface ProjectDocument {
  id: string;
  name: string;
  category: string;
  size: number;
  type: string;
  visibility?: string;
  uploadedAt: any;
  uploadedBy: string;
  [key: string]: any;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  clientType?: string;
  intakeTemplate?: any;
  checklistTemplate?: any;
  stakeholderTemplate?: any;
  teamTemplate?: any;
  documents?: ProjectDocument[];
  extractedData?: any;
  extractionConflicts?: any;
  manuallyEditedFields?: string[];
  members?: string[];
  status?: string;
  createdAt: FieldValue | any;
  updatedAt: FieldValue | any;
  [key: string]: any;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  group: string;
  invitedBy: string;
  joinedAt: FieldValue | any;
  lastActiveAt: FieldValue | any;
}

export interface MigrationResult {
  total: number;
  updated: number;
  alreadyHasGroup: number;
  errors: number;
  success: boolean;
}

/**
 * Sanitize project data to remove non-serializable objects like File objects
 */
function sanitizeProjectData(projectData: any): any {
  const sanitized = { ...projectData };

  // Convert documents array to serializable format
  if (sanitized.documents && Array.isArray(sanitized.documents)) {
    sanitized.documents = sanitized.documents.map((doc: any) => {
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
 */
export async function createProject(userId: string, projectData: Partial<Project>): Promise<Project> {
  try {
    // Generate a unique project ID
    const projectId = `${userId}_${Date.now()}`;
    const projectRef = doc(db, 'projects', projectId);

    // Sanitize project data to remove non-serializable objects
    const sanitizedData = sanitizeProjectData(projectData);

    const fullProjectData: Project = {
      id: projectId,
      userId,
      name: '',
      ...sanitizedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(projectRef, fullProjectData);

    // Automatically add the creator as the project owner
    await addProjectMember(projectId, userId, 'owner', userId);

    return fullProjectData;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${message}`);
  }
}

/**
 * Get all projects for a specific user
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data() as Project);
    });

    return projects;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting user projects:', error);
    throw new Error(`Failed to get user projects: ${message}`);
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return null;
    }

    return projectDoc.data() as Project;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting project:', error);
    throw new Error(`Failed to get project: ${message}`);
  }
}

/**
 * Update a project in Firestore
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating project:', error);
    throw new Error(`Failed to update project: ${message}`);
  }
}

/**
 * Delete a project from Firestore
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting project:', error);
    throw new Error(`Failed to delete project: ${message}`);
  }
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  role: string,
  invitedBy: string,
  group: string = 'consulting'
): Promise<ProjectMember> {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);

    const memberData: ProjectMember = {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding project member:', error);
    throw new Error(`Failed to add project member: ${message}`);
  }
}

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  try {
    const membersRef = collection(db, 'projectMembers');
    const q = query(membersRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    const members: ProjectMember[] = [];
    querySnapshot.forEach((doc) => {
      members.push(doc.data() as ProjectMember);
    });

    return members;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting project members:', error);
    throw new Error(`Failed to get project members: ${message}`);
  }
}

/**
 * Update a member's role in a project
 */
export async function updateMemberRole(projectId: string, userId: string, newRole: string): Promise<void> {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);

    await updateDoc(memberRef, {
      role: newRole,
      lastActiveAt: serverTimestamp()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating member role:', error);
    throw new Error(`Failed to update member role: ${message}`);
  }
}

/**
 * Remove a member from a project
 */
export async function removeMember(projectId: string, userId: string): Promise<void> {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);
    await deleteDoc(memberRef);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error removing member:', error);
    throw new Error(`Failed to remove member: ${message}`);
  }
}

/**
 * Get all projects where user is a member (not necessarily owner)
 */
export async function getUserProjectsAsMember(userId: string): Promise<Project[]> {
  try {
    // First, get all projectMember records for this user
    const membersRef = collection(db, 'projectMembers');
    const q = query(membersRef, where('userId', '==', userId));
    const memberSnapshot = await getDocs(q);

    if (memberSnapshot.empty) {
      return [];
    }

    // Extract project IDs
    const projectIds: string[] = [];
    memberSnapshot.forEach((doc) => {
      projectIds.push(doc.data().projectId);
    });

    // Fetch all projects by their IDs
    const projects: Project[] = [];
    for (const projectId of projectIds) {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        projects.push(projectDoc.data() as Project);
      }
    }

    return projects;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting user projects as member:', error);
    throw new Error(`Failed to get user projects as member: ${message}`);
  }
}

/**
 * Get user's role in a project
 */
export async function getUserRoleInProject(userId: string, projectId: string): Promise<string | null> {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      return null;
    }

    return memberDoc.data().role;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting user role in project:', error);
    throw new Error(`Failed to get user role in project: ${message}`);
  }
}

/**
 * Get user's group in a project
 */
export async function getUserGroupInProject(userId: string, projectId: string): Promise<string | null> {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      return null;
    }

    return memberDoc.data().group || 'consulting'; // Default to 'consulting' for backwards compatibility
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting user group in project:', error);
    throw new Error(`Failed to get user group in project: ${message}`);
  }
}

/**
 * Update a member's group in a project
 */
export async function updateMemberGroup(projectId: string, userId: string, newGroup: string): Promise<void> {
  try {
    const memberId = `${projectId}_${userId}`;
    const memberRef = doc(db, 'projectMembers', memberId);

    await updateDoc(memberRef, {
      group: newGroup,
      lastActiveAt: serverTimestamp()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating member group:', error);
    throw new Error(`Failed to update member group: ${message}`);
  }
}

/**
 * Migration helper: Add default group='consulting' to all existing project members
 * This function should be run once to migrate existing data when upgrading to Phase 1B
 */
export async function migrateExistingMembersToGroups(): Promise<MigrationResult> {
  try {
    const membersRef = collection(db, 'projectMembers');
    const querySnapshot = await getDocs(membersRef);

    let updated = 0;
    let alreadyHasGroup = 0;
    let errors = 0;

    for (const memberDoc of querySnapshot.docs) {
      try {
        const memberData = memberDoc.data();

        // Skip if member already has a group field
        if (memberData.group) {
          alreadyHasGroup++;
          continue;
        }

        // Add group='consulting' as default for existing members
        await updateDoc(memberDoc.ref, {
          group: 'consulting'
        });

        updated++;
      } catch (error) {
        console.error(`Error migrating member ${memberDoc.id}:`, error);
        errors++;
      }
    }

    const results: MigrationResult = {
      total: querySnapshot.size,
      updated,
      alreadyHasGroup,
      errors,
      success: errors === 0
    };

    console.log('Migration results:', results);
    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error running migration:', error);
    throw new Error(`Failed to migrate existing members: ${message}`);
  }
}
