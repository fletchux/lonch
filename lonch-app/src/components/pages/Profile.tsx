import Header from '../layout/Header';
import ProfileSettings from '../settings/ProfileSettings';

interface ProfileProps {
  onNavigateHome: () => void;
}

/**
 * Profile Page
 *
 * Dedicated page for viewing user profile information.
 * Read-only display of user details.
 */
export default function Profile({ onNavigateHome }: ProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onNavigateProfile={() => {}} />

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
            <button
              onClick={onNavigateHome}
              className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
            >
              ← Back to Home
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">View your profile information</p>
        </div>

        {/* Profile Content */}
        <ProfileSettings />
      </div>
    </div>
  );
}
