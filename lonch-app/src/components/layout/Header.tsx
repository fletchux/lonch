import { useAuth } from '../../contexts/AuthContext';
import lonchLogo from '../../assets/lonch_logo.svg';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBell from '../notifications/NotificationBell';

const TAGLINE = 'Consultant project kickoff made simple';

interface HeaderProps {
  onNavigateSettings?: () => void;
}

export default function Header({ onNavigateSettings }: HeaderProps) {
  const { currentUser } = useAuth();

  return (
    <header className="w-full bg-background border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 items-start">
            <img src={lonchLogo} alt="Lonch" className="h-14" />
            <p className="text-muted-foreground text-sm font-medium">{TAGLINE}</p>
          </div>
          {/* Notification Bell and User Profile */}
          {currentUser && (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserProfileDropdown onNavigateSettings={onNavigateSettings} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
