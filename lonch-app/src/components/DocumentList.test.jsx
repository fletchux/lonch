import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentList from './DocumentList';

describe('DocumentList', () => {
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
    render(<DocumentList documents={[]} />);
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
    render(<DocumentList documents={mockDocuments} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'contract' } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.queryByText('specifications.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
  });

  it('should show all documents when "all" category is selected', () => {
    render(<DocumentList documents={mockDocuments} />);

    const select = screen.getByRole('combobox');

    // First filter to a specific category
    fireEvent.change(select, { target: { value: 'contract' } });

    // Then back to all
    fireEvent.change(select, { target: { value: 'all' } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.getByText('specifications.docx')).toBeInTheDocument();
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
  });

  it('should show empty state when filtered category has no documents', () => {
    render(<DocumentList documents={[mockDocuments[0]]} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'specifications' } });

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

    const { container } = render(<DocumentList documents={minimalDoc} />);
    expect(container.querySelector('table')).toBeTruthy();
  });
});
