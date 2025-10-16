import lonchLogo from '../../assets/lonch_logo.svg';

const TAGLINE = 'Consultant project kickoff made simple';

export default function Header({ onLogin, showLogin = false }) {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2 items-start">
            <img src={lonchLogo} alt="Lonch" className="h-14" />
            <p className="text-gray-600 text-sm font-medium">{TAGLINE}</p>
          </div>

          {showLogin && (
            <button
              onClick={onLogin}
              className="bg-[#DBA507] text-white px-6 py-3 rounded-lg hover:bg-[#B88906] transition-colors shadow-lg font-medium"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
