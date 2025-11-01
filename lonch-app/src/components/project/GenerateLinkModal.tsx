import { useState } from 'react';
import { generateInviteLink } from '../../services/inviteLinkService';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from './GroupBadge';
import { ROLES } from '../../utils/permissions';
import { GROUP } from '../../utils/groupPermissions';

interface GeneratedLink {
  url: string;
  role: typeof ROLES[keyof typeof ROLES];
  group: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
  expiresAt: Date | string;
  [key: string]: any;
}

interface GenerateLinkModalProps {
  projectId: string;
  onClose: () => void;
  onLinkGenerated?: (link: GeneratedLink) => void;
}

interface RoleOption {
  value: typeof ROLES[keyof typeof ROLES];
  label: string;
  description: string;
}

interface GroupOption {
  value: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
  label: string;
  description: string;
}

export default function GenerateLinkModal({ projectId, onClose, onLinkGenerated }: GenerateLinkModalProps) {
  const { currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[keyof typeof ROLES]>(ROLES.VIEWER);
  const [selectedGroup, setSelectedGroup] = useState<typeof GROUP.CONSULTING | typeof GROUP.CLIENT>(GROUP.CLIENT);
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const roles: RoleOption[] = [
    { value: ROLES.OWNER, label: 'Owner', description: 'Full project access and control' },
    { value: ROLES.ADMIN, label: 'Admin', description: 'Manage members and settings' },
    { value: ROLES.EDITOR, label: 'Editor', description: 'Edit project content' },
    { value: ROLES.VIEWER, label: 'Viewer', description: 'View-only access' }
  ];

  const groups: GroupOption[] = [
    { value: GROUP.CONSULTING, label: 'Consulting Group', description: 'Internal team members' },
    { value: GROUP.CLIENT, label: 'Client Group', description: 'Client representatives' }
  ];

  async function handleGenerateLink() {
    if (!currentUser) return;

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
      setError((err as Error).message || 'Failed to generate invite link');
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

  function formatExpirationDate(date: Date | string): string {
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
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Generate Shareable Invite Link</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
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
                <label htmlFor="role-select" className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as typeof ROLES[keyof typeof ROLES])}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Group
                </label>
                <div className="space-y-2">
                  {groups.map(group => (
                    <label
                      key={group.value}
                      className="flex items-center p-3 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors"
                    >
                      <input
                        type="radio"
                        name="group"
                        value={group.value}
                        checked={selectedGroup === group.value}
                        onChange={(e) => setSelectedGroup(e.target.value as typeof GROUP.CONSULTING | typeof GROUP.CLIENT)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                        data-testid={`group-radio-${group.value}`}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{group.label}</span>
                          <GroupBadge group={group.value} />
                        </div>
                        <span className="text-xs text-muted-foreground">{group.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-muted/30 rounded-md p-4 border border-border">
                <p className="text-sm font-medium text-foreground mb-2">Preview</p>
                <p className="text-sm text-muted-foreground">
                  Recipients will join as{' '}
                  <span className="inline-flex items-center gap-1">
                    <RoleBadge role={selectedRole} size="sm" />
                  </span>
                  {' '}in{' '}
                  <span className="inline-flex items-center gap-1">
                    <GroupBadge group={selectedGroup} />
                  </span>
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Generated Link Display */}
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Link generated successfully!</p>
                </div>

                <div>
                  <label htmlFor="generated-link" className="block text-sm font-medium text-foreground mb-2">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="generated-link"
                      type="text"
                      value={generatedLink.url}
                      readOnly
                      className="flex-1 px-3 py-2 border border-input rounded-md bg-muted/30 text-sm text-foreground"
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

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Link Details</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Role:</span>{' '}
                      <RoleBadge role={generatedLink.role} size="sm" />
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Group:</span>{' '}
                      <GroupBadge group={generatedLink.group} />
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Expires:</span>{' '}
                      {formatExpirationDate(generatedLink.expiresAt)}
                    </p>
                    <p className="text-xs italic">
                      This link will expire in 7 days
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                  <p className="text-xs text-foreground">
                    <strong>Note:</strong> This link is single-use. Once someone accepts it, the link will become invalid.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          {!generatedLink ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-foreground hover:bg-accent rounded-md transition-colors border border-border"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="generate-button"
              >
                {loading ? 'Generating...' : 'Generate Link'}
              </button>
            </>
          ) : (
            <button
              onClick={handleDone}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
