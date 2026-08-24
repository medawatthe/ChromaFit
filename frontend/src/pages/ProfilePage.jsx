import { useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

const STYLE_OPTIONS = ['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Vintage', 'Sporty', 'Traditional'];

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    bio: user?.bio || '',
    heightCm: user?.height_cm || '',
    weightKg: user?.weight_kg || '',
    skinTone: user?.skin_tone || '',
    bodyShape: user?.body_shape || '',
    country: user?.country || '',
    city: user?.city || '',
    occupation: user?.occupation || '',
    theme: user?.theme || 'light',
  });
  const [stylePreferences, setStylePreferences] = useState(user?.fashion_style_preference || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStyle(style) {
    setStylePreferences((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const { data } = await client.put('/users/me', {
        ...form,
        fashionStylePreference: stylePreferences,
      });
      setUser(data.user);
      localStorage.setItem('chromafit_user', JSON.stringify(data.user));
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <PageHeader
        icon="👤"
        title="My Profile"
        subtitle="Keep your details up to date for more personalized AI styling."
        gradient="from-slate-500 to-gray-600"
      />

      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-500">
          {user?.username} · {user?.email}
        </p>

        {message && <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" value={form.firstName} onChange={(v) => updateField('firstName', v)} />
            <Field label="Last Name" value={form.lastName} onChange={(v) => updateField('lastName', v)} />
            <Field label="Height (cm)" type="number" value={form.heightCm} onChange={(v) => updateField('heightCm', v)} />
            <Field label="Weight (kg)" type="number" value={form.weightKg} onChange={(v) => updateField('weightKg', v)} />
            <Field label="Skin Tone" value={form.skinTone} onChange={(v) => updateField('skinTone', v)} />
            <Field label="Body Shape" value={form.bodyShape} onChange={(v) => updateField('bodyShape', v)} />
            <Field label="Country" value={form.country} onChange={(v) => updateField('country', v)} />
            <Field label="City" value={form.city} onChange={(v) => updateField('city', v)} />
            <Field label="Occupation" value={form.occupation} onChange={(v) => updateField('occupation', v)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Fashion Style Preference</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    stylePreferences.includes(style)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
