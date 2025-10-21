import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentList from './DocumentList';
import { VISIBILITY, GROUP } from '../utils/groupPermissions';
import * as projectService from '../services/projectService';
import * as activityLogService from '../services/activityLogService';
import { useProjectPermissions } from '../hooks/useProjectPermissions';

// Mock the hooks and services
vi.mock('../hooks/useProjectPermissions');
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test-user-123' } })
}));
vi.mock('../services/projectService');
vi.mock('../services/activityLogService');

describe('DocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for permissions - can be overridden in specific tests
    useProjectPermissions.mockReturnValue({
      group: GROUP.CONSULTING,
      canViewDocument: vi.fn(() => true),
      canSetDocumentVisibility: vi.fn(() => true),
      canInvite: true
    });

    vi.mocked(projectService.updateProject).mockResolvedValue({});
    vi.mocked(activityLogService.logActivity).mockResolvedValue({});
  });

  const mockDocuments = [
    {
      id: '1',
      name: 'contract.pdf',
      category: 'contract',
      size: 1024000,
      uploadedAt: '2024-01-15T10:00:00Z',
      uploadedBy: 'John Doe'
    },
    {
      id: '2',
      name: 'specifications.docx',
      category: 'specifications',
      size: 512000,
      createdAt: '2024-01-16T14:30:00Z',
      uploadedBy: 'Jane Smith'
    },
    {
      id: '3',
      name: 'notes.txt',
      category: 'other',
      size: 2048,
      uploadedAt: '2024-01-17T09:15:00Z'
    }
  ];

  it('should render successfully with no documents', () => {
    render(<DocumentList documents={[]} projectId="test-project-123" />);
    expect(screen.getByText('No documents found')).toBeInTheDocument();
  });

  it('should show empty state message when no documents exist', () => {
    render(<DocumentList documents={[]} />);
    expect(screen.getByText('Upload documents to get started')).toBeInTheDocument();
  });

  it('should render document table when documents exist', () => {
    render(<DocumentList documents={mockDocuments} />);
    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.getByText('specifications.docx')).toBeInTheDocument();
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
  });

  it('should display all table headers', () => {
    render(<DocumentList documents={mockDocuments} />);
    expect(screen.getByText('File Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Uploaded By')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should format file sizes correctly', () => {
    render(<DocumentList documents={mockDocuments} />);
    expect(screen.getByText('1000 KB')).toBeInTheDocument(); // 1024000 bytes
    expect(screen.getByText('500 KB')).toBeInTheDocument(); // 512000 bytes
    expect(screen.getByText('2 KB')).toBeInTheDocument(); // 2048 bytes
  });

  it('should display category badges with correct colors', () => {
    const { container } = render(<DocumentList documents={mockDocuments} />);
    const badges = container.querySelectorAll('[class*="rounded-full"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should show "Upload New Document" button when onUploadNew is provided', () => {
    const onUploadNew = vi.fn();
    render(<DocumentList documents={mockDocuments} onUploadNew={onUploadNew} />);
    expect(screen.getByText('Upload New Document')).toBeInTheDocument();
  });

  it('should call onUploadNew when button is clicked', () => {
    const onUploadNew = vi.fn();
    render(<DocumentList documents={mockDocuments} onUploadNew={onUploadNew} />);

    const button = screen.getByText('Upload New Document');
    fireEvent.click(button);

    expect(onUploadNew).toHaveBeenCalledTimes(1);
  });

  it('should filter documents by category', () => {
    render(<DocumentList documents={mockDocuments} projectId="test-project-123" />);

    // Get the category filter select (it comes before the visibility toggles)
    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[0];
    fireEvent.change(categorySelect, { target: { value: 'contract' } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.queryByText('specifications.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
  });

  it('should show all documents when "all" category is selected', () => {
    render(<DocumentList documents={mockDocuments} projectId="test-project-123" />);

    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[0];

    // First filter to a specific category
    fireEvent.change(categorySelect, { target: { value: 'contract' } });

    // Then back to all
    fireEvent.change(categorySelect, { target: { value: 'all' } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.getByText('specifications.docx')).toBeInTheDocument();
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
  });

  it('should show empty state when filtered category has no documents', () => {
    render(<DocumentList documents={[mockDocuments[0]]} projectId="test-project-123" />);

    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[0];
    fireEvent.change(categorySelect, { target: { value: 'specifications' } });

    expect(screen.getByText('No documents found')).toBeInTheDocument();
    expect(screen.getByText('No documents in the "Specifications" category')).toBeInTheDocument();
  });

  it('should call onDownload when download button is clicked', () => {
    const onDownload = vi.fn();
    const { container } = render(
      <DocumentList documents={mockDocuments} onDownload={onDownload} />
    );

    const downloadButtons = container.querySelectorAll('svg[viewBox="0 0 24 24"]').length;
    expect(downloadButtons).toBeGreaterThan(0);

    // Click the first download button
    const buttons = container.querySelectorAll('button');
    const downloadButton = Array.from(buttons).find(btn =>
      btn.querySelector('path[d*="M12 10v6"]')
    );

    if (downloadButton) {
      fireEvent.click(downloadButton);
      expect(onDownload).toHaveBeenCalledTimes(1);
      expect(onDownload).toHaveBeenCalledWith(mockDocuments[0]);
    }
  });

  it('should require double-click to delete document', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <DocumentList documents={mockDocuments} onDelete={onDelete} />
    );

    const buttons = container.querySelectorAll('button');
    const deleteButton = Array.from(buttons).find(btn =>
      btn.querySelector('path[d*="M19 7l"]')
    );

    if (deleteButton) {
      // First click - should not delete
      fireEvent.click(deleteButton);
      expect(onDelete).not.toHaveBeenCalled();

      // Second click - should delete
      fireEvent.click(deleteButton);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('1');
    }
  });

  it('should display document count', () => {
    render(<DocumentList documents={mockDocuments} />);
    expect(screen.getByText('Showing 3 documents')).toBeInTheDocument();
  });

  it('should display singular "document" for single document', () => {
    render(<DocumentList documents={[mockDocuments[0]]} />);
    expect(screen.getByText('Showing 1 document')).toBeInTheDocument();
  });

  it('should display "You" when uploadedBy is not provided', () => {
    render(<DocumentList documents={mockDocuments} />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('should handle documents with default values', () => {
    const minimalDoc = [{
      id: '4',
      name: 'minimal.pdf'
    }];

    const { container } = render(<DocumentList documents={minimalDoc} projectId="test-project-123" />);
    expect(container.querySelector('table')).toBeTruthy();
  });

  // Task 5.10: Document visibility filtering tests
  describe('Document Visibility Filtering', () => {
    const documentsWithVisibility = [
      {
        id: '1',
        name: 'consulting-only.pdf',
        category: 'contract',
        size: 1024000,
        uploadedAt: '2024-01-15T10:00:00Z',
        uploadedBy: 'Consultant',
        visibility: VISIBILITY.CONSULTING_ONLY
      },
      {
        id: '2',
        name: 'client-only.pdf',
        category: 'specifications',
        size: 512000,
        uploadedAt: '2024-01-16T14:30:00Z',
        uploadedBy: 'Client',
        visibility: VISIBILITY.CLIENT_ONLY
      },
      {
        id: '3',
        name: 'both-groups.pdf',
        category: 'other',
        size: 2048,
        uploadedAt: '2024-01-17T09:15:00Z',
        uploadedBy: 'Admin',
        visibility: VISIBILITY.BOTH
      }
    ];

    it('should show Visibility column header', () => {
      render(<DocumentList documents={documentsWithVisibility} projectId="test-project-123" />);
      expect(screen.getByText('Visibility')).toBeInTheDocument();
    });

    it('should filter out documents consulting user cannot see', () => {
      useProjectPermissions.mockReturnValue({
        group: GROUP.CONSULTING,
        canViewDocument: (visibility) => {
          // Consulting users can see consulting_only and both
          return visibility === VISIBILITY.CONSULTING_ONLY || visibility === VISIBILITY.BOTH;
        },
        canSetDocumentVisibility: vi.fn(() => true),
        canInvite: true
      });

      render(<DocumentList documents={documentsWithVisibility} projectId="test-project-123" />);

      // Should see consulting-only and both
      expect(screen.getByText('consulting-only.pdf')).toBeInTheDocument();
      expect(screen.getByText('both-groups.pdf')).toBeInTheDocument();

      // Should NOT see client-only
      expect(screen.queryByText('client-only.pdf')).not.toBeInTheDocument();
    });

    it('should filter out documents client user cannot see', () => {
      useProjectPermissions.mockReturnValue({
        group: GROUP.CLIENT,
        canViewDocument: (visibility) => {
          // Client users can see client_only and both
          return visibility === VISIBILITY.CLIENT_ONLY || visibility === VISIBILITY.BOTH;
        },
        canSetDocumentVisibility: vi.fn(() => false),
        canInvite: false
      });

      render(<DocumentList documents={documentsWithVisibility} projectId="test-project-123" />);

      // Should see client-only and both
      expect(screen.getByText('client-only.pdf')).toBeInTheDocument();
      expect(screen.getByText('both-groups.pdf')).toBeInTheDocument();

      // Should NOT see consulting-only
      expect(screen.queryByText('consulting-only.pdf')).not.toBeInTheDocument();
    });

    it('should show all documents to users with full access', () => {
      useProjectPermissions.mockReturnValue({
        group: GROUP.CONSULTING,
        canViewDocument: vi.fn(() => true), // Can see everything
        canSetDocumentVisibility: vi.fn(() => true),
        canInvite: true
      });

      render(<DocumentList documents={documentsWithVisibility} projectId="test-project-123" />);

      // Should see all documents
      expect(screen.getByText('consulting-only.pdf')).toBeInTheDocument();
      expect(screen.getByText('client-only.pdf')).toBeInTheDocument();
      expect(screen.getByText('both-groups.pdf')).toBeInTheDocument();
    });

    it('should render DocumentVisibilityToggle for each visible document', () => {
      const { container } = render(
        <DocumentList documents={documentsWithVisibility} projectId="test-project-123" />
      );

      const visibilityToggles = container.querySelectorAll('[data-testid="visibility-toggle"]');
      expect(visibilityToggles.length).toBe(3);
    });

    it('should disable visibility toggle for users without permission', () => {
      useProjectPermissions.mockReturnValue({
        group: GROUP.CLIENT,
        canViewDocument: vi.fn(() => true),
        canSetDocumentVisibility: vi.fn(() => false), // No permission
        canInvite: false
      });

      const { container } = render(
        <DocumentList documents={documentsWithVisibility} projectId="test-project-123" />
      );

      const visibilitySelects = container.querySelectorAll('[data-testid="visibility-select"]');
      visibilitySelects.forEach(select => {
        expect(select).toBeDisabled();
      });
    });

    it('should enable visibility toggle for users with permission', () => {
      useProjectPermissions.mockReturnValue({
        group: GROUP.CONSULTING,
        canViewDocument: vi.fn(() => true),
        canSetDocumentVisibility: vi.fn(() => true), // Has permission
        canInvite: true
      });

      const { container } = render(
        <DocumentList documents={documentsWithVisibility} projectId="test-project-123" />
      );

      const visibilitySelects = container.querySelectorAll('[data-testid="visibility-select"]');
      visibilitySelects.forEach(select => {
        expect(select).not.toBeDisabled();
      });
    });

    it('should call updateProject and log activity when visibility changes', async () => {
      render(<DocumentList documents={documentsWithVisibility} projectId="test-project-123" />);

      const visibilitySelects = screen.getAllByTestId('visibility-select');
      const firstSelect = visibilitySelects[0];

      // Change visibility
      fireEvent.change(firstSelect, { target: { value: VISIBILITY.BOTH } });

      await waitFor(() => {
        expect(projectService.updateProject).toHaveBeenCalledWith(
          'test-project-123',
          expect.objectContaining({
            documents: expect.arrayContaining([
              expect.objectContaining({
                id: '1',
                visibility: VISIBILITY.BOTH
              })
            ])
          })
        );
      });

      await waitFor(() => {
        expect(activityLogService.logActivity).toHaveBeenCalledWith(
          'test-project-123',
          'test-user-123',
          'document_visibility_changed',
          'document',
          '1',
          expect.objectContaining({
            documentName: 'consulting-only.pdf',
            oldVisibility: VISIBILITY.CONSULTING_ONLY,
            newVisibility: VISIBILITY.BOTH
          }),
          GROUP.CONSULTING
        );
      });
    });

    it('should default to BOTH visibility for documents without visibility field', () => {
      const docsWithoutVisibility = [
        {
          id: '1',
          name: 'legacy-doc.pdf',
          category: 'contract',
          size: 1024,
          uploadedAt: '2024-01-15T10:00:00Z'
          // No visibility field
        }
      ];

      const { container } = render(
        <DocumentList documents={docsWithoutVisibility} projectId="test-project-123" />
      );

      const visibilitySelect = container.querySelector('[data-testid="visibility-select"]');
      expect(visibilitySelect.value).toBe(VISIBILITY.BOTH);
    });

    it('should show correct document count after visibility filtering', () => {
      useProjectPermissions.mockReturnValue({
        group: GROUP.CLIENT,
        canViewDocument: (visibility) => {
          return visibility === VISIBILITY.CLIENT_ONLY || visibility === VISIBILITY.BOTH;
        },
        canSetDocumentVisibility: vi.fn(() => false),
        canInvite: false
      });

      render(<DocumentList documents={documentsWithVisibility} projectId="test-project-123" />);

      // Client can only see 2 documents (client-only and both)
      expect(screen.getByText('Showing 2 documents')).toBeInTheDocument();
    });

    it('should combine category and visibility filters correctly', () => {
      useProjectPermissions.mockReturnValue({
        group: GROUP.CONSULTING,
        canViewDocument: (visibility) => {
          return visibility === VISIBILITY.CONSULTING_ONLY || visibility === VISIBILITY.BOTH;
        },
        canSetDocumentVisibility: vi.fn(() => true),
        canInvite: true
      });

      render(<DocumentList documents={documentsWithVisibility} projectId="test-project-123" />);

      // Filter by category
      const categorySelect = screen.getAllByRole('combobox')[0]; // First combobox is category filter
      fireEvent.change(categorySelect, { target: { value: 'contract' } });

      // Should only show consulting-only.pdf (category=contract, visibility=consulting_only)
      expect(screen.getByText('consulting-only.pdf')).toBeInTheDocument();
      expect(screen.queryByText('both-groups.pdf')).not.toBeInTheDocument();
      expect(screen.queryByText('client-only.pdf')).not.toBeInTheDocument();
    });
  });
});
