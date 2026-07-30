import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const SKIN_TONES = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Deep'];
const BODY_SHAPES = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'];
const STYLE_OPTIONS = ['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Vintage', 'Sporty', 'Traditional'];

const initialForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  gender: '',
  heightCm: '',
  weightKg: '',
  skinTone: '',
  bodyShape: '',
  country: '',
  city: '',
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [stylePreferences, setStylePreferences] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await client.post('/auth/register', {
        ...form,
        fashionStylePreference: stylePreferences,
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-1 text-center text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
          Create your ChromaFit account
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Tell us about yourself so we can personalize your styling
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="First Name" required value={form.firstName} onChange={(v) => updateField('firstName', v)} />
              <Field label="Last Name" required value={form.lastName} onChange={(v) => updateField('lastName', v)} />
              <Field label="Username" required value={form.username} onChange={(v) => updateField('username', v)} />
              <Field label="Email Address" type="email" required value={form.email} onChange={(v) => updateField('email', v)} />
              <Field label="Mobile Number" value={form.mobileNumber} onChange={(v) => updateField('mobileNumber', v)} />
              <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select…</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <Field label="Password" type="password" required value={form.password} onChange={(v) => updateField('password', v)} />
              <Field label="Confirm Password" type="password" required value={form.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
              Personal Styling (optional)
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Height (cm)" type="number" value={form.heightCm} onChange={(v) => updateField('heightCm', v)} />
              <Field label="Weight (kg)" type="number" value={form.weightKg} onChange={(v) => updateField('weightKg', v)} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Skin Tone</label>
                <select
                  value={form.skinTone}
                  onChange={(e) => updateField('skinTone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Auto-detect later</option>
                  {SKIN_TONES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Body Shape</label>
                <select
                  value={form.bodyShape}
                  onChange={(e) => updateField('bodyShape', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Auto-detect later</option>
                  {BODY_SHAPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Field label="Country" value={form.country} onChange={(v) => updateField('country', v)} />
              <Field label="City" value={form.city} onChange={(v) => updateField('city', v)} />
            </div>

            <div className="mt-4">
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
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', required = false, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
