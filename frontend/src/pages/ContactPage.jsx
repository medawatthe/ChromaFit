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
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
        <p className="mt-3 text-gray-600">
          Questions, feedback, or found a bug? Send a message and we'll get back to you.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          <p>Email: nanawodaya@gmail.com</p>
          <p className="mt-1">Cardiff Metropolitan University — BSc (Hons) Software Engineering</p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {sent ? (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Thanks — your message has been sent. We'll get back to you soon.
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
