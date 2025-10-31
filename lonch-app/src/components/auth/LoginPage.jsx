import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import lonchLogo from '../../assets/lonch_logo.svg';

export default function LoginPage({ onSuccess, onSwitchToSignup }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Task 3.7 & 3.10: Email/password login with loading states
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Task 3.10: Error display
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  // Task 3.8: Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Task 3.11: Styling with lonch branding
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 min-h-[600px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src={lonchLogo} alt="lonch" className="h-16 mb-3" />
          <h1 className="text-2xl font-semibold text-gray-800">Welcome back</h1>
          <p className="text-gray-600 text-sm mt-1">Log in to continue to lonch</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Email/password form */}
        <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D9B9B]"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D9B9B]"
              disabled={loading}
            />
          </div>

          {/* Task 3.9: Forgot password placeholder link */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm text-[#2D9B9B] hover:text-[#247a7a] focus:outline-none focus:underline"
              onClick={() => alert('Password reset feature coming soon!')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D9B9B] text-white py-2 px-4 rounded-md font-medium hover:bg-[#247a7a] focus:outline-none focus:ring-2 focus:ring-[#2D9B9B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2D9B9B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Logging in...' : 'Log in with Google'}
        </button>

        {/* Task 3.12: Link to signup page */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-[#2D9B9B] hover:text-[#247a7a] font-medium focus:outline-none focus:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
