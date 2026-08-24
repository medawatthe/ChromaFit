import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
];

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-700 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-blue-300 bg-clip-text text-transparent">
            ChromaFit
          </span>
        </NavLink>

        <nav className="hidden gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-500/20 text-brand-300' : 'text-blue-100 hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/login"
            className="rounded-full border border-slate-600 px-4 py-1.5 text-sm font-medium text-blue-100 hover:bg-slate-800"
          >
            Log In
          </NavLink>
          <NavLink
            to="/register"
            className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Sign Up
          </NavLink>
        </div>
      </div>

      <nav className="flex justify-around border-t border-slate-700 bg-slate-900 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
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
