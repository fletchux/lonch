import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Lonch App', () => {
  it('renders the home page with welcome message', () => {
    render(<App />);
    expect(screen.getByText('Ready to lonch?')).toBeInTheDocument();
    expect(screen.getByText('Start your first client project with our template-driven approach')).toBeInTheDocument();
  });

  it('renders the Lonch branding', () => {
    render(<App />);
    expect(screen.getByAltText('Lonch')).toBeInTheDocument();
    expect(screen.getByText('Consultant project kickoff made simple')).toBeInTheDocument();
  });

  it('shows New Project button', () => {
    render(<App />);
    const buttons = screen.getAllByText('New Project');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('navigates to wizard when New Project is clicked', () => {
    render(<App />);
    const newProjectButton = screen.getAllByText('New Project')[0];

    fireEvent.click(newProjectButton);

    expect(screen.getByText('New Project Setup')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
  });

  it('wizard shows document upload in step 1', () => {
    render(<App />);
    const newProjectButton = screen.getAllByText('New Project')[0];
    fireEvent.click(newProjectButton);

    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
  });
});
