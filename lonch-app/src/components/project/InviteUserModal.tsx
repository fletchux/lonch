import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInvitation } from '../../services/invitationService';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { getRoleDisplayName } from '../../utils/permissions';
import { GROUP } from '../../utils/groupPermissions';
import { logActivity } from '../../services/activityLogService';
import { inviteUserSchema, type InviteUserFormData } from '@/lib/validations';

interface Invitation {
  id: string;
  token: string;
  email: string;
  role: string;
  group?: string;
}

interface InviteUserModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (invitation: Invitation) => void;
}

export default function InviteUserModal({ projectId, isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const { currentUser } = useAuth();
  const permissions = useProjectPermissions(projectId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [invitedUser, setInvitedUser] = useState<{ email: string; role: string; group: string } | null>(null);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      role: 'viewer',
      group: GROUP.CLIENT,
    },
  });

  const selectedGroup = watch('group');

  // Handle form submission
  const handleInvite = async (data: InviteUserFormData) => {
    // Validate group permissions (Task 3.3)
    // Only Owner/Admin can invite to Consulting Group
    if (data.group === GROUP.CONSULTING && !permissions.canMoveUserBetweenGroups()) {
      setError('Only Owner and Admin can invite users to the Consulting Group');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invitation = await createInvitation(
        projectId,
        data.email,
        data.role,
        currentUser!.uid,
        data.group
      );

      // Log the activity
      try {
        await logActivity(
          projectId,
          currentUser!.uid,
          'member_invited',
          'member',
          invitation.id,
          {
            invitedEmail: data.email,
            invitedRole: data.role,
            invitedGroup: data.group,
            invitationId: invitation.id
          },
          data.group
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
        // Don't fail the operation if logging fails
      }

      // Generate shareable invite link
      const link = `${window.location.origin}/invite/${invitation.token}`;
      setInviteLink(link);
      setInvitedUser({ email: data.email, role: data.role, group: data.group });

      // Call success callback
      if (onSuccess) {
        onSuccess(invitation);
      }
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  function handleClose() {
    reset();
    setError(null);
    setInviteLink(null);
    setInvitedUser(null);
    onClose();
  }

  function getGroupDisplayName(groupValue: string): string {
    return groupValue === GROUP.CONSULTING ? 'Consulting Group' : 'Client Group';
  }

  function copyInviteLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        {inviteLink && invitedUser ? (
          // Success state with invite link
          <>
            <h3 className="text-lg font-semibold text-foreground mb-4">Invitation Sent!</h3>
            <p className="text-muted-foreground mb-4">
              Invitation sent to <strong>{invitedUser.email}</strong> as <strong>{getRoleDisplayName(invitedUser.role)}</strong> in the <strong>{getGroupDisplayName(invitedUser.group)}</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Shareable Invite Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-input rounded-lg bg-muted text-sm text-foreground"
                  data-testid="invite-link"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  data-testid="copy-link-button"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          // Invitation form
          <>
            <h3 className="text-lg font-semibold text-foreground mb-4">Invite User to Project</h3>
            <form onSubmit={handleSubmit(handleInvite)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  data-testid="email-input"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-invalid={errors.role ? 'true' : 'false'}
                  data-testid="role-select"
                  {...register('role')}
                >
                  {permissions.assignableRoles.map(r => (
                    <option key={r} value={r}>
                      {getRoleDisplayName(r)}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-destructive" role="alert">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="group" className="block text-sm font-medium text-foreground mb-2">
                  Group
                </label>
                <select
                  id="group"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-invalid={errors.group ? 'true' : 'false'}
                  data-testid="group-select"
                  {...register('group')}
                >
                  <option value={GROUP.CLIENT}>Client Group</option>
                  <option value={GROUP.CONSULTING}>Consulting Group</option>
                </select>
                {errors.group && (
                  <p className="mt-1 text-sm text-destructive" role="alert">
                    {errors.group.message}
                  </p>
                )}
                {selectedGroup === GROUP.CONSULTING && !permissions.canMoveUserBetweenGroups() && (
                  <p className="mt-2 text-sm text-amber-600">
                    Only Owner and Admin can invite to the Consulting Group
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm" role="alert" data-testid="error-message">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-foreground hover:bg-accent border border-input rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  data-testid="invite-button"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
