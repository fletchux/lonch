import { useState, useEffect } from 'react';
import { getUserNotificationPreferences, updateNotificationPreferences } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationPrefs {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  notifyOnInvitation: boolean;
  notifyOnRoleChange: boolean;
  notifyOnGroupChange: boolean;
  notifyOnMention: boolean;
  [key: string]: boolean;
}

/**
 * NotificationPreferences Component
 *
 * Allows users to configure their notification preferences for different event types.
 * Controls both in-app and email notifications.
 */
export default function NotificationPreferences() {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function fetchPreferences() {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const prefs = await getUserNotificationPreferences(currentUser.uid);
      setPreferences(prefs);
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!currentUser || !preferences) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateNotificationPreferences(currentUser.uid, preferences);

      setSuccessMessage('Notification preferences saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleToggle(field: keyof NotificationPrefs) {
    setPreferences(prev => prev ? ({
      ...prev,
      [field]: !prev[field]
    }) : null);
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading notification preferences...</p>
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-red-600 dark:text-red-400">Error loading preferences: {error}</p>
        <button
          onClick={fetchPreferences}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800" data-testid="error-message">
          {error}
        </div>
      )}

      {/* Global Notification Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">In-App Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications within the application</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.inAppNotifications}
                onChange={() => handleToggle('inAppNotifications')}
                className="sr-only peer"
                data-testid="toggle-inAppNotifications"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only peer"
                data-testid="toggle-emailNotifications"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Type Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Project Invitations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">When you're invited to a project</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifyOnInvitation}
                onChange={() => handleToggle('notifyOnInvitation')}
                disabled={!preferences.inAppNotifications && !preferences.emailNotifications}
                className="sr-only peer disabled:opacity-50"
                data-testid="toggle-notifyOnInvitation"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:bg-gray-300 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Role Changes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">When your role in a project changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifyOnRoleChange}
                onChange={() => handleToggle('notifyOnRoleChange')}
                disabled={!preferences.inAppNotifications && !preferences.emailNotifications}
                className="sr-only peer disabled:opacity-50"
                data-testid="toggle-notifyOnRoleChange"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:bg-gray-300 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Group Changes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">When you're moved between Consulting and Client groups</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifyOnGroupChange}
                onChange={() => handleToggle('notifyOnGroupChange')}
                disabled={!preferences.inAppNotifications && !preferences.emailNotifications}
                className="sr-only peer disabled:opacity-50"
                data-testid="toggle-notifyOnGroupChange"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:bg-gray-300 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Mentions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">When someone mentions you (future feature)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifyOnMention}
                onChange={() => handleToggle('notifyOnMention')}
                disabled={!preferences.inAppNotifications && !preferences.emailNotifications}
                className="sr-only peer disabled:opacity-50"
                data-testid="toggle-notifyOnMention"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:bg-gray-300 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Disabled State Warning */}
      {!preferences.inAppNotifications && !preferences.emailNotifications && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <p className="text-sm">
            <strong>Note:</strong> All notifications are currently disabled. Enable at least one notification channel above to receive alerts.
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          data-testid="save-button"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
