import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  updateDoc,
  setDoc,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';

/**
 * Notification Service
 *
 * Manages in-app notifications and user notification preferences in Firestore.
 * Collection structure:
 *   - notifications/{notificationId}
 *   - notificationPreferences/{userId}
 *
 * Notification document schema:
 * {
 *   id: string (auto-generated),
 *   userId: string (recipient user ID),
 *   type: string (e.g., 'invitation', 'role_change', 'group_change', 'mention'),
 *   message: string (notification message),
 *   link: string (optional - link to related resource),
 *   projectId: string (optional - related project),
 *   read: boolean (whether notification has been read),
 *   createdAt: Firestore timestamp
 * }
 *
 * NotificationPreferences document schema:
 * {
 *   userId: string,
 *   emailNotifications: boolean (receive email notifications),
 *   inAppNotifications: boolean (receive in-app notifications),
 *   notifyOnInvitation: boolean,
 *   notifyOnRoleChange: boolean,
 *   notifyOnGroupChange: boolean,
 *   notifyOnMention: boolean,
 *   updatedAt: Firestore timestamp
 * }
 */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  link: string | null;
  projectId: string | null;
  read: boolean;
  createdAt: FieldValue | any;
}

export type NotificationType = 'invitation' | 'role_change' | 'group_change' | 'mention';

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  notifyOnInvitation: boolean;
  notifyOnRoleChange: boolean;
  notifyOnGroupChange: boolean;
  notifyOnMention: boolean;
  updatedAt?: FieldValue | any;
}

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  link: string | null = null,
  projectId: string | null = null
): Promise<Notification> {
  try {
    const notificationsRef = collection(db, 'notifications');

    const notificationData = {
      userId,
      type,
      message,
      link,
      projectId,
      read: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(notificationsRef, notificationData);

    return {
      id: docRef.id,
      ...notificationData
    } as Notification;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating notification:', error);
    throw new Error(`Failed to create notification: ${message}`);
  }
}

/**
 * Get notifications for a user with pagination
 */
export async function getUserNotifications(
  userId: string,
  unreadOnly: boolean = false,
  limit: number = 20
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');

    let q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    // Add filter for unread notifications if requested
    if (unreadOnly) {
      q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );
    }

    const querySnapshot = await getDocs(q);

    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });

    return notifications;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting user notifications:', error);
    throw new Error(`Failed to get user notifications: ${message}`);
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error marking notification as read:', error);
    throw new Error(`Failed to mark notification as read: ${message}`);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const unreadNotifications = await getUserNotifications(userId, true);

    const updatePromises = unreadNotifications.map(notification =>
      markNotificationAsRead(notification.id)
    );

    await Promise.all(updatePromises);

    return unreadNotifications.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error marking all notifications as read:', error);
    throw new Error(`Failed to mark all notifications as read: ${message}`);
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const unreadNotifications = await getUserNotifications(userId, true, 100);
    return unreadNotifications.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting unread notification count:', error);
    throw new Error(`Failed to get unread notification count: ${message}`);
  }
}

/**
 * Get notification preferences for a user
 */
export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    const preferencesRef = doc(db, 'notificationPreferences', userId);
    const preferencesDoc = await getDoc(preferencesRef);

    if (preferencesDoc.exists()) {
      return {
        userId,
        ...preferencesDoc.data()
      } as NotificationPreferences;
    } else {
      // Return default preferences if none exist
      return {
        userId,
        emailNotifications: true,
        inAppNotifications: true,
        notifyOnInvitation: true,
        notifyOnRoleChange: true,
        notifyOnGroupChange: true,
        notifyOnMention: true
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting notification preferences:', error);
    throw new Error(`Failed to get notification preferences: ${message}`);
  }
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const preferencesRef = doc(db, 'notificationPreferences', userId);

    const updatedPreferences = {
      ...preferences,
      userId,
      updatedAt: serverTimestamp()
    };

    await setDoc(preferencesRef, updatedPreferences, { merge: true });

    return {
      userId,
      ...updatedPreferences
    } as NotificationPreferences;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating notification preferences:', error);
    throw new Error(`Failed to update notification preferences: ${message}`);
  }
}

/**
 * Check if user should receive a notification based on their preferences
 */
export async function shouldNotifyUser(userId: string, notificationType: NotificationType): Promise<boolean> {
  try {
    const preferences = await getUserNotificationPreferences(userId);

    // Check if in-app notifications are enabled
    if (!preferences.inAppNotifications) {
      return false;
    }

    // Check specific notification type preferences
    switch (notificationType) {
      case 'invitation':
        return preferences.notifyOnInvitation;
      case 'role_change':
        return preferences.notifyOnRoleChange;
      case 'group_change':
        return preferences.notifyOnGroupChange;
      case 'mention':
        return preferences.notifyOnMention;
      default:
        return true; // Default to sending notification for unknown types
    }
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    // Default to sending notification if we can't check preferences
    return true;
  }
}

/**
 * Delete old read notifications for a user (cleanup utility)
 */
export async function deleteOldNotifications(userId: string, daysOld: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', true),
      where('createdAt', '<=', cutoffDate)
    );

    const querySnapshot = await getDocs(q);

    // Note: Firestore doesn't support batch deletes in the web SDK
    // In production, this should be done via Cloud Functions
    console.log(`Found ${querySnapshot.size} old notifications to delete`);

    return querySnapshot.size;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting old notifications:', error);
    throw new Error(`Failed to delete old notifications: ${message}`);
  }
}
