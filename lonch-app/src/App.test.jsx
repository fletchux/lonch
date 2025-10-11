import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app with heading', () => {
    render(<App />);
    expect(screen.getByText('Vite + React')).toBeInTheDocument();
  });

  it('displays initial count as 0', () => {
    render(<App />);
    expect(screen.getByRole('button')).toHaveTextContent('count is 0');
  });

  it('increments count when button is clicked', () => {
    render(<App />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button).toHaveTextContent('count is 1');

    fireEvent.click(button);
    expect(button).toHaveTextContent('count is 2');
  });

  it('renders Vite and React logos', () => {
    render(<App />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'Vite logo');
    expect(images[1]).toHaveAttribute('alt', 'React logo');
  });
});
