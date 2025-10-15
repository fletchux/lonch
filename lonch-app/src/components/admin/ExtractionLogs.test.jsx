import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExtractionLogs from './ExtractionLogs';

describe('ExtractionLogs', () => {
  const mockLogs = [
    {
      id: '1',
      documentName: 'contract.pdf',
      projectId: 'proj-1',
      projectName: 'Acme Project',
      timestamp: '2024-01-15T10:00:00Z',
      status: 'success',
      extractedFields: {
        projectName: 'Website Redesign',
        clientName: 'Acme Corp',
        budget: '$50,000'
      },
      rawResponse: '{"projectName": "Website Redesign", "clientName": "Acme Corp", "budget": "$50,000"}'
    },
    {
      id: '2',
      documentName: 'specs.docx',
      projectId: 'proj-2',
      projectName: 'Beta Project',
      timestamp: '2024-01-16T14:30:00Z',
      status: 'failed',
      extractedFields: null,
      error: 'Document parsing failed'
    },
    {
      id: '3',
      documentName: 'proposal.pdf',
      projectId: 'proj-1',
      projectName: 'Acme Project',
      timestamp: '2024-01-17T09:15:00Z',
      status: 'partial',
      extractedFields: {
        projectName: 'New Feature',
        clientName: null
      }
    }
  ];

  it('should show access denied message when user is not admin', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={false} />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/must be an administrator/i)).toBeInTheDocument();
  });

  it('should render successfully for admin users', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);
    expect(screen.getByText('Extraction Logs')).toBeInTheDocument();
  });

  it('should display all table headers', () => {
    const { container } = render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);
    const headers = container.querySelectorAll('th');
    const headerTexts = Array.from(headers).map(h => h.textContent);

    expect(headerTexts).toContain('Document');
    expect(headerTexts).toContain('Project');
    expect(headerTexts).toContain('Timestamp');
    expect(headerTexts).toContain('Status');
    expect(headerTexts).toContain('Fields Extracted');
    expect(headerTexts).toContain('Actions');
  });

  it('should display all logs in table', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);
    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.getByText('specs.docx')).toBeInTheDocument();
    expect(screen.getByText('proposal.pdf')).toBeInTheDocument();
  });

  it('should show empty state when no logs exist', () => {
    render(<ExtractionLogs logs={[]} isAdmin={true} />);
    expect(screen.getByText('No logs found')).toBeInTheDocument();
    expect(screen.getByText('No extraction logs available yet')).toBeInTheDocument();
  });

  it('should filter logs by status', () => {
    const { container } = render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    // Find the status select by its options
    const selects = container.querySelectorAll('select');
    const statusSelect = Array.from(selects).find(select =>
      select.querySelector('option[value="success"]')
    );

    fireEvent.change(statusSelect, { target: { value: 'success' } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.queryByText('specs.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('proposal.pdf')).not.toBeInTheDocument();
  });

  it('should filter logs by project', () => {
    const { container } = render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    // Find the project select (it will have project IDs as options)
    const selects = container.querySelectorAll('select');
    const projectSelect = Array.from(selects).find(select =>
      select.querySelector('option[value="proj-1"]')
    );

    fireEvent.change(projectSelect, { target: { value: 'proj-2' } });

    expect(screen.queryByText('contract.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('specs.docx')).toBeInTheDocument();
    expect(screen.queryByText('proposal.pdf')).not.toBeInTheDocument();
  });

  it('should filter logs by search query', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const searchInput = screen.getByPlaceholderText(/search by document or project/i);
    fireEvent.change(searchInput, { target: { value: 'contract' } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.queryByText('specs.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('proposal.pdf')).not.toBeInTheDocument();
  });

  it('should display log count', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);
    expect(screen.getByText('Showing 3 of 3 logs')).toBeInTheDocument();
  });

  it('should display correct field count', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);
    const fieldCounts = screen.getAllByText(/fields?$/);
    expect(fieldCounts.length).toBeGreaterThan(0);
  });

  it('should display status badges with correct text', () => {
    const { container } = render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);
    const badges = container.querySelectorAll('.rounded-full');
    const badgeTexts = Array.from(badges).map(b => b.textContent.trim());

    expect(badgeTexts).toContain('success');
    expect(badgeTexts).toContain('failed');
    expect(badgeTexts).toContain('partial');
  });

  it('should open detail modal when "View Details" is clicked', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    expect(screen.getByText('Extraction Log Details')).toBeInTheDocument();
    expect(screen.getByText('Document Information')).toBeInTheDocument();
  });

  it('should display extracted fields in detail modal', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    const allTexts = screen.getAllByText(/Website Redesign/);
    expect(allTexts.length).toBeGreaterThan(0);

    const acmeTexts = screen.getAllByText(/Acme Corp/);
    expect(acmeTexts.length).toBeGreaterThan(0);

    const budgetTexts = screen.getAllByText(/\$50,000/);
    expect(budgetTexts.length).toBeGreaterThan(0);
  });

  it('should display raw LLM response in detail modal', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    expect(screen.getByText('Raw LLM Response')).toBeInTheDocument();
  });

  it('should display error details when log has error', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[1]); // Click on failed log

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText('Document parsing failed')).toBeInTheDocument();
  });

  it('should close detail modal when close button is clicked', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    expect(screen.getByText('Extraction Log Details')).toBeInTheDocument();

    const closeButtons = screen.getAllByText('Close');
    fireEvent.click(closeButtons[0]);

    expect(screen.queryByText('Extraction Log Details')).not.toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);

    const xButton = screen.getByRole('button', { name: '' }).closest('button');
    if (xButton && xButton.querySelector('path[d*="M6 18L18 6"]')) {
      fireEvent.click(xButton);
      expect(screen.queryByText('Extraction Log Details')).not.toBeInTheDocument();
    }
  });

  it('should show empty state when filters return no results', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    const searchInput = screen.getByPlaceholderText(/search by document or project/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No logs found')).toBeInTheDocument();
    expect(screen.getByText('No logs match your current filters')).toBeInTheDocument();
  });

  it('should handle logs with minimal data', () => {
    const minimalLogs = [{
      id: '4',
      documentName: 'minimal.pdf',
      status: 'success'
    }];

    render(<ExtractionLogs logs={minimalLogs} isAdmin={true} />);
    expect(screen.getByText('minimal.pdf')).toBeInTheDocument();
  });

  it('should count extracted fields correctly', () => {
    render(<ExtractionLogs logs={mockLogs} isAdmin={true} />);

    // First log has 3 fields
    expect(screen.getByText('3 fields')).toBeInTheDocument();

    // Third log has 1 non-null field (projectName)
    expect(screen.getByText('1 fields')).toBeInTheDocument();
  });

  it('should display singular "log" for single log', () => {
    render(<ExtractionLogs logs={[mockLogs[0]]} isAdmin={true} />);
    expect(screen.getByText('Showing 1 of 1 log')).toBeInTheDocument();
  });
});
