import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InviteUserModal from './InviteUserModal';
import * as AuthContext from '../../contexts/AuthContext';
import * as invitationService from '../../services/invitationService';
import * as useProjectPermissions from '../../hooks/useProjectPermissions';

vi.mock('../../contexts/AuthContext');
vi.mock('../../services/invitationService');
vi.mock('../../hooks/useProjectPermissions');

describe('InviteUserModal', () => {
  const mockCurrentUser = { uid: 'owner123', email: 'owner@example.com' };
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockPermissions = {
    role: 'owner',
    assignableRoles: ['owner', 'admin', 'editor', 'viewer']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      currentUser: mockCurrentUser,
      loading: false,
      error: null
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

  it('should render modal when isOpen is true', async () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Invite User to Project')).toBeInTheDocument();
  });

  it('should display email and role inputs', async () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-select')).toBeInTheDocument();
  });

  it('should show error for invalid email', async () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Form submission triggers validation
    const form = emailInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
    });
  });

  it('should show error for empty email', async () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const inviteButton = screen.getByTestId('invite-button');
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Email is required');
    });
  });

  it('should call createInvitation with correct params', async () => {
    const mockInvitation = {
      id: 'inv123',
      token: 'token123',
      email: 'user@example.com',
      role: 'editor'
    };
    vi.mocked(invitationService.createInvitation).mockResolvedValue(mockInvitation);

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByTestId('email-input');
    const roleSelect = screen.getByTestId('role-select');
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'editor' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        'project1',
        'user@example.com',
        'editor',
        'owner123'
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

    const emailInput = screen.getByTestId('email-input');
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('Invitation Sent!')).toBeInTheDocument();
      expect(screen.getByTestId('invite-link')).toHaveValue('http://localhost:3000/invite/token123');
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

    const emailInput = screen.getByTestId('email-input');
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

    const emailInput = screen.getByTestId('email-input');
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

    const emailInput = screen.getByTestId('email-input');
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'User already has a pending invitation for this project'
      );
    });
  });

  it('should close modal and reset state when Cancel is clicked', async () => {
    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input');
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

    const emailInput = screen.getByTestId('email-input');
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
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<InviteUserModal projectId="project1" isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByTestId('email-input');
    const roleSelect = screen.getByTestId('role-select');
    const inviteButton = screen.getByTestId('invite-button');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(inviteButton);

    expect(emailInput).toBeDisabled();
    expect(roleSelect).toBeDisabled();
    expect(inviteButton).toBeDisabled();
    expect(inviteButton).toHaveTextContent('Sending...');
  });
});
