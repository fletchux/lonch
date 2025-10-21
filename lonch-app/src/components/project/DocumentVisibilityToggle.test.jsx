import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentVisibilityToggle from './DocumentVisibilityToggle';
import { VISIBILITY } from '../../utils/groupPermissions';

describe('DocumentVisibilityToggle', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with consulting_only visibility', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.CONSULTING_ONLY}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    expect(select).toHaveValue(VISIBILITY.CONSULTING_ONLY);
    expect(select).toHaveClass('bg-teal-50', 'text-teal-800');
  });

  it('should render with client_only visibility', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.CLIENT_ONLY}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    expect(select).toHaveValue(VISIBILITY.CLIENT_ONLY);
    expect(select).toHaveClass('bg-yellow-50', 'text-yellow-800');
  });

  it('should render with both visibility', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    expect(select).toHaveValue(VISIBILITY.BOTH);
    expect(select).toHaveClass('bg-gray-50', 'text-gray-800');
  });

  it('should call onChange when visibility is changed', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    fireEvent.change(select, { target: { value: VISIBILITY.CONSULTING_ONLY } });

    expect(mockOnChange).toHaveBeenCalledWith(VISIBILITY.CONSULTING_ONLY);
  });

  it('should display all three visibility options', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    const options = select.querySelectorAll('option');

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue(VISIBILITY.CONSULTING_ONLY);
    expect(options[1]).toHaveValue(VISIBILITY.CLIENT_ONLY);
    expect(options[2]).toHaveValue(VISIBILITY.BOTH);
  });

  it('should show lock icon for consulting_only in option text', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.CONSULTING_ONLY}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    const option = Array.from(select.querySelectorAll('option')).find(
      opt => opt.value === VISIBILITY.CONSULTING_ONLY
    );

    expect(option.textContent).toContain('🔒');
    expect(option.textContent).toContain('Consulting Only');
  });

  it('should show lock icon for client_only in option text', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.CLIENT_ONLY}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    const option = Array.from(select.querySelectorAll('option')).find(
      opt => opt.value === VISIBILITY.CLIENT_ONLY
    );

    expect(option.textContent).toContain('🔒');
    expect(option.textContent).toContain('Client Only');
  });

  it('should show globe icon for both in option text', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    const option = Array.from(select.querySelectorAll('option')).find(
      opt => opt.value === VISIBILITY.BOTH
    );

    expect(option.textContent).toContain('🌐');
    expect(option.textContent).toContain('Both Groups');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const select = screen.getByTestId('visibility-select');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should show disabled overlay when disabled', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const container = screen.getByTestId('visibility-toggle');
    const overlay = container.querySelector('div.absolute.inset-0');

    expect(overlay).toBeInTheDocument();
  });

  it('should support small size variant', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
        size="sm"
      />
    );

    const select = screen.getByTestId('visibility-select');
    expect(select).toHaveClass('text-xs', 'px-2', 'py-1');
  });

  it('should support medium size variant (default)', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('visibility-select');
    expect(select).toHaveClass('text-sm', 'px-3', 'py-1.5');
  });

  it('should support large size variant', () => {
    render(
      <DocumentVisibilityToggle
        visibility={VISIBILITY.BOTH}
        onChange={mockOnChange}
        size="lg"
      />
    );

    const select = screen.getByTestId('visibility-select');
    expect(select).toHaveClass('text-base', 'px-4', 'py-2');
  });
});
