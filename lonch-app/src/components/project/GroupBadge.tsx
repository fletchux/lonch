import { GROUP } from '../../utils/groupPermissions';

interface GroupBadgeProps {
  group: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
  className?: string;
}

/**
 * GroupBadge Component
 * Displays a visual badge indicating user's group (Consulting or Client)
 * Consulting Group: Teal color
 * Client Group: Gold color
 */
export default function GroupBadge({ group, className = '' }: GroupBadgeProps) {
  const isConsulting = group === GROUP.CONSULTING;

  const bgColor = isConsulting
    ? 'bg-teal-100 dark:bg-teal-900/20'
    : 'bg-yellow-100 dark:bg-yellow-900/20';
  const textColor = isConsulting
    ? 'text-teal-800 dark:text-teal-300'
    : 'text-yellow-800 dark:text-yellow-300';
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
