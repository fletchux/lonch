import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext');
vi.mock('./LoginPage', () => ({
  default: ({ onSuccess, onSwitchToSignup }) => (
    <div>
      <div>LoginPage Mock</div>
      <button onClick={onSuccess}>Login Success</button>
      <button onClick={onSwitchToSignup}>Switch to Signup</button>
    </div>
  )
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state when checking auth', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: null,
      loading: true,
      error: null
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: null,
      loading: false,
      error: null
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('LoginPage Mock')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockUser,
      loading: false,
      error: null
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('LoginPage Mock')).not.toBeInTheDocument();
  });
});
