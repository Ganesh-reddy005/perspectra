import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, BookOpen, Network, LogOut, Route, History } from 'lucide-react';

const ORANGE = '#F15A24';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home', Icon: Home },
  { to: '/problems', label: 'Problems', Icon: BookOpen },
  { to: '/knowledge-graph', label: 'Graph', Icon: Network },
  { to: '/learning-path', label: 'Path', Icon: Route },
  { to: '/review-history', label: 'History', Icon: History },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/login'); };
  const firstName = user.name?.split(' ')[0] ?? '';

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-black/[0.07]"
      style={{ background: 'rgba(250,250,250,0.90)', backdropFilter: 'blur(14px)', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1160px] mx-auto px-6 h-[58px] flex items-center justify-between">

        {/* Logo → always goes to landing */}
        <Link to="/" className="flex items-center gap-[7px] select-none group">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect width="10" height="10" rx="2" fill="#0A0A0A" />
            <rect x="12" width="10" height="10" rx="2" fill={ORANGE} />
            <rect y="12" width="10" height="10" rx="2" fill={ORANGE} opacity="0.35" />
            <rect x="12" y="12" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.18" />
          </svg>
          <span className="text-[16px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">
            Perspectra
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, Icon }) => {
            const active = pathname === to || pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 text-[13px] px-3.5 py-2 rounded-full transition-all duration-150"
                style={{
                  color: active ? '#0A0A0A' : 'rgba(0,0,0,0.45)',
                  background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2 : 1.6} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: user + logout */}
        <div className="flex items-center gap-3">
          {/* Avatar pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08]" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
              style={{ background: ORANGE }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] text-black/60 font-light">{firstName}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[13px] text-black/35 hover:text-black/65 transition-colors duration-150 px-2 py-1.5 rounded-lg hover:bg-black/[0.04]"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
