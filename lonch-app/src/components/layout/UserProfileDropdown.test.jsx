import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfileDropdown from './UserProfileDropdown';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext');

describe('UserProfileDropdown', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should not render when no user is authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: null,
      logout: mockLogout
    });

    const { container } = render(<UserProfileDropdown />);
    expect(container.firstChild).toBeNull();
  });

  it('should render user avatar with display name', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: null
    };

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockUser,
      logout: mockLogout
    });

    render(<UserProfileDropdown />);

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render user avatar with photo URL', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg'
    };

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockUser,
      logout: mockLogout
    });

    render(<UserProfileDropdown />);

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('should show dropdown menu when clicked', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: null
    };

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockUser,
      logout: mockLogout
    });

    render(<UserProfileDropdown />);

    const menuButton = screen.getByLabelText('User menu');
    fireEvent.click(menuButton);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    mockLogout.mockResolvedValue();

    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: null
    };

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockUser,
      logout: mockLogout
    });

    render(<UserProfileDropdown />);

    const menuButton = screen.getByLabelText('User menu');
    fireEvent.click(menuButton);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should close dropdown when clicking outside', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: null
    };

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockUser,
      logout: mockLogout
    });

    render(<UserProfileDropdown />);

    // Open dropdown
    const menuButton = screen.getByLabelText('User menu');
    fireEvent.click(menuButton);
    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });
});
