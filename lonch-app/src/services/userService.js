import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * User Service
 *
 * Manages user data in Firestore.
 * Collection structure: users/{userId}
 *
 * User document schema:
 * {
 *   uid: string,
 *   email: string,
 *   displayName: string,
 *   photoURL: string | null,
 *   authProvider: 'email' | 'google',
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

/**
 * Create a new user document in Firestore
 * @param {string} uid - Firebase Auth user ID
 * @param {string} email - User email address
 * @param {string} displayName - User display name
 * @param {string} authProvider - Authentication provider ('email' or 'google')
 * @param {string|null} photoURL - Optional profile photo URL
 * @returns {Promise<Object>} The created user document
 */
export async function createUser(uid, email, displayName, authProvider, photoURL = null) {
  try {
    const userRef = doc(db, 'users', uid);

    const userData = {
      uid,
      email,
      displayName,
      photoURL,
      authProvider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, userData);

    return userData;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Get a user document from Firestore
 * @param {string} uid - Firebase Auth user ID
 * @returns {Promise<Object|null>} The user document or null if not found
 */
export async function getUser(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }

    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

/**
 * Update a user document in Firestore
 * @param {string} uid - Firebase Auth user ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<void>}
 */
export async function updateUser(uid, updates) {
  try {
    const userRef = doc(db, 'users', uid);

    // Add updatedAt timestamp to all updates
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(userRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
}
