import { initializeApp, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
// SETUP REQUIRED:
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Enable Authentication > Sign-in method > Email/Password
// 3. Enable Authentication > Sign-in method > Google (OAuth)
// 4. Add your environment variables to .env file (see .env.example)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id'
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage: FirebaseStorage = getStorage(app);

// Initialize Firebase Authentication
const auth: Auth = getAuth(app);

// Initialize Firebase Firestore
const db: Firestore = getFirestore(app);

export { storage, auth, db };
