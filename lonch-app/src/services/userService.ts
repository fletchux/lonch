import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';

/**
 * User Service
 *
 * Manages user data in Firestore.
 * Collection structure: users/{userId}
 */

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  authProvider: 'email' | 'google';
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface UserUpdate {
  displayName?: string;
  photoURL?: string | null;
  [key: string]: any;
}

/**
 * Create a new user document in Firestore
 */
export async function createUser(
  uid: string,
  email: string,
  displayName: string,
  authProvider: 'email' | 'google',
  photoURL: string | null = null
): Promise<UserData> {
  try {
    const userRef = doc(db, 'users', uid);

    const userData: UserData = {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${message}`);
  }
}

/**
 * Get a user document from Firestore
 */
export async function getUser(uid: string): Promise<any | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }

    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting user:', error);
    throw new Error(`Failed to get user: ${message}`);
  }
}

/**
 * Update a user document in Firestore
 */
export async function updateUser(uid: string, updates: UserUpdate): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);

    // Add updatedAt timestamp to all updates
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(userRef, updatesWithTimestamp);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${message}`);
  }
}
