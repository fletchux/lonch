import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroupBadge from './GroupBadge';
import { GROUP } from '../../utils/groupPermissions';

describe('GroupBadge', () => {
  it('should render Consulting badge with teal colors', () => {
    render(<GroupBadge group={GROUP.CONSULTING} />);
    const badge = screen.getByTestId('group-badge');
    expect(badge).toHaveTextContent('Consulting');
    expect(badge).toHaveClass('bg-teal-100', 'text-teal-800');
  });

  it('should render Client badge with gold colors', () => {
    render(<GroupBadge group={GROUP.CLIENT} />);
    const badge = screen.getByTestId('group-badge');
    expect(badge).toHaveTextContent('Client');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should apply custom className', () => {
    render(<GroupBadge group={GROUP.CONSULTING} className="ml-2" />);
    const badge = screen.getByTestId('group-badge');
    expect(badge).toHaveClass('ml-2');
  });

  it('should have proper badge styling', () => {
    render(<GroupBadge group={GROUP.CLIENT} />);
    const badge = screen.getByTestId('group-badge');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'text-xs', 'font-medium');
  });
});
