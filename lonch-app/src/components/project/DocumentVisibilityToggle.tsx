import { VISIBILITY } from '../../utils/groupPermissions';

type VisibilityType = typeof VISIBILITY.CONSULTING_ONLY | typeof VISIBILITY.CLIENT_ONLY | typeof VISIBILITY.BOTH;
type SizeType = 'sm' | 'md' | 'lg';

interface DocumentVisibilityToggleProps {
  visibility: VisibilityType;
  onChange: (visibility: string) => void;
  disabled?: boolean;
  size?: SizeType;
}

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
}: DocumentVisibilityToggleProps) {
  const sizeClasses: Record<SizeType, string> = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const getVisibilityColor = (vis: VisibilityType): string => {
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
