import { useState } from 'react';
import PropTypes from 'prop-types';
import { generateInviteLink } from '../../services/inviteLinkService';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from './GroupBadge';

export default function GenerateLinkModal({ projectId, onClose, onLinkGenerated }) {
  const { currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [selectedGroup, setSelectedGroup] = useState('client');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const roles = [
    { value: 'owner', label: 'Owner', description: 'Full project access and control' },
    { value: 'admin', label: 'Admin', description: 'Manage members and settings' },
    { value: 'editor', label: 'Editor', description: 'Edit project content' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access' }
  ];

  const groups = [
    { value: 'consulting', label: 'Consulting Group', description: 'Internal team members' },
    { value: 'client', label: 'Client Group', description: 'Client representatives' }
  ];

  async function handleGenerateLink() {
    setError(null);
    setLoading(true);

    try {
      const link = await generateInviteLink(
        projectId,
        selectedRole,
        selectedGroup,
        currentUser.uid
      );

      setGeneratedLink(link);
      // Don't call onLinkGenerated here - let user see and copy the link first
    } catch (err) {
      console.error('Error generating invite link:', err);
      setError(err.message || 'Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    // Call onLinkGenerated when user clicks Done (to refresh the links list)
    if (onLinkGenerated && generatedLink) {
      onLinkGenerated(generatedLink);
    }
    onClose();
  }

  async function handleCopyLink() {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setError('Failed to copy link to clipboard');
    }
  }

  function formatExpirationDate(date) {
    const expirationDate = date instanceof Date ? date : new Date(date);
    return expirationDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Generate Shareable Invite Link</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {!generatedLink ? (
            <>
              {/* Role Selection */}
              <div>
                <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  data-testid="role-select"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group
                </label>
                <div className="space-y-2">
                  {groups.map(group => (
                    <label
                      key={group.value}
                      className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="group"
                        value={group.value}
                        checked={selectedGroup === group.value}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        data-testid={`group-radio-${group.value}`}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{group.label}</span>
                          <GroupBadge group={group.value} size="sm" />
                        </div>
                        <span className="text-xs text-gray-500">{group.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                <p className="text-sm text-gray-600">
                  Recipients will join as{' '}
                  <span className="inline-flex items-center gap-1">
                    <RoleBadge role={selectedRole} size="sm" />
                  </span>
                  {' '}in{' '}
                  <span className="inline-flex items-center gap-1">
                    <GroupBadge group={selectedGroup} size="sm" />
                  </span>
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Generated Link Display */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-700 font-medium">✓ Link generated successfully!</p>
                </div>

                <div>
                  <label htmlFor="generated-link" className="block text-sm font-medium text-gray-700 mb-2">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="generated-link"
                      type="text"
                      value={generatedLink.url}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      data-testid="generated-link-input"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-[#DBA507] text-white rounded-md hover:bg-[#c49406] transition-colors"
                      data-testid="copy-link-button"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-900">Link Details</p>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      <span className="font-medium">Role:</span>{' '}
                      <RoleBadge role={generatedLink.role} size="sm" />
                    </p>
                    <p>
                      <span className="font-medium">Group:</span>{' '}
                      <GroupBadge group={generatedLink.group} size="sm" />
                    </p>
                    <p>
                      <span className="font-medium">Expires:</span>{' '}
                      {formatExpirationDate(generatedLink.expiresAt)}
                    </p>
                    <p className="text-xs text-blue-600 italic">
                      This link will expire in 7 days
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-700">
                    <strong>Note:</strong> This link is single-use. Once someone accepts it, the link will become invalid.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {!generatedLink ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="px-6 py-2 bg-[#2D9B9B] text-white rounded-md hover:bg-[#267d7d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="generate-button"
              >
                {loading ? 'Generating...' : 'Generate Link'}
              </button>
            </>
          ) : (
            <button
              onClick={handleDone}
              className="px-6 py-2 bg-[#2D9B9B] text-white rounded-md hover:bg-[#267d7d] transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

GenerateLinkModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onLinkGenerated: PropTypes.func
};
