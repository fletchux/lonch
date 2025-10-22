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
  serverTimestamp
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

/**
 * Create a new notification
 * @param {string} userId - User ID to send notification to
 * @param {string} type - Notification type (invitation, role_change, group_change, mention)
 * @param {string} message - Notification message
 * @param {string} link - Optional link to related resource
 * @param {string} projectId - Optional project ID
 * @returns {Promise<Object>} The created notification document
 */
export async function createNotification(userId, type, message, link = null, projectId = null) {
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
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

/**
 * Get notifications for a user with pagination
 * @param {string} userId - User ID
 * @param {boolean} unreadOnly - If true, only return unread notifications
 * @param {number} limit - Maximum number of notifications to return (default: 20)
 * @returns {Promise<Array>} Array of notification documents
 */
export async function getUserNotifications(userId, unreadOnly = false, limit = 20) {
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

    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw new Error(`Failed to get user notifications: ${error.message}`);
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const unreadNotifications = await getUserNotifications(userId, true);

    const updatePromises = unreadNotifications.map(notification =>
      markNotificationAsRead(notification.id)
    );

    await Promise.all(updatePromises);

    return unreadNotifications.length;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
}

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
export async function getUnreadNotificationCount(userId) {
  try {
    const unreadNotifications = await getUserNotifications(userId, true, 100);
    return unreadNotifications.length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw new Error(`Failed to get unread notification count: ${error.message}`);
  }
}

/**
 * Get notification preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's notification preferences
 */
export async function getUserNotificationPreferences(userId) {
  try {
    const preferencesRef = doc(db, 'notificationPreferences', userId);
    const preferencesDoc = await getDoc(preferencesRef);

    if (preferencesDoc.exists()) {
      return {
        userId,
        ...preferencesDoc.data()
      };
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
    console.error('Error getting notification preferences:', error);
    throw new Error(`Failed to get notification preferences: ${error.message}`);
  }
}

/**
 * Update notification preferences for a user
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences object with boolean fields
 * @returns {Promise<Object>} Updated preferences
 */
export async function updateNotificationPreferences(userId, preferences) {
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
    };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw new Error(`Failed to update notification preferences: ${error.message}`);
  }
}

/**
 * Check if user should receive a notification based on their preferences
 * @param {string} userId - User ID
 * @param {string} notificationType - Type of notification (invitation, role_change, group_change, mention)
 * @returns {Promise<boolean>} True if user should receive the notification
 */
export async function shouldNotifyUser(userId, notificationType) {
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
 * @param {string} userId - User ID
 * @param {number} daysOld - Delete notifications older than this many days (default: 30)
 * @returns {Promise<number>} Number of notifications deleted
 */
export async function deleteOldNotifications(userId, daysOld = 30) {
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
    console.error('Error deleting old notifications:', error);
    throw new Error(`Failed to delete old notifications: ${error.message}`);
  }
}
