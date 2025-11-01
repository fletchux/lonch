import Header from '../layout/Header';
import NotificationPreferences from '../settings/NotificationPreferences';

interface SettingsProps {
  onNavigateHome: () => void;
  onNavigateProfile?: () => void;
}

/**
 * Settings Page
 *
 * User settings page for preferences and configurations.
 * Includes notification preferences, and future: billing, privacy, security.
 */
export default function Settings({ onNavigateHome, onNavigateProfile }: SettingsProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigateProfile={onNavigateProfile} onNavigateSettings={() => {}} />

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <button
              onClick={onNavigateHome}
              className="text-sm text-primary hover:opacity-90 font-medium"
            >
              ← Back to Home
            </button>
          </div>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Notification Preferences Section */}
          <NotificationPreferences />

          {/* Future sections can be added here */}
          {/* <BillingSettings /> */}
          {/* <PrivacySettings /> */}
          {/* <SecuritySettings /> */}
        </div>
      </div>
    </div>
  );
}
