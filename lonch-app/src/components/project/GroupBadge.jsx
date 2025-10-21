import PropTypes from 'prop-types';
import { GROUP } from '../../utils/groupPermissions';

/**
 * GroupBadge Component
 * Displays a visual badge indicating user's group (Consulting or Client)
 * Consulting Group: Teal color
 * Client Group: Gold color
 */
export default function GroupBadge({ group, className = '' }) {
  const isConsulting = group === GROUP.CONSULTING;

  const bgColor = isConsulting ? 'bg-teal-100' : 'bg-yellow-100';
  const textColor = isConsulting ? 'text-teal-800' : 'text-yellow-800';
  const label = isConsulting ? 'Consulting' : 'Client';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}
      data-testid="group-badge"
    >
      {label}
    </span>
  );
}

GroupBadge.propTypes = {
  group: PropTypes.oneOf([GROUP.CONSULTING, GROUP.CLIENT]).isRequired,
  className: PropTypes.string
};
