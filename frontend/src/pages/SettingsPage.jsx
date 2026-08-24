import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
];

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function persist(updates) {
    setSaving(true);
    setMessage('');
    try {
      const { data } = await client.put('/users/me', updates);
      setUser(data.user);
      localStorage.setItem('chromafit_user', JSON.stringify(data.user));
      setMessage('Saved.');
    } catch {
      setMessage('Failed to save — your choice still applies on this device.');
    } finally {
      setSaving(false);
    }
  }

  function handleThemeChange(value) {
    setTheme(value);
    if (user) persist({ theme: value });
  }

  function handleFontSizeChange(value) {
    setFontSize(value);
    if (user) persist({ fontSize: value });
  }

  return (
    <Layout>
      <Link to="/dashboard" className="mb-4 inline-block text-sm text-brand-600 hover:underline">
        ← Back to Dashboard
      </Link>
      <PageHeader
        icon="⚙️"
        title="Settings"
        subtitle="Customize how ChromaFit looks for you."
        gradient="from-gray-600 to-slate-800"
      />

      {message && (
        <p className="mb-4 text-sm text-gray-500">
          {saving ? 'Saving…' : message}
        </p>
      )}

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Appearance</h2>
          <p className="mb-4 text-sm text-gray-500">Choose a light or dark theme for the app.</p>
          <div className="flex gap-3">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleThemeChange(opt.value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition ${
                  theme === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Font Size</h2>
          <p className="mb-4 text-sm text-gray-500">Adjust text size across the whole app.</p>
          <div className="flex gap-3">
            {FONT_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFontSizeChange(opt.value)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                  fontSize === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span
                  className={
                    opt.value === 'small' ? 'text-xs' : opt.value === 'large' ? 'text-lg' : 'text-base'
                  }
                >
                  Aa
                </span>
                <span className="mt-1 block">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
