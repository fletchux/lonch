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
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      updatePassword: vi.fn(),
      updateEmail: vi.fn(),
      deleteAccount: vi.fn(),
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

  it('should validate email format with Zod schema', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test123!@#' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should validate password requirements', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
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

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'NoNumbers!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NoNumbers!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
    });
  });

  it('should validate password contains uppercase letter', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'nouppercase123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'nouppercase123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
    });
  });

  it('should validate password contains lowercase letter', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'NOLOWERCASE123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NOLOWERCASE123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
    });
  });

  it('should validate password contains special character', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
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

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should call signup on valid form submission', async () => {
    mockSignup.mockResolvedValue({});

    render(<SignupPage onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'Password123!');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on signup failure', async () => {
    mockSignup.mockRejectedValue(new Error('Email already in use'));

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  it('should show loading state during signup', async () => {
    mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
    }, { timeout: 1000 });

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
    mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
    }, { timeout: 1000 });

    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(confirmPasswordInput).not.toBeDisabled();
    });
  });

  it('should have consistent modal size with login page', () => {
    const { container } = render(<SignupPage />);

    // Find the modal container (the card with rounded corners)
    const modalContainer = container.querySelector('.bg-card.rounded-lg.shadow-lg');

    expect(modalContainer).toBeInTheDocument();
    // Verify it has a minimum height class to prevent size jumping
    expect(modalContainer?.classList.toString()).toMatch(/min-h-/);
  });

  it('should normalize email to lowercase', async () => {
    mockSignup.mockResolvedValue({});

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up$/i });

    // Enter email with uppercase letters
    fireEvent.change(emailInput, { target: { value: 'TEST@EXAMPLE.COM' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Zod schema normalizes email to lowercase
      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'Password123!');
    });
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;

    // Inputs should have proper labels
    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');
    expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');

    // Submit to trigger validation errors
    const submitButton = screen.getByRole('button', { name: /sign up$/i });
    fireEvent.click(submitButton);

    // Wait for validation errors to appear
    waitFor(() => {
      // Error messages should have role="alert"
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
});
