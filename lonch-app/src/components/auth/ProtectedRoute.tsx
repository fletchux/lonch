import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
  onSwitchToSignup?: () => void;
  onLoginSuccess?: () => void;
}

export default function ProtectedRoute({
  children,
  redirectPath = 'login',
  onSwitchToSignup,
  onLoginSuccess
}: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

  useEffect(() => {
    // Preserve intended destination for post-login redirect
    if (!loading && !currentUser && redirectPath) {
      setIntendedDestination(window.location.pathname);
    }
  }, [currentUser, loading, redirectPath]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return (
      <LoginPage
        onSuccess={() => {
          // After successful login, call the passed callback or log for debugging
          if (onLoginSuccess) {
            onLoginSuccess();
          } else if (intendedDestination) {
            console.log('Would redirect to:', intendedDestination);
          }
        }}
        onSwitchToSignup={() => {
          // Handle switch to signup - call the passed callback
          if (onSwitchToSignup) {
            onSwitchToSignup();
          } else {
            console.log('Switch to signup requested');
          }
        }}
      />
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}
