import { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import client from '../api/client';

const initialForm = { name: '', email: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await client.post('/contact', form);
      setSent(true);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 text-2xl text-white shadow-md shadow-blue-900/20">
            ✉️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Contact Us</h1>
            <p className="mt-1 text-blue-100">
              Questions, feedback, or found a bug? Send a message and we'll get back to you.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6">
              <h2 className="mb-4 font-semibold text-blue-900">Get in Touch</h2>
              <div className="space-y-4">
                <InfoRow icon="📧" label="Email" value="nanawodaya@gmail.com" />
                <InfoRow
                  icon="🎓"
                  label="University"
                  value="Cardiff Metropolitan University — BSc (Hons) Software Engineering"
                />
                <InfoRow icon="⏱️" label="Response Time" value="Usually within 1–2 business days" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                ChromaFit is a Final Year Project — your feedback directly shapes what gets built
                next. Bug reports, feature ideas, and general thoughts are all welcome.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <span className="text-4xl">🎉</span>
                <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  Thanks — your message has been sent. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-sm font-medium text-blue-800 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-800 to-slate-900 py-2.5 font-medium text-white shadow-sm hover:from-blue-900 hover:to-slate-950 disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}
