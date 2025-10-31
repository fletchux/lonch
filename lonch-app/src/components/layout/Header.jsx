import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import lonchLogo from '../../assets/lonch_logo.svg';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBell from '../notifications/NotificationBell';
import { ThemeToggle } from '../ui/theme-toggle';

const TAGLINE = 'Consultant project kickoff made simple';

export default function Header({ onNavigateSettings }) {
  const { currentUser } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 items-start">
            <img src={lonchLogo} alt="Lonch" className="h-14" />
            <p className="text-gray-600 text-sm font-medium">{TAGLINE}</p>
          </div>
          {/* Theme Toggle, Notification Bell and User Profile */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {currentUser && (
              <>
                <NotificationBell />
                <UserProfileDropdown onNavigateSettings={onNavigateSettings} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onNavigateSettings: PropTypes.func
};
