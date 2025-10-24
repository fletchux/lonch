import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectDashboard from './ProjectDashboard';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { GROUP } from '../../utils/groupPermissions';

// Mock dependencies
vi.mock('../../hooks/useProjectPermissions');
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test-user-123' } })
}));

// Mock child components
vi.mock('../documents/DocumentList', () => ({
  default: ({ onUploadNew }) => (
    <div data-testid="document-list">
      <button data-testid="upload-new-button" onClick={onUploadNew}>
        Upload New Document
      </button>
    </div>
  )
}));

vi.mock('../layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('../layout/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('../project/ProjectMembersPanel', () => ({
  default: () => <div data-testid="members-panel">Members</div>
}));

vi.mock('../project/InviteUserModal', () => ({
  default: () => <div data-testid="invite-modal">Invite Modal</div>
}));

vi.mock('../project/ActivityLogPanel', () => ({
  default: () => <div data-testid="activity-panel">Activity</div>
}));

describe('ProjectDashboard - Document Upload Bug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectPermissions.mockReturnValue({
      group: GROUP.CONSULTING,
      canInvite: true
    });
  });

  const mockProject = {
    id: 'test-project-123',
    name: 'Test Project',
    clientType: 'Corporation',
    documents: [],
    clientIntake: {
      companyName: 'Test Corp',
      projectGoal: 'Build something'
    },
    teamTemplate: {
      name: 'Standard Team',
      roles: ['Developer', 'Designer']
    }
  };

  it('should open upload modal when upload button is clicked', () => {
    const onDeleteDocument = vi.fn();
    const onUpdateDocumentCategories = vi.fn();
    const onBack = vi.fn();
    const onNavigateSettings = vi.fn();

    render(
      <ProjectDashboard
        project={mockProject}
        onBack={onBack}
        onDeleteDocument={onDeleteDocument}
        onUpdateDocumentCategories={onUpdateDocumentCategories}
        onNavigateSettings={onNavigateSettings}
      />
    );

    // Find and click the upload button
    const uploadButton = screen.getByTestId('upload-new-button');
    fireEvent.click(uploadButton);

    // This test should FAIL initially - we expect a modal to appear
    // but currently nothing happens
    const uploadModal = screen.queryByTestId('upload-modal');
    expect(uploadModal).toBeInTheDocument();
  });
});
