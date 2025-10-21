import PropTypes from 'prop-types';
import { VISIBILITY } from '../../utils/groupPermissions';

/**
 * DocumentVisibilityToggle Component
 * Allows Owner/Admin in Consulting Group to set document visibility
 * Three options: Consulting Only, Client Only, Both Groups
 * Visual indicators: Lock icon for restricted, Globe for both groups
 */
export default function DocumentVisibilityToggle({
  visibility,
  onChange,
  disabled = false,
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const getVisibilityLabel = (vis) => {
    switch (vis) {
      case VISIBILITY.CONSULTING_ONLY:
        return '🔒 Consulting Only';
      case VISIBILITY.CLIENT_ONLY:
        return '🔒 Client Only';
      case VISIBILITY.BOTH:
        return '🌐 Both Groups';
      default:
        return 'Select Visibility';
    }
  };

  const getVisibilityColor = (vis) => {
    switch (vis) {
      case VISIBILITY.CONSULTING_ONLY:
        return 'border-teal-300 bg-teal-50 text-teal-800';
      case VISIBILITY.CLIENT_ONLY:
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case VISIBILITY.BOTH:
        return 'border-gray-300 bg-gray-50 text-gray-800';
      default:
        return 'border-gray-300 bg-white text-gray-800';
    }
  };

  return (
    <div className="relative inline-block" data-testid="visibility-toggle">
      <select
        value={visibility}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          appearance-none border rounded-md font-medium
          focus:ring-2 focus:ring-teal-500 focus:border-transparent
          cursor-pointer
          ${sizeClasses[size]}
          ${getVisibilityColor(visibility)}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
        `}
        data-testid="visibility-select"
      >
        <option value={VISIBILITY.CONSULTING_ONLY}>
          🔒 Consulting Only
        </option>
        <option value={VISIBILITY.CLIENT_ONLY}>
          🔒 Client Only
        </option>
        <option value={VISIBILITY.BOTH}>
          🌐 Both Groups
        </option>
      </select>

      {disabled && (
        <div className="absolute inset-0 cursor-not-allowed" title="You don't have permission to change visibility" />
      )}
    </div>
  );
}

DocumentVisibilityToggle.propTypes = {
  visibility: PropTypes.oneOf([
    VISIBILITY.CONSULTING_ONLY,
    VISIBILITY.CLIENT_ONLY,
    VISIBILITY.BOTH
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};
