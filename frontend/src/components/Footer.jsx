import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-brand-700 to-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <span className="text-lg font-bold">ChromaFit</span>
            <p className="mt-1.5 text-sm text-brand-100/80">
              AI-powered personal fashion recommendation and wardrobe analytics.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-200">Navigate</p>
            <ul className="space-y-1.5 text-sm text-brand-100/80">
              <li><Link to="/" className="transition hover:text-white">Home</Link></li>
              <li><Link to="/about" className="transition hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="transition hover:text-white">Contact Us</Link></li>
              {user ? (
                <>
                  <li><Link to="/dashboard" className="transition hover:text-white">Dashboard</Link></li>
                  <li><Link to="/wardrobe" className="transition hover:text-white">Wardrobe</Link></li>
                  <li><Link to="/chat" className="transition hover:text-white">AI Stylist</Link></li>
                </>
              ) : (
                <li><Link to="/login" className="transition hover:text-white">Log In</Link></li>
              )}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-200">Get in Touch</p>
            <ul className="space-y-1.5 text-sm text-brand-100/80">
              <li>nanawodaya@gmail.com</li>
              <li>Cardiff Metropolitan University</li>
              <li>BSc (Hons) Software Engineering — FYP</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-brand-200/70">
          © {year} ChromaFit. Built by Irushi Nawodya Medawaththa.
        </div>
      </div>
    </footer>
  );
}
