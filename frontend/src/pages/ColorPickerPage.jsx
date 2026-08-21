import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getColorVerdict, parseUndertone } from '../utils/colorTheory';

const VERDICT_STYLES = {
  great: { label: 'Great Match', className: 'bg-green-50 text-green-700 border-green-200' },
  good: { label: 'Good Match', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  avoid: { label: 'Better to Avoid', className: 'bg-red-50 text-red-700 border-red-200' },
  unknown: { label: 'Unknown', className: 'bg-gray-50 text-gray-600 border-gray-200' },
};

export default function ColorPickerPage() {
  const { user, setUser } = useAuth();
  const [hex, setHex] = useState('#3b82f6');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/color-analysis');
        setProfile(data.latest);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const undertone = profile?.undertone || parseUndertone(user?.skin_tone);
  const seasonalType = profile?.seasonal_type;
  const verdict = getColorVerdict({ hex, undertone, seasonalType });
  const verdictStyle = VERDICT_STYLES[verdict.verdict] || VERDICT_STYLES.unknown;

  async function saveColor(field) {
    setSaving(true);
    setMessage('');
    try {
      const existing = (user?.[field === 'favoriteColors' ? 'favorite_colors' : 'least_favorite_colors']) || [];
      const next = existing.includes(hex) ? existing : [...existing, hex];
      const { data } = await client.put('/users/me', { [field]: next });
      setUser(data.user);
      localStorage.setItem('chromafit_user', JSON.stringify(data.user));
      setMessage(field === 'favoriteColors' ? 'Added to your favorite colors.' : 'Added to colors to avoid.');
    } catch {
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <PageHeader
        icon="🖌️"
        title="Color Picker"
        subtitle="Pick any color and instantly see how well it works with your undertone."
        gradient="from-fuchsia-500 to-purple-500"
      />

      {!loading && !undertone && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Run <a href="/color-analysis" className="font-medium underline">Color Analysis</a> (or set a skin tone on
          your profile) to get personalized verdicts. Showing general color-theory guidance for now.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Choose a Color</h2>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-16 w-16 cursor-pointer rounded-lg border border-gray-300"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => saveColor('favoriteColors')}
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              ♥ Save as Favorite
            </button>
            <button
              onClick={() => saveColor('leastFavoriteColors')}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Mark to Avoid
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-gray-500">{message}</p>}

          {(user?.favorite_colors?.length > 0 || user?.least_favorite_colors?.length > 0) && (
            <div className="mt-6 space-y-3">
              {user?.favorite_colors?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Your Favorites</p>
                  <div className="flex flex-wrap gap-2">
                    {user.favorite_colors.map((c) => (
                      <div key={c} className="h-8 w-8 rounded-full border border-gray-200" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
              )}
              {user?.least_favorite_colors?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Colors You Avoid</p>
                  <div className="flex flex-wrap gap-2">
                    {user.least_favorite_colors.map((c) => (
                      <div key={c} className="h-8 w-8 rounded-full border border-gray-200" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`rounded-2xl border p-6 ${verdictStyle.className}`}>
          <h2 className="mb-4 font-semibold">Verdict</h2>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl border border-white shadow-sm" style={{ backgroundColor: hex }} />
            <div>
              <p className="text-lg font-bold">{verdictStyle.label}</p>
              <p className="text-sm opacity-80">{verdict.reason}</p>
            </div>
          </div>
          {(undertone || seasonalType) && (
            <p className="mt-4 text-xs opacity-70">
              Based on your {seasonalType ? `${seasonalType} season` : `${undertone} undertone`}.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
