import { useAuth } from '../../contexts/AuthContext';
import lonchLogo from '../../assets/lonch_logo.svg';
import UserProfileDropdown from './UserProfileDropdown';

const TAGLINE = 'Consultant project kickoff made simple';

export default function Header() {
  const { currentUser } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 items-start">
            <img src={lonchLogo} alt="Lonch" className="h-14" />
            <p className="text-gray-600 text-sm font-medium">{TAGLINE}</p>
          </div>
          {/* Task 4.8: Show user profile dropdown when authenticated */}
          {currentUser && <UserProfileDropdown />}
        </div>
      </div>
    </header>
  );
}
