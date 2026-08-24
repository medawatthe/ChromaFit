import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const primaryLinks = [
  { to: '/dashboard', label: 'Home' },
  { to: '/wardrobe', label: 'Wardrobe' },
  { to: '/chat', label: 'AI Stylist' },
  { to: '/profile', label: 'Profile' },
];

const secondaryLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-700 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-blue-300 bg-clip-text text-transparent">
            ChromaFit
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300'
                    : 'text-blue-100 hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <span className="mx-1 h-5 w-px bg-slate-700" />

          {secondaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300'
                    : 'text-blue-200/70 hover:bg-slate-800 hover:text-blue-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-blue-200 sm:inline">
            {user?.first_name ? `Hi, ${user.first_name}` : ''}
          </span>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              aria-label="Admin"
              className={({ isActive }) =>
                `flex h-9 w-9 items-center justify-center rounded-full border text-lg transition ${
                  isActive
                    ? 'border-brand-400 bg-brand-500/20 text-brand-300'
                    : 'border-slate-600 text-blue-200 hover:bg-slate-800'
                }`
              }
            >
              🛡️
            </NavLink>
          )}
          <NavLink
            to="/settings"
            aria-label="Settings"
            className={({ isActive }) =>
              `flex h-9 w-9 items-center justify-center rounded-full border text-lg transition ${
                isActive
                  ? 'border-brand-400 bg-brand-500/20 text-brand-300'
                  : 'border-slate-600 text-blue-200 hover:bg-slate-800'
              }`
            }
          >
            ⚙️
          </NavLink>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-600 px-4 py-1.5 text-sm font-medium text-blue-100 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="flex justify-around border-t border-slate-700 bg-slate-900 md:hidden">
        {primaryLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 py-2 text-center text-xs font-medium ${
                isActive ? 'text-brand-300' : 'text-blue-200/70'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
