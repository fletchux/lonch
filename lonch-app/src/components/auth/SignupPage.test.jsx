import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from './SignupPage';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext');

describe('SignupPage', () => {
  const mockSignup = vi.fn();
  const mockLoginWithGoogle = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      signup: mockSignup,
      loginWithGoogle: mockLoginWithGoogle,
      currentUser: null,
      loading: false,
      error: null
    });
  });

  it('should render signup form with all fields', () => {
    render(<SignupPage />);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
  });

  it('should display lonch logo and branding', () => {
    render(<SignupPage />);

    expect(screen.getByAltText('lonch')).toBeInTheDocument();
    expect(screen.getByText('Start managing your projects with lonch')).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should validate password requirements', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    // Test too short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('should validate password contains number', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'NoNumbers!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NoNumbers!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
    });
  });

  it('should validate password contains special character', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'NoSpecial123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NoSpecial123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one special character')).toBeInTheDocument();
    });
  });

  it('should validate passwords match', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should call signup on valid form submission', async () => {
    mockSignup.mockResolvedValue({});

    render(<SignupPage onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'Test123!@#');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on signup failure', async () => {
    mockSignup.mockRejectedValue(new Error('Email already in use'));

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  it('should show loading state during signup', async () => {
    mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123!@#' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign up$/i })).toBeInTheDocument();
    });
  });

  it('should call loginWithGoogle when Google button is clicked', async () => {
    mockLoginWithGoogle.mockResolvedValue({});

    render(<SignupPage onSuccess={mockOnSuccess} />);

    const googleButton = screen.getByRole('button', { name: /sign up with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error on Google signup failure', async () => {
    mockLoginWithGoogle.mockRejectedValue(new Error('Popup closed'));

    render(<SignupPage />);

    const googleButton = screen.getByRole('button', { name: /sign up with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Popup closed')).toBeInTheDocument();
    });
  });

  it('should show link to login page', () => {
    render(<SignupPage onSwitchToLogin={mockOnSwitchToLogin} />);

    const loginLink = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it('should disable inputs during loading', async () => {
    mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123!@#' } });
    fireEvent.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();

    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
    });
  });
});
