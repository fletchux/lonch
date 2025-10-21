import { useState, useEffect } from 'prop-types';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { getUserNotificationPreferences, updateNotificationPreferences } from '../../services/notificationService';

export default function NotificationPreferences() {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function fetchPreferences() {
    try {
      setLoading(true);
      setError(null);
      const userPreferences = await getUserNotificationPreferences(currentUser.uid);
      setPreferences(userPreferences);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      await updateNotificationPreferences(currentUser.uid, preferences);

      setSuccessMessage('Notification preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleToggle(field, value) {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function handleNotificationTypeToggle(type, value) {
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: value
      }
    }));
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-8">Loading notification preferences...</div>
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Notification Channels */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
          <div className="space-y-3">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                id="email-notifications"
                checked={preferences?.emailNotifications ?? true}
                onChange={(e) => handleToggle('emailNotifications', e.target.checked)}
                className="h-5 w-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                data-testid="email-notifications-toggle"
              />
            </div>

            {/* In-App Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="inapp-notifications" className="text-sm font-medium text-gray-700">
                  In-App Notifications
                </label>
                <p className="text-xs text-gray-500">Receive notifications in the notification center</p>
              </div>
              <input
                type="checkbox"
                id="inapp-notifications"
                checked={preferences?.inAppNotifications ?? true}
                onChange={(e) => handleToggle('inAppNotifications', e.target.checked)}
                className="h-5 w-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                data-testid="inapp-notifications-toggle"
              />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-3">
            {/* Invitations */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="invitations-notifications" className="text-sm font-medium text-gray-700">
                  Project Invitations
                </label>
                <p className="text-xs text-gray-500">Get notified when invited to projects</p>
              </div>
              <input
                type="checkbox"
                id="invitations-notifications"
                checked={preferences?.notificationTypes?.invitations ?? true}
                onChange={(e) => handleNotificationTypeToggle('invitations', e.target.checked)}
                className="h-5 w-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                data-testid="invitations-notifications-toggle"
              />
            </div>

            {/* Role Changes */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="role-changes-notifications" className="text-sm font-medium text-gray-700">
                  Role Changes
                </label>
                <p className="text-xs text-gray-500">Get notified when your role is changed</p>
              </div>
              <input
                type="checkbox"
                id="role-changes-notifications"
                checked={preferences?.notificationTypes?.roleChanges ?? true}
                onChange={(e) => handleNotificationTypeToggle('roleChanges', e.target.checked)}
                className="h-5 w-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                data-testid="role-changes-notifications-toggle"
              />
            </div>

            {/* Group Changes */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="group-changes-notifications" className="text-sm font-medium text-gray-700">
                  Group Changes
                </label>
                <p className="text-xs text-gray-500">Get notified when moved between groups</p>
              </div>
              <input
                type="checkbox"
                id="group-changes-notifications"
                checked={preferences?.notificationTypes?.groupChanges ?? true}
                onChange={(e) => handleNotificationTypeToggle('groupChanges', e.target.checked)}
                className="h-5 w-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                data-testid="group-changes-notifications-toggle"
              />
            </div>

            {/* Mentions (future feature) */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md opacity-50">
              <div>
                <label htmlFor="mentions-notifications" className="text-sm font-medium text-gray-700">
                  Mentions
                </label>
                <p className="text-xs text-gray-500">Get notified when mentioned (coming soon)</p>
              </div>
              <input
                type="checkbox"
                id="mentions-notifications"
                checked={preferences?.notificationTypes?.mentions ?? true}
                onChange={(e) => handleNotificationTypeToggle('mentions', e.target.checked)}
                disabled
                className="h-5 w-5 text-gray-400 rounded cursor-not-allowed"
                data-testid="mentions-notifications-toggle"
              />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm" data-testid="success-message">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm" data-testid="error-message">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-preferences-button"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

NotificationPreferences.propTypes = {};
