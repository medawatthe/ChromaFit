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
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
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
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <span className="mx-1 h-5 w-px bg-gray-200" />

          {secondaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-500 sm:inline">
            {user?.first_name ? `Hi, ${user.first_name}` : ''}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="flex justify-around border-t border-gray-200 bg-white md:hidden">
        {primaryLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 py-2 text-center text-xs font-medium ${
                isActive ? 'text-brand-700' : 'text-gray-500'
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
