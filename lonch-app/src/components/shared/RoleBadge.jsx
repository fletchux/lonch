import PropTypes from 'prop-types';
import { getRoleDisplayName, getRoleColor, ROLES } from '../../utils/permissions';

/**
 * RoleBadge component displays a user's role with color coding
 * Owner=teal, Admin=yellow/gold, Editor=blue, Viewer=gray
 */
export default function RoleBadge({ role, size = 'sm' }) {
  const displayName = getRoleDisplayName(role);
  const color = getRoleColor(role);

  // Size classes
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  // Color classes based on role
  const colorClasses = {
    teal: 'bg-teal-100 text-teal-800 border-teal-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300'
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

RoleBadge.propTypes = {
  role: PropTypes.oneOf(Object.values(ROLES)).isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg'])
};
