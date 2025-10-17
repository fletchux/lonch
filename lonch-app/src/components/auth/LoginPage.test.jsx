import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext');

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockLoginWithGoogle = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      currentUser: null,
      loading: false,
      error: null
    });
  });

  it('should render login form with all fields', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    const loginButtons = screen.getAllByRole('button', { name: /log in/i });
    expect(loginButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /log in with google/i })).toBeInTheDocument();
  });

  it('should display lonch logo and branding', () => {
    render(<LoginPage />);

    expect(screen.getByAltText('lonch')).toBeInTheDocument();
    expect(screen.getByText('Log in to continue to lonch')).toBeInTheDocument();
  });

  it('should display forgot password link', () => {
    render(<LoginPage />);

    const forgotPasswordLink = screen.getByRole('button', { name: /forgot password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<LoginPage />);

    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0]; // First button is the form submit button
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter your email and password')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login on valid form submission', async () => {
    mockLogin.mockResolvedValue({});

    render(<LoginPage onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0]; // First button is the form submit button

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0]; // First button is the form submit button

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0]; // First button is the form submit button

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Both the submit button and Google button show "Logging in..." during loading
    const loadingButtons = screen.getAllByRole('button', { name: /logging in\.\.\./i });
    expect(loadingButtons.length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
    });
  });

  it('should call loginWithGoogle when Google button is clicked', async () => {
    mockLoginWithGoogle.mockResolvedValue({});

    render(<LoginPage onSuccess={mockOnSuccess} />);

    const googleButton = screen.getByRole('button', { name: /log in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error on Google login failure', async () => {
    mockLoginWithGoogle.mockRejectedValue(new Error('Popup closed by user'));

    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: /log in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Popup closed by user')).toBeInTheDocument();
    });
  });

  it('should show link to signup page', () => {
    render(<LoginPage onSwitchToSignup={mockOnSwitchToSignup} />);

    const signupLink = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupLink);

    expect(mockOnSwitchToSignup).toHaveBeenCalled();
  });

  it('should disable inputs during loading', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0]; // First button is the form submit button

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
    });
  });

  it('should clear error when attempting new login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('First error'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0]; // First button is the form submit button

    // First attempt with error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second attempt should clear previous error
    mockLogin.mockResolvedValue({});
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });

  it('should show Google logo in OAuth button', () => {
    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: /log in with google/i });
    const svg = googleButton.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });
});
