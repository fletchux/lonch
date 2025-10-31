import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AcceptInviteLinkPage from './AcceptInviteLinkPage';
import * as inviteLinkService from '../../services/inviteLinkService';
import * as projectService from '../../services/projectService';
import * as userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

// Mock the contexts and services
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../services/inviteLinkService', () => ({
  getInviteLink: vi.fn(),
  acceptInviteLink: vi.fn()
}));

vi.mock('../../services/projectService', () => ({
  getProject: vi.fn()
}));

vi.mock('../../services/userService', () => ({
  getUser: vi.fn()
}));

describe('AcceptInviteLinkPage', () => {
  const mockOnAccepted = vi.fn();
  const mockOnNavigateToLogin = vi.fn();
  const mockOnNavigateToHome = vi.fn();
  const mockToken = 'test-token-123';

  const mockLink = {
    id: 'link-123',
    token: mockToken,
    projectId: 'project-456',
    role: 'editor',
    group: 'consulting',
    createdBy: 'user-creator',
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days in future
  };

  const mockProject = {
    id: 'project-456',
    name: 'Test Project'
  };

  const mockCreator = {
    uid: 'user-creator',
    displayName: 'John Creator',
    email: 'creator@example.com'
  };

  const mockCurrentUser = {
    uid: 'user-123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      useAuth.mockReturnValue({ currentUser: mockCurrentUser });
      vi.mocked(inviteLinkService.getInviteLink).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      expect(screen.getByText('Loading invitation details...')).toBeInTheDocument();
    });
  });

  describe('Link Not Found', () => {
    it('should show error when link is not found', async () => {
      useAuth.mockReturnValue({ currentUser: mockCurrentUser });
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(null);

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Invite link not found/)).toBeInTheDocument();
      });
    });

    it('should show Go to Home button when link not found', async () => {
      useAuth.mockReturnValue({ currentUser: mockCurrentUser });
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(null);

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Go to Home')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Go to Home'));
      expect(mockOnNavigateToHome).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authentication Required', () => {
    it('should show login prompt when user is not authenticated', async () => {
      useAuth.mockReturnValue({ currentUser: null });
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(mockLink);
      vi.mocked(projectService.getProject).mockResolvedValue(mockProject);

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Log in or sign up to accept this invitation/)).toBeInTheDocument();
      });
    });

    it('should show login button when user is not authenticated', async () => {
      useAuth.mockReturnValue({ currentUser: null });
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(mockLink);
      vi.mocked(projectService.getProject).mockResolvedValue(mockProject);

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('login-button'));
      expect(mockOnNavigateToLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Expired Link', () => {
    it('should show expired message for expired link', async () => {
      useAuth.mockReturnValue({ currentUser: mockCurrentUser });
      const expiredLink = {
        ...mockLink,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(expiredLink);

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('This invite has expired')).toBeInTheDocument();
      });
    });
  });

  describe('Used Link', () => {
    it('should show used message for used link', async () => {
      useAuth.mockReturnValue({ currentUser: mockCurrentUser });
      const usedLink = { ...mockLink, status: 'used' };
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(usedLink);

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('This invite has already been used')).toBeInTheDocument();
      });
    });
  });

  describe('Revoked Link', () => {
    it('should show revoked message for revoked link', async () => {
      useAuth.mockReturnValue({ currentUser: mockCurrentUser });
      const revokedLink = { ...mockLink, status: 'revoked' };
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(revokedLink);

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('This invite has been revoked')).toBeInTheDocument();
      });
    });
  });

  describe('Valid Link Acceptance', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ currentUser: mockCurrentUser });
      vi.mocked(inviteLinkService.getInviteLink).mockResolvedValue(mockLink);
      vi.mocked(projectService.getProject).mockResolvedValue(mockProject);
      vi.mocked(userService.getUser).mockResolvedValue(mockCreator);
      vi.mocked(inviteLinkService.acceptInviteLink).mockResolvedValue({
        projectId: 'project-456',
        role: 'editor',
        group: 'consulting'
      });
    });

    it('should display invitation details', async () => {
      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("You've Been Invited!")).toBeInTheDocument();
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('John Creator')).toBeInTheDocument();
      });
    });

    it('should show role and group badges', async () => {
      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('You will join as')).toBeInTheDocument();
      });
    });

    it('should accept invitation when Accept button is clicked', async () => {
      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('accept-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('accept-button'));

      await waitFor(() => {
        expect(inviteLinkService.acceptInviteLink).toHaveBeenCalledWith(mockToken, mockCurrentUser.uid);
        expect(mockOnAccepted).toHaveBeenCalledWith('project-456');
      });
    });

    it('should show loading state while accepting', async () => {
      vi.mocked(inviteLinkService.acceptInviteLink).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('accept-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('accept-button'));

      expect(screen.getByText('Accepting...')).toBeInTheDocument();
      expect(screen.getByTestId('accept-button')).toBeDisabled();
    });

    it('should show error message if acceptance fails', async () => {
      vi.mocked(inviteLinkService.acceptInviteLink).mockRejectedValue(
        new Error('You are already a member of this project')
      );

      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('accept-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('accept-button'));

      await waitFor(() => {
        expect(screen.getByText('You are already a member of this project')).toBeInTheDocument();
      });
    });

    it('should call onNavigateToHome when Decline is clicked', async () => {
      render(
        <AcceptInviteLinkPage
          token={mockToken}
          onAccepted={mockOnAccepted}
          onNavigateToLogin={mockOnNavigateToLogin}
          onNavigateToHome={mockOnNavigateToHome}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('decline-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('decline-button'));
      expect(mockOnNavigateToHome).toHaveBeenCalledTimes(1);
    });
  });
});
