import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, useRequireAuth } from './AuthContext';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase Auth module
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({
    setCustomParameters: vi.fn()
  })),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn()
}));

vi.mock('../config/firebase', () => ({
  auth: { currentUser: null }
}));

describe('AuthContext', () => {
  let unsubscribeMock;

  beforeEach(() => {
    unsubscribeMock = vi.fn();
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
      // Simulate no user initially
      callback(null);
      return unsubscribeMock;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should render children when not loading', async () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument();
      });
    });

    it('should not render children while loading', () => {
      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(() => {
        // Don't call callback to simulate loading state
        return unsubscribeMock;
      });

      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      expect(screen.queryByText('Test Child')).not.toBeInTheDocument();
    });

    it('should set currentUser when Firebase auth state changes', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return unsubscribeMock;
      });

      function TestComponent() {
        const { currentUser } = useAuth();
        return <div>{currentUser ? currentUser.email : 'No user'}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('should cleanup onAuthStateChanged subscription on unmount', () => {
      const { unmount } = render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      function TestComponent() {
        useAuth();
        return <div>Test</div>;
      }

      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      );

      consoleError.mockRestore();
    });

    it('should return auth context when used within AuthProvider', async () => {
      function TestComponent() {
        const auth = useAuth();
        return (
          <div>
            <div>{auth.currentUser ? 'Logged in' : 'Not logged in'}</div>
            <div>{auth.loading ? 'Loading' : 'Ready'}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
        expect(screen.getByText('Ready')).toBeInTheDocument();
      });
    });
  });

  describe('signup function', () => {
    it('should call createUserWithEmailAndPassword and return user', async () => {
      const mockUser = { uid: '123', email: 'newuser@example.com' };
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser
      });

      function TestComponent() {
        const { signup } = useAuth();
        const handleSignup = async () => {
          const user = await signup('newuser@example.com', 'password123');
          return user;
        };
        return <button onClick={handleSignup}>Sign Up</button>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
      });

      const button = screen.getByText('Sign Up');
      button.click();

      await waitFor(() => {
        expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'newuser@example.com',
          'password123'
        );
      });
    });

    it('should handle signup errors', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValue(
        new Error('Email already in use')
      );

      function TestComponent() {
        const { signup, error } = useAuth();
        const handleSignup = async () => {
          try {
            await signup('existing@example.com', 'password123');
          } catch {
            // Error is caught and set in context
          }
        };
        return (
          <div>
            <button onClick={handleSignup}>Sign Up</button>
            {error && <div>Error: {error}</div>}
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
      });

      const button = screen.getByText('Sign Up');
      button.click();

      await waitFor(() => {
        expect(screen.getByText('Error: Email already in use')).toBeInTheDocument();
      });
    });
  });

  describe('login function', () => {
    it('should call signInWithEmailAndPassword and return user', async () => {
      const mockUser = { uid: '123', email: 'user@example.com' };
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser
      });

      function TestComponent() {
        const { login } = useAuth();
        const handleLogin = async () => {
          await login('user@example.com', 'password123');
        };
        return <button onClick={handleLogin}>Log In</button>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Log In')).toBeInTheDocument();
      });

      const button = screen.getByText('Log In');
      button.click();

      await waitFor(() => {
        expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'user@example.com',
          'password123'
        );
      });
    });

    it('should handle login errors', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue(
        new Error('Invalid credentials')
      );

      function TestComponent() {
        const { login, error } = useAuth();
        const handleLogin = async () => {
          try {
            await login('user@example.com', 'wrongpassword');
          } catch {
            // Error is caught and set in context
          }
        };
        return (
          <div>
            <button onClick={handleLogin}>Log In</button>
            {error && <div>Error: {error}</div>}
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Log In')).toBeInTheDocument();
      });

      const button = screen.getByText('Log In');
      button.click();

      await waitFor(() => {
        expect(screen.getByText('Error: Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('loginWithGoogle function', () => {
    it('should call signInWithPopup with GoogleAuthProvider', async () => {
      const mockUser = { uid: '123', email: 'google@example.com' };
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValue({
        user: mockUser
      });

      function TestComponent() {
        const { loginWithGoogle } = useAuth();
        const handleGoogleLogin = async () => {
          await loginWithGoogle();
        };
        return <button onClick={handleGoogleLogin}>Sign in with Google</button>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
      });

      const button = screen.getByText('Sign in with Google');
      button.click();

      await waitFor(() => {
        expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      });
    });

    it('should handle Google login errors', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue(
        new Error('Popup closed')
      );

      function TestComponent() {
        const { loginWithGoogle, error } = useAuth();
        const handleGoogleLogin = async () => {
          try {
            await loginWithGoogle();
          } catch {
            // Error is caught and set in context
          }
        };
        return (
          <div>
            <button onClick={handleGoogleLogin}>Sign in with Google</button>
            {error && <div>Error: {error}</div>}
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
      });

      const button = screen.getByText('Sign in with Google');
      button.click();

      await waitFor(() => {
        expect(screen.getByText('Error: Popup closed')).toBeInTheDocument();
      });
    });
  });

  describe('logout function', () => {
    it('should call signOut', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      function TestComponent() {
        const { logout } = useAuth();
        const handleLogout = async () => {
          await logout();
        };
        return <button onClick={handleLogout}>Log Out</button>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Log Out')).toBeInTheDocument();
      });

      const button = screen.getByText('Log Out');
      button.click();

      await waitFor(() => {
        expect(firebaseAuth.signOut).toHaveBeenCalled();
      });
    });

    it('should handle logout errors', async () => {
      vi.mocked(firebaseAuth.signOut).mockRejectedValue(
        new Error('Logout failed')
      );

      function TestComponent() {
        const { logout, error } = useAuth();
        const handleLogout = async () => {
          try {
            await logout();
          } catch {
            // Error is caught and set in context
          }
        };
        return (
          <div>
            <button onClick={handleLogout}>Log Out</button>
            {error && <div>Error: {error}</div>}
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Log Out')).toBeInTheDocument();
      });

      const button = screen.getByText('Log Out');
      button.click();

      await waitFor(() => {
        expect(screen.getByText('Error: Logout failed')).toBeInTheDocument();
      });
    });
  });

  describe('updateProfile function', () => {
    it('should call updateProfile with displayName and photoURL', async () => {
      const mockUser = {
        uid: '123',
        email: 'user@example.com',
        displayName: 'Old Name',
        photoURL: null
      };

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return unsubscribeMock;
      });

      vi.mocked(firebaseAuth.updateProfile).mockResolvedValue();

      function TestComponent() {
        const { updateProfile, currentUser } = useAuth();
        const handleUpdate = async () => {
          await updateProfile('New Name', 'https://example.com/avatar.jpg');
        };
        return (
          <div>
            <button onClick={handleUpdate}>Update Profile</button>
            <div>{currentUser?.displayName || 'No name'}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Update Profile')).toBeInTheDocument();
      });

      const button = screen.getByText('Update Profile');
      button.click();

      await waitFor(() => {
        expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(
          mockUser,
          { displayName: 'New Name', photoURL: 'https://example.com/avatar.jpg' }
        );
      });
    });

    it('should throw error when no user is logged in', async () => {
      function TestComponent() {
        const { updateProfile, error } = useAuth();
        const handleUpdate = async () => {
          try {
            await updateProfile('New Name', null);
          } catch {
            // Error is caught
          }
        };
        return (
          <div>
            <button onClick={handleUpdate}>Update Profile</button>
            {error && <div>Error: {error}</div>}
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Update Profile')).toBeInTheDocument();
      });

      const button = screen.getByText('Update Profile');
      button.click();

      await waitFor(() => {
        expect(screen.getByText('Error: No user is currently logged in')).toBeInTheDocument();
      });
    });
  });

  describe('useRequireAuth hook', () => {
    it('should return isAuthenticated as false when no user', async () => {
      function TestComponent() {
        const { isAuthenticated } = useRequireAuth();
        return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });
    });

    it('should return isAuthenticated as true when user exists', async () => {
      const mockUser = { uid: '123', email: 'user@example.com' };

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return unsubscribeMock;
      });

      function TestComponent() {
        const { isAuthenticated } = useRequireAuth();
        return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Authenticated')).toBeInTheDocument();
      });
    });

    it('should log warning when user is not authenticated', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      function TestComponent() {
        useRequireAuth('login');
        return <div>Test</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith(
          'User not authenticated. Should redirect to: login'
        );
      });

      consoleWarn.mockRestore();
    });
  });
});
