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
  serverTimestamp,
  DocumentSnapshot,
  FieldValue
} from 'firebase/firestore';

/**
 * Activity Log Service
 *
 * Manages activity logging for projects in Firestore.
 * Collection structure: activityLogs/{activityId}
 */

export interface ActivityMetadata {
  [key: string]: any;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  groupContext: 'consulting' | 'client' | null;
  metadata: ActivityMetadata;
  timestamp: FieldValue | any;
}

export interface ActivityLogResponse {
  activities: ActivityLog[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Log an activity/action in a project
 */
export async function logActivity(
  projectId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: ActivityMetadata = {},
  groupContext: 'consulting' | 'client' | null = null
): Promise<ActivityLog> {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error logging activity:', error);
    throw new Error(`Failed to log activity: ${message}`);
  }
}

/**
 * Get activity log for a project with pagination
 */
export async function getProjectActivityLog(
  projectId: string,
  limit: number = 50,
  lastDoc: DocumentSnapshot | null = null
): Promise<ActivityLogResponse> {
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

    const activities: ActivityLog[] = [];
    let lastDocument: DocumentSnapshot | null = null;

    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
      lastDocument = doc;
    });

    return {
      activities,
      lastDoc: lastDocument,
      hasMore: querySnapshot.size === limit
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting project activity log:', error);
    throw new Error(`Failed to get project activity log: ${message}`);
  }
}

/**
 * Filter activity log by user
 */
export async function filterByUser(
  projectId: string,
  userId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
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

    const activities: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
    });

    return activities;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error filtering activity log by user:', error);
    throw new Error(`Failed to filter activity log by user: ${message}`);
  }
}

/**
 * Filter activity log by action type
 */
export async function filterByAction(
  projectId: string,
  actionType: string,
  limit: number = 50
): Promise<ActivityLog[]> {
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

    const activities: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
    });

    return activities;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error filtering activity log by action:', error);
    throw new Error(`Failed to filter activity log by action: ${message}`);
  }
}

/**
 * Filter activity log by date range
 */
export async function filterByDateRange(
  projectId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 50
): Promise<ActivityLog[]> {
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

    const activities: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
    });

    return activities;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error filtering activity log by date range:', error);
    throw new Error(`Failed to filter activity log by date range: ${message}`);
  }
}
