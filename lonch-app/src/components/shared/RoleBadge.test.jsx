import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBadge from './RoleBadge';
import { ROLES } from '../../utils/permissions';

describe('RoleBadge', () => {
  it('should render owner badge with teal color', () => {
    render(<RoleBadge role={ROLES.OWNER} />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveTextContent('Owner');
    expect(badge).toHaveClass('bg-teal-100', 'text-teal-800');
  });

  it('should render admin badge with yellow color', () => {
    render(<RoleBadge role={ROLES.ADMIN} />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveTextContent('Admin');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should render editor badge with blue color', () => {
    render(<RoleBadge role={ROLES.EDITOR} />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveTextContent('Editor');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should render viewer badge with gray color', () => {
    render(<RoleBadge role={ROLES.VIEWER} />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveTextContent('Viewer');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should render small size by default', () => {
    render(<RoleBadge role={ROLES.OWNER} />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
  });

  it('should render extra small size', () => {
    render(<RoleBadge role={ROLES.OWNER} size="xs" />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
  });

  it('should render medium size', () => {
    render(<RoleBadge role={ROLES.OWNER} size="md" />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveClass('px-2.5', 'py-1.5', 'text-sm');
  });

  it('should render large size', () => {
    render(<RoleBadge role={ROLES.OWNER} size="lg" />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveClass('px-3', 'py-2', 'text-base');
  });

  it('should include role data attribute', () => {
    render(<RoleBadge role={ROLES.EDITOR} />);
    const badge = screen.getByTestId('role-badge');
    expect(badge).toHaveAttribute('data-role', ROLES.EDITOR);
  });
});
