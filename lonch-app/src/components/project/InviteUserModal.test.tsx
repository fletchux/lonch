import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InviteUserModal from './InviteUserModal';
import * as AuthContext from '../../contexts/AuthContext';
import * as invitationService from '../../services/invitationService';
import * as useProjectPermissions from '../../hooks/useProjectPermissions';

vi.mock('../../contexts/AuthContext');
vi.mock('../../services/invitationService');
vi.mock('../../hooks/useProjectPermissions');
vi.mock('../../services/activityLogService');

describe('InviteUserModal', () => {
  const mockCurrentUser = { uid: 'owner123', email: 'owner@example.com' };
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockPermissions = {
    role: 'owner',
    group: 'consulting',
    assignableRoles: ['owner', 'admin', 'editor', 'viewer'],
    canMoveUserBetweenGroups: () => true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockCurrentUser,
      loading: false,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      updatePassword: vi.fn(),
      updateEmail: vi.fn(),
      deleteAccount: vi.fn(),
    });
    vi.mocked(useProjectPermissions.useProjectPermissions).mockReturnValue(mockPermissions);

    // Mock window APIs
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true
    });
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true
    });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should not render when isOpen is false', () => {
    render(<InviteUserModal projectId="project1" isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Invite User to Project')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Invite User to Project')).toBeInTheDocument();
  });

  it('should display email, role, and group inputs', () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-select')).toBeInTheDocument();
    expect(screen.getByTestId('group-select')).toBeInTheDocument();
  });

  it('should show error for invalid email', async () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should show error for empty email', async () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const inviteButton = screen.getByTestId('invite-button');
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should call createInvitation with correct params including default group', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'user@example.com',
      role: 'editor',
      group: 'client'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const roleSelect = screen.getByTestId('role-select') as HTMLSelectElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'editor' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        'project1',
        'user@example.com',
        'editor',
        'owner123',
        'client'
      );
    });
  });

  it('should show success state with invite link after creation', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'user@example.com',
      role: 'editor'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invitation Sent!')).toBeInTheDocument();
      const inviteLinkInput = screen.getByTestId('invite-link') as HTMLInputElement;
      expect(inviteLinkInput).toHaveValue('http://localhost:3000/invite/token123');
    });
  });

  it('should copy invite link to clipboard', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'user@example.com',
      role: 'editor'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByTestId('copy-link-button')).toBeInTheDocument();
    });

    const copyButton = screen.getByTestId('copy-link-button');
    fireEvent.click(copyButton);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/invite/token123');
    expect(window.alert).toHaveBeenCalledWith('Invite link copied to clipboard!');
  });

  it('should call onSuccess callback after successful invitation', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'user@example.com',
      role: 'editor'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockInvitation);
    });
  });

  it('should display error message on invitation failure', async () => {
    vi.mocked(invitationService.createInvitation).mockRejectedValue(
      new Error('User already has a pending invitation for this project')
    );

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'User already has a pending invitation for this project'
      );
    });
  });

  it('should close modal and reset state when Cancel is clicked', () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when Done is clicked after success', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'user@example.com',
      role: 'editor'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    const doneButton = screen.getByText('Done');
    fireEvent.click(doneButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable inputs while loading', async () => {
    vi.mocked(invitationService.createInvitation).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const roleSelect = screen.getByTestId('role-select') as HTMLSelectElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(roleSelect).toBeDisabled();
      expect(inviteButton).toBeDisabled();
      expect(inviteButton).toHaveTextContent('Sending...');
    }, { timeout: 1000 });
  });

  // Group selection tests
  it('should default group selection to Client Group', () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);
    const groupSelect = screen.getByTestId('group-select') as HTMLSelectElement;
    expect(groupSelect).toHaveValue('client');
  });

  it('should allow selecting Consulting Group', () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);
    const groupSelect = screen.getByTestId('group-select') as HTMLSelectElement;

    fireEvent.change(groupSelect, { target: { value: 'consulting' } });
    expect(groupSelect).toHaveValue('consulting');
  });

  it('should call createInvitation with consulting group when selected', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'consultant@example.com',
      role: 'admin',
      group: 'consulting'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const roleSelect = screen.getByTestId('role-select') as HTMLSelectElement;
    const groupSelect = screen.getByTestId('group-select') as HTMLSelectElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'consultant@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    fireEvent.change(groupSelect, { target: { value: 'consulting' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        'project1',
        'consultant@example.com',
        'admin',
        'owner123',
        'consulting'
      );
    });
  });

  it('should show error when non-Owner/Admin tries to invite to Consulting Group', async () => {
    const editorPermissions = {
      role: 'editor',
      group: 'client',
      assignableRoles: [],
      canMoveUserBetweenGroups: () => false
    };
    vi.mocked(useProjectPermissions.useProjectPermissions).mockReturnValue(editorPermissions);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const groupSelect = screen.getByTestId('group-select') as HTMLSelectElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(groupSelect, { target: { value: 'consulting' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Only Owner and Admin can invite users to the Consulting Group'
      );
    });

    expect(invitationService.createInvitation).not.toHaveBeenCalled();
  });

  it('should show warning message when Consulting Group is selected without permissions', () => {
    const editorPermissions = {
      role: 'editor',
      group: 'client',
      assignableRoles: [],
      canMoveUserBetweenGroups: () => false
    };
    vi.mocked(useProjectPermissions.useProjectPermissions).mockReturnValue(editorPermissions);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const groupSelect = screen.getByTestId('group-select') as HTMLSelectElement;
    fireEvent.change(groupSelect, { target: { value: 'consulting' } });

    expect(screen.getByText('Only Owner and Admin can invite to the Consulting Group')).toBeInTheDocument();
  });

  it('should display group in success message', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'user@example.com',
      role: 'editor',
      group: 'consulting'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const groupSelect = screen.getByTestId('group-select') as HTMLSelectElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(groupSelect, { target: { value: 'consulting' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText(/Invitation sent to/)).toBeInTheDocument();
      expect(screen.getByText(/Consulting Group/)).toBeInTheDocument();
    });
  });

  it('should normalize email to lowercase', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'test@example.com',
      role: 'viewer'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'TEST@EXAMPLE.COM' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        'project1',
        'test@example.com',
        'viewer',
        'owner123',
        'client'
      );
    });
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const roleSelect = screen.getByTestId('role-select') as HTMLSelectElement;
    const groupSelect = screen.getByTestId('group-select') as HTMLSelectElement;

    // Inputs should have proper IDs
    expect(emailInput).toHaveAttribute('id', 'email');
    expect(roleSelect).toHaveAttribute('id', 'role');
    expect(groupSelect).toHaveAttribute('id', 'group');

    // Submit to trigger validation errors
    const inviteButton = screen.getByTestId('invite-button');
    fireEvent.click(inviteButton);

    // Wait for validation errors to appear
    waitFor(() => {
      // Error messages should have role="alert"
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
});
