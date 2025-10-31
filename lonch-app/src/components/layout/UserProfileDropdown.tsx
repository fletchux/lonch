import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileDropdownProps {
  onNavigateSettings?: () => void;
}

export default function UserProfileDropdown({ onNavigateSettings }: UserProfileDropdownProps) {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  // Get display name or fallback to email
  const displayName = currentUser.displayName || currentUser.email || 'User';

  // Get first letter for avatar fallback
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Check if user has a photo URL and it hasn't failed to load
  const hasPhoto = currentUser.photoURL && !imageError;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-2 hover:bg-accent transition-colors"
        aria-label="User menu"
      >
        {/* Avatar */}
        <div className="relative">
          {hasPhoto ? (
            <img
              src={currentUser.photoURL}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold border-2 border-primary">
              {avatarLetter}
            </div>
          )}
        </div>

        {/* Name and dropdown icon */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">{displayName}</span>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-popover rounded-lg shadow-lg border border-border py-1 z-50">
          {/* User info section */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-popover-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
          </div>

          {/* Menu items */}
          <button
            onClick={() => {
              setIsOpen(false);
              alert('Profile page coming soon!');
            }}
            className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent focus:outline-none focus:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              if (onNavigateSettings) {
                onNavigateSettings();
              }
            }}
            className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent focus:outline-none focus:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 focus:outline-none focus:bg-destructive/10 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
