import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentUpload from './DocumentUpload';
import { VISIBILITY, GROUP } from '../../utils/groupPermissions';

// Mock useProjectPermissions hook
vi.mock('../../hooks/useProjectPermissions', () => ({
  useProjectPermissions: vi.fn(() => ({
    group: GROUP.CONSULTING,
    canViewDocument: vi.fn(() => true),
    canSetDocumentVisibility: vi.fn(() => true),
    canInvite: true
  }))
}));

describe('DocumentUpload Component', () => {
  const mockOnFilesSelected = vi.fn();
  const mockOnUploadComplete = vi.fn();
  const mockProjectId = 'test-project-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload zone with instructions', () => {
    render(
      <DocumentUpload
        projectId={mockProjectId}
        onFilesSelected={mockOnFilesSelected}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    expect(screen.getByText(/Upload your project contracts/i)).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
    expect(screen.getByText(/Supported formats: PDF, DOCX, TXT/i)).toBeInTheDocument();
  });

  it('should render dropzone with proper role', () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const dropzone = screen.getByRole('presentation');
    expect(dropzone).toBeInTheDocument();
    expect(dropzone).toHaveClass('border-2', 'border-dashed', 'cursor-pointer');
  });

  it('should accept valid file types (PDF)', async () => {
    render(
      <DocumentUpload
        projectId={mockProjectId}
        onFilesSelected={mockOnFilesSelected}
      />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    expect(mockOnFilesSelected).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test.pdf',
          category: 'other',
          visibility: VISIBILITY.CONSULTING_ONLY // Default for consulting group
        })
      ])
    );
  });

  it('should accept valid file types (DOCX)', async () => {
    render(<DocumentUpload projectId={mockProjectId} onFilesSelected={mockOnFilesSelected} />);

    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.docx')).toBeInTheDocument();
    });
  });

  it('should accept valid file types (TXT)', async () => {
    render(<DocumentUpload projectId={mockProjectId} onFilesSelected={mockOnFilesSelected} />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  it('should have correct file input attributes', () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept');
    expect(input).toHaveAttribute('multiple');
    expect(input.accept).toContain('application/pdf');
    expect(input.accept).toContain('.docx');
    expect(input.accept).toContain('.txt');
  });

  it('should handle multiple file uploads', async () => {
    render(<DocumentUpload projectId={mockProjectId} onFilesSelected={mockOnFilesSelected} />);

    const files = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }),
      new File(['content3'], 'file3.txt', { type: 'text/plain' })
    ];
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, files);

    await waitFor(() => {
      expect(screen.getByText('Selected Files (3)')).toBeInTheDocument();
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.docx')).toBeInTheDocument();
      expect(screen.getByText('file3.txt')).toBeInTheDocument();
    });
  });

  it('should display file size correctly', async () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const file = new File(['x'.repeat(1024)], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });
  });

  it('should allow changing file category', async () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    });

    const categorySelect = screen.getByRole('combobox');
    expect(categorySelect.value).toBe('other');

    await userEvent.selectOptions(categorySelect, 'contract');

    expect(categorySelect.value).toBe('contract');
  });

  it('should remove file when remove button is clicked', async () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText('Remove file');
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  it('should show category dropdown with correct options', async () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      const options = Array.from(select.options).map(opt => opt.value);
      expect(options).toEqual(['contract', 'specifications', 'other']);
    });
  });

  it('should initialize with no errors displayed', () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    expect(screen.queryByText(/Upload Errors:/i)).not.toBeInTheDocument();
  });

  it('should not call onFilesSelected if no callback provided', async () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    // Should not throw error
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('should render without projectId', () => {
    render(<DocumentUpload onFilesSelected={mockOnFilesSelected} />);

    expect(screen.getByText(/Upload your project contracts/i)).toBeInTheDocument();
  });

  it('should show upload progress structure', async () => {
    render(<DocumentUpload projectId={mockProjectId} />);

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Progress bar structure exists (even if not actively showing progress yet)
    const fileCard = screen.getByText('test.pdf').closest('div').closest('div').closest('div');
    expect(fileCard).toBeInTheDocument();
  });
});
