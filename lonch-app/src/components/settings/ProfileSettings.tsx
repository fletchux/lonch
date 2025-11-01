import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUser, UserData } from '../../services/userService';

/**
 * ProfileSettings Component
 *
 * Displays user profile information in a read-only format.
 * Shows email, display name, auth provider, and account creation date.
 */
export default function ProfileSettings() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function fetchUserData() {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getUser(currentUser.uid);
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp: any): string {
    if (!timestamp) return 'Unknown';

    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getAuthProviderLabel(provider: string): string {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'email':
        return 'Email & Password';
      default:
        return provider;
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
        <p className="text-red-600">Error loading profile: {error}</p>
        <button
          onClick={fetchUserData}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!userData || !currentUser) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

      {/* Profile Photo */}
      <div className="mb-6 flex items-center gap-4">
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={userData.displayName}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center border-2 border-gray-200">
            <span className="text-2xl font-semibold text-teal-700">
              {userData.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{userData.displayName}</h3>
          <p className="text-sm text-gray-500">Lonch User</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        {/* Email */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <p className="text-gray-900">{userData.email}</p>
        </div>

        {/* Display Name */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <p className="text-gray-900">{userData.displayName}</p>
        </div>

        {/* Auth Provider */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Authentication Method
          </label>
          <p className="text-gray-900">{getAuthProviderLabel(userData.authProvider)}</p>
        </div>

        {/* Account Created */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member Since
          </label>
          <p className="text-gray-900">{formatDate(userData.createdAt)}</p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Profile editing is not currently available. Contact support if you need to update your information.
        </p>
      </div>
    </div>
  );
}
