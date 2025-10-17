import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task 2.4: Firebase onAuthStateChanged observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Task 2.5: Signup with email and password
  async function signup(email, password) {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Task 2.6: Login with email and password
  async function login(email, password) {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Task 2.7: Login with Google OAuth
  async function loginWithGoogle() {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Task 2.8: Logout
  async function logout() {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Task 2.9: Update user profile (displayName, avatarURL)
  async function updateUserProfile(displayName, avatarURL) {
    try {
      setError(null);
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }

      const updates = {};
      if (displayName !== undefined) updates.displayName = displayName;
      if (avatarURL !== undefined) updates.photoURL = avatarURL;

      await firebaseUpdateProfile(currentUser, updates);

      // Update local state to reflect changes
      setCurrentUser({ ...currentUser, ...updates });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateProfile: updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Task 2.2: useAuth hook to access auth context
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Task 2.3: useRequireAuth hook that redirects to login if not authenticated
// eslint-disable-next-line react-refresh/only-export-components
export function useRequireAuth(redirectTo = 'login') {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && !currentUser) {
      // In a real app with routing, this would redirect
      // For now, we'll expose the redirect state
      console.warn(`User not authenticated. Should redirect to: ${redirectTo}`);
    }
  }, [currentUser, loading, redirectTo]);

  return { currentUser, loading, isAuthenticated: !!currentUser };
}
