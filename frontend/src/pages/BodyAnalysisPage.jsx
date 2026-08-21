import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function BodyAnalysisPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/body-analysis');
        setLatest(data.latest);
        setHistory(data.history);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load body analysis history.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!file) {
      setError('Please choose a clear, full-body photo.');
      return;
    }
    setError('');
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await client.post('/body-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLatest(data.analysis);
      setHistory((prev) => [data.analysis, ...prev]);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze your body shape.');
    } finally {
      setAnalyzing(false);
    }
  }

  const stylingTips = parseList(latest?.styling_tips);
  const avoidTips = parseList(latest?.avoid_tips);

  return (
    <Layout>
      <PageHeader
        icon="🧍"
        title="Body Analysis"
        subtitle="Get AI-powered body shape insights and styling tips tailored to your proportions."
        gradient="from-indigo-500 to-blue-500"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Upload a Photo</h2>
          <p className="mb-4 text-xs text-gray-500">
            Use a full-body photo in fitted clothing for best results. Your photo is analyzed and
            then deleted — we don't keep it.
          </p>

          {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" className="h-56 w-40 rounded-lg object-cover" />}
            <button
              type="submit"
              disabled={analyzing}
              className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {analyzing ? 'Analyzing…' : 'Analyze My Body Shape'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="mb-3 font-semibold text-brand-700">Your Body Profile</h2>
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading && !latest && (
            <p className="text-sm text-gray-500">No analysis yet — upload a photo to get started.</p>
          )}
          {latest && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge label="Body Shape" value={latest.body_shape} />
              </div>

              {latest.proportions && (
                <p className="rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm">
                  <span className="font-semibold text-gray-900">Proportions: </span>
                  {latest.proportions}
                </p>
              )}

              {stylingTips.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Styling Tips</p>
                  <ul className="space-y-1">
                    {stylingTips.map((tip, i) => (
                      <li key={i} className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                        ✓ {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {avoidTips.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">What to Avoid</p>
                  <ul className="space-y-1">
                    {avoidTips.map((tip, i) => (
                      <li key={i} className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                        ✗ {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latest.ai_summary && (
                <p className="rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm">{latest.ai_summary}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {history.length > 1 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">Past Analyses</p>
          <ul className="space-y-1 text-sm text-gray-600">
            {history.slice(1).map((h) => (
              <li key={h.id}>
                {new Date(h.created_at).toLocaleDateString()} — {h.body_shape}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function Badge({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
