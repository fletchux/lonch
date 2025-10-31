/**
 * Firebase Type Definitions
 *
 * Extend Firebase types for better type safety throughout the app
 */

import { Timestamp } from 'firebase/firestore';

declare global {
  /**
   * Custom Firebase document types
   */
  interface FirestoreDocument {
    id: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  }

  /**
   * Firebase Auth User extended type
   */
  interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }
}

export {};
