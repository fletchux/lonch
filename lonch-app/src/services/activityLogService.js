import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Activity Log Service
 *
 * Manages activity logging for projects in Firestore.
 * Collection structure:
 *   - activityLogs/{activityId}
 *
 * Activity log document schema:
 * {
 *   id: string (auto-generated),
 *   projectId: string,
 *   userId: string (user who performed the action),
 *   action: string (e.g., 'document_uploaded', 'member_invited', 'role_changed'),
 *   resourceType: string (e.g., 'document', 'member', 'project'),
 *   resourceId: string (ID of the resource affected),
 *   groupContext: 'consulting' | 'client' | null (group context for the action),
 *   metadata: object (additional context-specific data),
 *   timestamp: Firestore timestamp
 * }
 *
 * Supported actions:
 * - document_uploaded
 * - document_deleted
 * - member_invited
 * - member_removed
 * - role_changed
 * - project_created
 * - project_updated
 * - project_deleted
 */

/**
 * Log an activity/action in a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID who performed the action
 * @param {string} action - Action type (e.g., 'document_uploaded')
 * @param {string} resourceType - Type of resource affected (e.g., 'document', 'member')
 * @param {string} resourceId - ID of the affected resource
 * @param {Object} metadata - Additional context data (optional)
 * @param {string|null} groupContext - Group context for the action ('consulting' | 'client' | null)
 * @returns {Promise<Object>} The created activity log document
 */
export async function logActivity(projectId, userId, action, resourceType, resourceId, metadata = {}, groupContext = null) {
  try {
    const activityLogsRef = collection(db, 'activityLogs');

    const activityData = {
      projectId,
      userId,
      action,
      resourceType,
      resourceId,
      groupContext,
      metadata,
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(activityLogsRef, activityData);

    return {
      id: docRef.id,
      ...activityData
    };
  } catch (error) {
    console.error('Error logging activity:', error);
    throw new Error(`Failed to log activity: ${error.message}`);
  }
}

/**
 * Get activity log for a project with pagination
 * @param {string} projectId - Project ID
 * @param {number} limit - Maximum number of entries to return (default: 50)
 * @param {Object} lastDoc - Last document from previous page (for pagination)
 * @returns {Promise<Object>} Object containing activities array and lastDoc for next page
 */
export async function getProjectActivityLog(projectId, limit = 50, lastDoc = null) {
  try {
    const activityLogsRef = collection(db, 'activityLogs');

    let q = query(
      activityLogsRef,
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );

    // Add pagination if lastDoc is provided
    if (lastDoc) {
      q = query(
        activityLogsRef,
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        firestoreLimit(limit)
      );
    }

    const querySnapshot = await getDocs(q);

    const activities = [];
    let lastDocument = null;

    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
      lastDocument = doc;
    });

    return {
      activities,
      lastDoc: lastDocument,
      hasMore: querySnapshot.size === limit
    };
  } catch (error) {
    console.error('Error getting project activity log:', error);
    throw new Error(`Failed to get project activity log: ${error.message}`);
  }
}

/**
 * Filter activity log by user
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to filter by
 * @param {number} limit - Maximum number of entries to return (default: 50)
 * @returns {Promise<Array>} Array of activity log documents
 */
export async function filterByUser(projectId, userId, limit = 50) {
  try {
    const activityLogsRef = collection(db, 'activityLogs');

    const q = query(
      activityLogsRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);

    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return activities;
  } catch (error) {
    console.error('Error filtering activity log by user:', error);
    throw new Error(`Failed to filter activity log by user: ${error.message}`);
  }
}

/**
 * Filter activity log by action type
 * @param {string} projectId - Project ID
 * @param {string} actionType - Action type to filter by (e.g., 'document_uploaded')
 * @param {number} limit - Maximum number of entries to return (default: 50)
 * @returns {Promise<Array>} Array of activity log documents
 */
export async function filterByAction(projectId, actionType, limit = 50) {
  try {
    const activityLogsRef = collection(db, 'activityLogs');

    const q = query(
      activityLogsRef,
      where('projectId', '==', projectId),
      where('action', '==', actionType),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);

    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return activities;
  } catch (error) {
    console.error('Error filtering activity log by action:', error);
    throw new Error(`Failed to filter activity log by action: ${error.message}`);
  }
}

/**
 * Filter activity log by date range
 * @param {string} projectId - Project ID
 * @param {Date} startDate - Start date for the range
 * @param {Date} endDate - End date for the range
 * @param {number} limit - Maximum number of entries to return (default: 50)
 * @returns {Promise<Array>} Array of activity log documents
 */
export async function filterByDateRange(projectId, startDate, endDate, limit = 50) {
  try {
    const activityLogsRef = collection(db, 'activityLogs');

    const q = query(
      activityLogsRef,
      where('projectId', '==', projectId),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);

    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return activities;
  } catch (error) {
    console.error('Error filtering activity log by date range:', error);
    throw new Error(`Failed to filter activity log by date range: ${error.message}`);
  }
}

/**
 * Get activity log filtered by group context
 * @param {string} projectId - Project ID
 * @param {string} group - Group context to filter by ('consulting' or 'client')
 * @param {number} limit - Maximum number of entries to return (default: 50)
 * @returns {Promise<Array>} Array of activity log documents
 */
export async function getActivityLogByGroup(projectId, group, limit = 50) {
  try {
    const activityLogsRef = collection(db, 'activityLogs');

    const q = query(
      activityLogsRef,
      where('projectId', '==', projectId),
      where('groupContext', '==', group),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);

    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return activities;
  } catch (error) {
    console.error('Error getting activity log by group:', error);
    throw new Error(`Failed to get activity log by group: ${error.message}`);
  }
}
