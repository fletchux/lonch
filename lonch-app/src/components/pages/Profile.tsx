import Header from '../layout/Header';
import ProfileSettings from '../settings/ProfileSettings';

interface ProfileProps {
  onNavigateHome: () => void;
  onNavigateSettings?: () => void;
}

/**
 * Profile Page
 *
 * Dedicated page for viewing user profile information.
 * Read-only display of user details.
 */
export default function Profile({ onNavigateHome, onNavigateSettings }: ProfileProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigateProfile={() => {}} onNavigateSettings={onNavigateSettings} />

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <button
              onClick={onNavigateHome}
              className="text-sm text-primary hover:opacity-90 font-medium"
            >
              ← Back to Home
            </button>
          </div>
          <p className="text-muted-foreground">View your profile information</p>
        </div>

        {/* Profile Content */}
        <ProfileSettings />
      </div>
    </div>
  );
}
