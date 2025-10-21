import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareLinksTab from './ShareLinksTab';
import * as inviteLinkService from '../../services/inviteLinkService';
import * as userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';

// Mock the contexts and services
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../hooks/useProjectPermissions', () => ({
  useProjectPermissions: vi.fn()
}));

vi.mock('../../services/inviteLinkService', () => ({
  getProjectInviteLinks: vi.fn(),
  revokeInviteLink: vi.fn()
}));

vi.mock('../../services/userService', () => ({
  getUser: vi.fn()
}));

vi.mock('./GenerateLinkModal', () => ({
  default: ({ onClose, onLinkGenerated }) => (
    <div data-testid="generate-link-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={onLinkGenerated}>Link Generated</button>
    </div>
  )
}));

describe('ShareLinksTab', () => {
  const mockCurrentUser = { uid: 'user-123' };
  const mockPermissions = { role: 'owner' };

  const mockCreator = {
    uid: 'user-creator',
    displayName: 'John Doe',
    email: 'john@example.com'
  };

  const mockCurrentUserInfo = {
    uid: 'user-123',
    displayName: 'Current User',
    email: 'current@example.com'
  };

  const mockLinks = [
    {
      id: 'link-1',
      token: 'token-1',
      projectId: 'project-123',
      role: 'editor',
      group: 'consulting',
      createdBy: 'user-creator',
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3600000), // 5 days + 1 hour from now
      acceptedBy: null,
      acceptedAt: null
    },
    {
      id: 'link-2',
      token: 'token-2',
      projectId: 'project-123',
      role: 'viewer',
      group: 'client',
      createdBy: 'user-123',
      status: 'used',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 3600000), // 1 day + 1 hour from now
      acceptedBy: 'user-other',
      acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: mockCurrentUser });
    useProjectPermissions.mockReturnValue(mockPermissions);
    vi.mocked(inviteLinkService.getProjectInviteLinks).mockResolvedValue(mockLinks);
    vi.mocked(userService.getUser).mockImplementation((userId) => {
      if (userId === 'user-123') return Promise.resolve(mockCurrentUserInfo);
      return Promise.resolve(mockCreator);
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ShareLinksTab projectId="project-123" />);

      expect(screen.getByText('Loading invite links...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockRejectedValue(
        new Error('Failed to fetch links')
      );

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch links/)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no links exist', async () => {
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockResolvedValue([]);

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText('No invite links yet. Generate one to get started.')).toBeInTheDocument();
      });
    });

    it('should show generate button in empty state', async () => {
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockResolvedValue([]);

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText('Generate First Link')).toBeInTheDocument();
      });
    });
  });

  describe('Links Table', () => {
    it('should display links in table format', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('links-table')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Current User')).toBeInTheDocument();
    });

    it('should display table headers', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Group')).toBeInTheDocument();
        expect(screen.getByText('Created By')).toBeInTheDocument();
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Expires')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    it('should display creator avatar and name', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Current User')).toBeInTheDocument();
      });
    });

    it('should mark current user links with (You)', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        // Second link is created by current user
        const youLabels = screen.getAllByText('(You)');
        expect(youLabels.length).toBeGreaterThan(0);
      });
    });

    it('should display relative timestamps', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        // Should show "2d ago" or similar relative time
        const timestamps = screen.getAllByText(/\d+[mhd] ago/);
        expect(timestamps.length).toBeGreaterThan(0);
      });
    });

    it('should display expiration dates', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        // Should show "5d" or "1d" for days until expiration
        const expirations = screen.getAllByText(/\d+[hd]/);
        expect(expirations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Status Badges', () => {
    it('should show Active badge for active links', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('should show Used badge for used links', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText('Used')).toBeInTheDocument();
      });
    });

    it('should show Revoked badge for revoked links', async () => {
      const revokedLinks = [{
        ...mockLinks[0],
        status: 'revoked'
      }];
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockResolvedValue(revokedLinks);

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByText('Revoked')).toBeInTheDocument();
      });
    });

    it('should show Expired badge for expired links', async () => {
      const expiredLinks = [{
        ...mockLinks[0],
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }];
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockResolvedValue(expiredLinks);

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        // "Expired" appears in both the expiration column and status badge
        const expiredTexts = screen.getAllByText('Expired');
        expect(expiredTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Generate Link', () => {
    it('should show generate button in header', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('generate-link-button')).toBeInTheDocument();
      });
    });

    it('should open modal when generate button is clicked', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('generate-link-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('generate-link-button'));

      expect(screen.getByTestId('generate-link-modal')).toBeInTheDocument();
    });

    it('should close modal and refresh links when link is generated', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('generate-link-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('generate-link-button'));

      const linkGeneratedButton = screen.getByText('Link Generated');
      fireEvent.click(linkGeneratedButton);

      await waitFor(() => {
        expect(screen.queryByTestId('generate-link-modal')).not.toBeInTheDocument();
      });

      // Should have called getProjectInviteLinks twice (initial + refresh)
      expect(inviteLinkService.getProjectInviteLinks).toHaveBeenCalledTimes(2);
    });
  });

  describe('Revoke Link', () => {
    it('should show revoke button for active links', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getAllByTestId('revoke-button')).toHaveLength(1);
      });
    });

    it('should not show revoke button for used links', async () => {
      const usedLinks = [{
        ...mockLinks[0],
        status: 'used'
      }];
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockResolvedValue(usedLinks);

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.queryByTestId('revoke-button')).not.toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when revoke is clicked', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('revoke-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('revoke-button'));

      expect(screen.getByText('Confirm Revocation')).toBeInTheDocument();
      expect(screen.getByText(/Revoke this invite link/)).toBeInTheDocument();
    });

    it('should call revokeInviteLink when confirmed', async () => {
      vi.mocked(inviteLinkService.revokeInviteLink).mockResolvedValue();

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('revoke-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('revoke-button'));
      fireEvent.click(screen.getByTestId('confirm-revoke'));

      await waitFor(() => {
        expect(inviteLinkService.revokeInviteLink).toHaveBeenCalledWith('link-1', 'user-123');
      });
    });

    it('should refresh links after revocation', async () => {
      vi.mocked(inviteLinkService.revokeInviteLink).mockResolvedValue();

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('revoke-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('revoke-button'));
      fireEvent.click(screen.getByTestId('confirm-revoke'));

      await waitFor(() => {
        // Should have called getProjectInviteLinks twice (initial + refresh)
        expect(inviteLinkService.getProjectInviteLinks).toHaveBeenCalledTimes(2);
      });
    });

    it('should close confirmation dialog when cancelled', async () => {
      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('revoke-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('revoke-button'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Confirm Revocation')).not.toBeInTheDocument();
    });

    it('should show error alert when revocation fails', async () => {
      vi.mocked(inviteLinkService.revokeInviteLink).mockRejectedValue(
        new Error('Failed to revoke link')
      );
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('revoke-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('revoke-button'));
      fireEvent.click(screen.getByTestId('confirm-revoke'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to revoke link: Failed to revoke link');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Permissions', () => {
    it('should allow owner to revoke any link', async () => {
      useProjectPermissions.mockReturnValue({ role: 'owner' });

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('revoke-button')).toBeInTheDocument();
      });
    });

    it('should allow admin to revoke any link', async () => {
      useProjectPermissions.mockReturnValue({ role: 'admin' });

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('revoke-button')).toBeInTheDocument();
      });
    });

    it('should only allow users to revoke their own links', async () => {
      useProjectPermissions.mockReturnValue({ role: 'editor' });

      // Mock two links: one by current user, one by another user
      const mixedLinks = [
        {
          ...mockLinks[0],
          createdBy: 'other-user',
          status: 'active'
        },
        {
          ...mockLinks[1],
          createdBy: 'user-123',
          status: 'active'
        }
      ];
      vi.mocked(inviteLinkService.getProjectInviteLinks).mockResolvedValue(mixedLinks);

      render(<ShareLinksTab projectId="project-123" />);

      await waitFor(() => {
        // Should only show one revoke button (for user's own link)
        const revokeButtons = screen.getAllByTestId('revoke-button');
        expect(revokeButtons).toHaveLength(1);
      });
    });
  });
});
