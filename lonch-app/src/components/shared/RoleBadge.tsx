import { getRoleDisplayName, getRoleColor, ROLES } from '../../utils/permissions';

type RoleSize = 'xs' | 'sm' | 'md' | 'lg';
type RoleColor = 'teal' | 'yellow' | 'blue' | 'gray';

interface RoleBadgeProps {
  role: typeof ROLES[keyof typeof ROLES];
  size?: RoleSize;
}

/**
 * RoleBadge component displays a user's role with color coding
 * Owner=teal, Admin=yellow/gold, Editor=blue, Viewer=gray
 */
export default function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const displayName = getRoleDisplayName(role);
  const color = getRoleColor(role) as RoleColor;

  // Size classes
  const sizeClasses: Record<RoleSize, string> = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  // Color classes based on role
  const colorClasses: Record<RoleColor, string> = {
    teal: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    gray: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
      data-testid="role-badge"
      data-role={role}
    >
      {displayName}
    </span>
  );
}
