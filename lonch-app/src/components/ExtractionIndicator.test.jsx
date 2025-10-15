import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExtractionIndicator from './ExtractionIndicator';

describe('ExtractionIndicator', () => {
  it('should render successfully', () => {
    const { container } = render(<ExtractionIndicator />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('should show document icon for normal extraction', () => {
    const { container } = render(<ExtractionIndicator source="contract.pdf" />);
    // Check for document/mail icon SVG
    const icon = container.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('should show warning icon when hasConflict is true', () => {
    const { container } = render(<ExtractionIndicator source="contract.pdf" hasConflict={true} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeTruthy();
    // The warning icon has a different path structure
    expect(icon.querySelector('path[fill-rule="evenodd"]')).toBeTruthy();
  });

  it('should show tooltip on hover with source information', async () => {
    const user = userEvent.setup();
    const { container } = render(<ExtractionIndicator source="contract.pdf" />);

    const indicator = container.querySelector('[class*="inline-flex"]');
    expect(indicator).toBeTruthy();

    // Hover over the indicator
    await user.hover(indicator);

    // Wait for tooltip to appear
    const tooltip = container.querySelector('[class*="bg-gray-900"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain('Auto-populated from documents');
    expect(tooltip.textContent).toContain('contract.pdf');
  });

  it('should show conflict message in tooltip when hasConflict is true', async () => {
    const user = userEvent.setup();
    const { container } = render(<ExtractionIndicator source="contract.pdf" hasConflict={true} />);

    const indicator = container.querySelector('[class*="inline-flex"]');
    await user.hover(indicator);

    const tooltip = container.querySelector('[class*="bg-gray-900"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain('Multiple values found');
    expect(tooltip.textContent).toContain('conflicting data');
  });

  it('should hide tooltip on mouse leave', async () => {
    const user = userEvent.setup();
    const { container } = render(<ExtractionIndicator source="contract.pdf" />);

    const indicator = container.querySelector('[class*="inline-flex"]');

    // Hover to show tooltip
    await user.hover(indicator);
    let tooltip = container.querySelector('[class*="bg-gray-900"]');
    expect(tooltip).toBeTruthy();

    // Unhover to hide tooltip
    await user.unhover(indicator);
    tooltip = container.querySelector('[class*="bg-gray-900"]');
    expect(tooltip).toBeFalsy();
  });

  it('should apply correct styling for normal extraction', () => {
    const { container } = render(<ExtractionIndicator source="contract.pdf" />);

    const iconContainer = container.querySelector('[class*="bg-primary"]');
    expect(iconContainer).toBeTruthy();
  });

  it('should apply correct styling for conflict', () => {
    const { container } = render(<ExtractionIndicator source="contract.pdf" hasConflict={true} />);

    const iconContainer = container.querySelector('[class*="bg-amber"]');
    expect(iconContainer).toBeTruthy();
  });

  it('should work without source prop', async () => {
    const user = userEvent.setup();
    const { container } = render(<ExtractionIndicator />);

    const indicator = container.querySelector('[class*="inline-flex"]');
    await user.hover(indicator);

    const tooltip = container.querySelector('[class*="bg-gray-900"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain('Auto-populated from documents');
  });
});
