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
      error: null,
      logout: vi.fn(),
      signup: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      updatePassword: vi.fn(),
      updateEmail: vi.fn(),
      deleteAccount: vi.fn(),
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

  it('should validate required fields with Zod schema', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];

    // Trigger validation by clicking submit with empty form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should validate email format with Zod schema', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login on valid form submission', async () => {
    mockLogin.mockResolvedValue({});

    render(<LoginPage onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];

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

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    // Delay the login to ensure we can see the loading state
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for the form to submit and loading state to appear
    await waitFor(() => {
      const loadingButtons = screen.queryAllByRole('button', { name: /logging in\.\.\./i });
      expect(loadingButtons.length).toBeGreaterThan(0);
    }, { timeout: 1000 });

    // Wait for loading to complete
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
    // Delay the login to ensure we can see the disabled state
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for the form to submit and inputs to be disabled
    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    }, { timeout: 1000 });

    // Wait for loading to complete and inputs to be re-enabled
    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });
  });

  it('should clear error when attempting new login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('First error'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];

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

  it('should have consistent modal size with signup page', () => {
    const { container } = render(<LoginPage />);

    // Find the modal container (the card with rounded corners)
    const modalContainer = container.querySelector('.bg-card.rounded-lg.shadow-lg');

    expect(modalContainer).toBeInTheDocument();
    // Verify it has a minimum height class to prevent size jumping
    expect(modalContainer?.classList.toString()).toMatch(/min-h-/);
  });

  it('should normalize email to lowercase', async () => {
    mockLogin.mockResolvedValue({});

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];

    // Enter email with uppercase letters
    fireEvent.change(emailInput, { target: { value: 'TEST@EXAMPLE.COM' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Zod schema normalizes email to lowercase
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    // Inputs should have proper labels
    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');

    // Submit to trigger validation errors
    const loginButtons = screen.getAllByRole('button', { name: /^log in$/i });
    const submitButton = loginButtons[0];
    fireEvent.click(submitButton);

    // Wait for validation errors to appear
    waitFor(() => {
      // Error messages should have role="alert"
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
});
