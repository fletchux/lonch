import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Notification Service
 *
 * Manages user notifications in Firestore.
 * Collection structure:
 *   - userNotifications/{notificationId}
 *   - users/{userId}/notificationPreferences (subcollection)
 *
 * Notification document schema:
 * {
 *   id: string (auto-generated),
 *   userId: string (recipient user ID),
 *   type: string (e.g., 'invitation', 'role_changed', 'group_changed', 'mention'),
 *   message: string (notification message text),
 *   link: string (optional URL to navigate to),
 *   read: boolean (whether notification has been read),
 *   createdAt: Firestore timestamp
 * }
 *
 * NotificationPreferences document schema:
 * {
 *   userId: string,
 *   emailNotifications: boolean (default: true),
 *   inAppNotifications: boolean (default: true),
 *   notificationTypes: {
 *     invitations: boolean,
 *     roleChanges: boolean,
 *     groupChanges: boolean,
 *     mentions: boolean
 *   }
 * }
 */

/**
 * Create a new notification for a user
 * @param {string} userId - User ID to receive the notification
 * @param {string} type - Notification type (e.g., 'invitation', 'role_changed')
 * @param {string} message - Notification message text
 * @param {string} link - Optional URL to navigate to when notification is clicked
 * @returns {Promise<Object>} The created notification document
 */
export async function createNotification(userId, type, message, link = null) {
  try {
    const notificationsRef = collection(db, 'userNotifications');

    const notificationData = {
      userId,
      type,
      message,
      link,
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
 * Get notifications for a user with optional filtering
 * @param {string} userId - User ID
 * @param {boolean} unreadOnly - If true, only return unread notifications
 * @param {number} limit - Maximum number of notifications to return (default: 50)
 * @returns {Promise<Array>} Array of notification documents
 */
export async function getUserNotifications(userId, unreadOnly = false, limit = 50) {
  try {
    const notificationsRef = collection(db, 'userNotifications');

    let q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

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
    const notificationRef = doc(db, 'userNotifications', notificationId);

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
export async function markAllAsRead(userId) {
  try {
    const unreadNotifications = await getUserNotifications(userId, true);

    let count = 0;
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
      count++;
    }

    return count;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
}

/**
 * Get notification preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's notification preferences
 */
export async function getUserNotificationPreferences(userId) {
  try {
    const preferencesRef = doc(db, 'users', userId, 'notificationPreferences', 'settings');
    const preferencesDoc = await getDoc(preferencesRef);

    if (!preferencesDoc.exists()) {
      // Return default preferences if none exist
      return {
        userId,
        emailNotifications: true,
        inAppNotifications: true,
        notificationTypes: {
          invitations: true,
          roleChanges: true,
          groupChanges: true,
          mentions: true
        }
      };
    }

    return {
      id: preferencesDoc.id,
      ...preferencesDoc.data()
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw new Error(`Failed to get notification preferences: ${error.message}`);
  }
}

/**
 * Update notification preferences for a user
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences object to update
 * @returns {Promise<Object>} Updated preferences
 */
export async function updateNotificationPreferences(userId, preferences) {
  try {
    const preferencesRef = doc(db, 'users', userId, 'notificationPreferences', 'settings');

    const preferencesData = {
      userId,
      ...preferences,
      updatedAt: serverTimestamp()
    };

    // Use setDoc with merge to create or update
    await updateDoc(preferencesRef, preferencesData);

    return preferencesData;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw new Error(`Failed to update notification preferences: ${error.message}`);
  }
}

/**
 * Check if user should receive a notification based on their preferences
 * @param {string} userId - User ID
 * @param {string} notificationType - Type of notification to check
 * @param {string} channel - Channel to check ('email' or 'inApp')
 * @returns {Promise<boolean>} True if notification should be sent
 */
export async function shouldNotify(userId, notificationType, channel = 'inApp') {
  try {
    const preferences = await getUserNotificationPreferences(userId);

    // Check if channel is enabled
    if (channel === 'email' && !preferences.emailNotifications) {
      return false;
    }
    if (channel === 'inApp' && !preferences.inAppNotifications) {
      return false;
    }

    // Check if notification type is enabled
    if (preferences.notificationTypes && preferences.notificationTypes[notificationType] === false) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    // Default to sending notification if we can't check preferences
    return true;
  }
}
