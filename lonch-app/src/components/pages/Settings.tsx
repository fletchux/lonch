import Header from '../layout/Header';
import NotificationPreferences from '../settings/NotificationPreferences';

interface SettingsProps {
  onNavigateHome: () => void;
}

/**
 * Settings Page
 *
 * User settings page with tabs for different settings categories.
 * Currently includes notification preferences.
 */
export default function Settings({ onNavigateHome }: SettingsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <button
              onClick={onNavigateHome}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              ← Back to Home
            </button>
          </div>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Notification Preferences Section */}
          <NotificationPreferences />

          {/* Future sections can be added here */}
          {/* <ProfileSettings /> */}
          {/* <PrivacySettings /> */}
          {/* <SecuritySettings /> */}
        </div>
      </div>
    </div>
  );
}
