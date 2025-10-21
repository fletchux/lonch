import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenerateLinkModal from './GenerateLinkModal';
import * as inviteLinkService from '../../services/inviteLinkService';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the invite link service
vi.mock('../../services/inviteLinkService', () => ({
  generateInviteLink: vi.fn()
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn()
  }
});

describe('GenerateLinkModal', () => {
  const mockOnClose = vi.fn();
  const mockOnLinkGenerated = vi.fn();
  const mockUser = { uid: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: mockUser });
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue();
  });

  it('should render modal with title', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Generate Shareable Invite Link')).toBeInTheDocument();
  });

  it('should render role selection dropdown', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const roleSelect = screen.getByTestId('role-select');
    expect(roleSelect).toBeInTheDocument();
    expect(roleSelect).toHaveValue('viewer'); // Default value
  });

  it('should render all role options', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const roleSelect = screen.getByTestId('role-select');
    const options = Array.from(roleSelect.options).map(opt => opt.value);

    expect(options).toEqual(['owner', 'admin', 'editor', 'viewer']);
  });

  it('should render group selection radio buttons', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('group-radio-consulting')).toBeInTheDocument();
    expect(screen.getByTestId('group-radio-client')).toBeInTheDocument();
    expect(screen.getByTestId('group-radio-client')).toBeChecked(); // Default
  });

  it('should update selected role when dropdown changes', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const roleSelect = screen.getByTestId('role-select');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    expect(roleSelect).toHaveValue('admin');
  });

  it('should update selected group when radio button changes', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const consultingRadio = screen.getByTestId('group-radio-consulting');
    fireEvent.click(consultingRadio);

    expect(consultingRadio).toBeChecked();
  });

  it('should show preview with selected role and group', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const previewText = screen.getByText(/Recipients will join as/);
    expect(previewText).toBeInTheDocument();
    // Check for role badge in preview section
    const previewSection = previewText.closest('div');
    expect(previewSection).toBeInTheDocument();
  });

  it('should update preview when role changes', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const roleSelect = screen.getByTestId('role-select');
    fireEvent.change(roleSelect, { target: { value: 'editor' } });

    expect(roleSelect).toHaveValue('editor');
  });

  it('should call generateInviteLink when Generate button is clicked', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'viewer',
      group: 'client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const generateButton = screen.getByTestId('generate-button');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(inviteLinkService.generateInviteLink).toHaveBeenCalledWith(
        'project-123',
        'viewer',
        'client',
        'user-123'
      );
    });
  });

  it('should show loading state while generating link', async () => {
    vi.mocked(inviteLinkService.generateInviteLink).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const generateButton = screen.getByTestId('generate-button');
    fireEvent.click(generateButton);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
  });

  it('should display generated link after successful generation', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'editor',
      group: 'consulting',
      expiresAt: new Date('2025-10-28T12:00:00Z')
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
        onLinkGenerated={mockOnLinkGenerated}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByText('✓ Link generated successfully!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('generated-link-input')).toHaveValue(mockLink.url);
    expect(mockOnLinkGenerated).toHaveBeenCalledWith(mockLink);
  });

  it('should show link details after generation', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'admin',
      group: 'consulting',
      expiresAt: new Date('2025-10-28T12:00:00Z')
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByText('Link Details')).toBeInTheDocument();
    });

    expect(screen.getByText(/Expires:/)).toBeInTheDocument();
    expect(screen.getByText(/This link will expire in 7 days/)).toBeInTheDocument();
  });

  it('should copy link to clipboard when Copy button is clicked', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'viewer',
      group: 'client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-link-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('copy-link-button'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockLink.url);
    });
  });

  it('should show "Copied!" text after successful copy', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'viewer',
      group: 'client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-link-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('copy-link-button'));

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should display error message if link generation fails', async () => {
    vi.mocked(inviteLinkService.generateInviteLink).mockRejectedValue(
      new Error('Failed to generate link')
    );

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate link')).toBeInTheDocument();
    });
  });

  it('should handle clipboard write error gracefully', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'viewer',
      group: 'client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Clipboard error'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-link-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('copy-link-button'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy link:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Done button is clicked after link generation', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'viewer',
      group: 'client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Done'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show single-use warning note', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'viewer',
      group: 'client',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(screen.getByText(/This link is single-use/)).toBeInTheDocument();
    });
  });

  it('should generate link with custom role and group selection', async () => {
    const mockLink = {
      id: 'link-123',
      token: 'token-abc',
      url: 'http://localhost:5173/invite/token-abc',
      role: 'admin',
      group: 'consulting',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

    render(
      <GenerateLinkModal
        projectId="project-123"
        onClose={mockOnClose}
      />
    );

    // Change role to admin
    fireEvent.change(screen.getByTestId('role-select'), { target: { value: 'admin' } });

    // Change group to consulting
    fireEvent.click(screen.getByTestId('group-radio-consulting'));

    fireEvent.click(screen.getByTestId('generate-button'));

    await waitFor(() => {
      expect(inviteLinkService.generateInviteLink).toHaveBeenCalledWith(
        'project-123',
        'admin',
        'consulting',
        'user-123'
      );
    });
  });
});
