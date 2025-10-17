import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from './LoginPage';

// Task 4.1-4.3: Protected route wrapper that redirects to login when not authenticated
export default function ProtectedRoute({ children, redirectPath = 'login' }) {
  const { currentUser, loading } = useAuth();
  const [intendedDestination, setIntendedDestination] = useState(null);

  useEffect(() => {
    // Task 4.3: Preserve intended destination for post-login redirect
    if (!loading && !currentUser && redirectPath) {
      setIntendedDestination(window.location.pathname);
    }
  }, [currentUser, loading, redirectPath]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D9B9B]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Task 4.2: Redirect to login if not authenticated
  if (!currentUser) {
    return (
      <LoginPage
        onSuccess={() => {
          // After successful login, could redirect to intended destination
          // For now, the parent App component will handle view changes
          if (intendedDestination) {
            console.log('Would redirect to:', intendedDestination);
          }
        }}
        onSwitchToSignup={() => {
          // Handle switch to signup - parent App will manage this
          console.log('Switch to signup requested');
        }}
      />
    );
  }

  // User is authenticated, render protected content
  return children;
}
