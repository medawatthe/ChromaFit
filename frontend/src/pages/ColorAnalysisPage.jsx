import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function ColorAnalysisPage() {
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
        const { data } = await client.get('/color-analysis');
        setLatest(data.latest);
        setHistory(data.history);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load color analysis history.');
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
      setError('Please choose a clear face photo.');
      return;
    }
    setError('');
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await client.post('/color-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLatest(data.analysis);
      setHistory((prev) => [data.analysis, ...prev]);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze your color profile.');
    } finally {
      setAnalyzing(false);
    }
  }

  const bestColors = parseColorList(latest?.best_colors);
  const avoidColors = parseColorList(latest?.colors_to_avoid);

  return (
    <Layout>
      <Link to="/dashboard" className="mb-4 inline-block text-sm text-brand-600 hover:underline">
        ← Back to Dashboard
      </Link>
      <PageHeader
        icon="🎨"
        title="Color Analysis"
        subtitle="Discover your best shades with AI — tailored to your skin, eyes, and hair."
        gradient="from-pink-500 to-rose-500"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Upload a Photo</h2>
          <p className="mb-4 text-xs text-gray-500">
            Use a well-lit, makeup-free selfie for best results. Your photo is analyzed and then
            deleted — we don't keep it.
          </p>

          {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" className="h-40 w-40 rounded-lg object-cover" />}
            <button
              type="submit"
              disabled={analyzing}
              className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {analyzing ? 'Analyzing…' : 'Analyze My Colors'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="mb-3 font-semibold text-brand-700">Your Color Profile</h2>
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading && !latest && (
            <p className="text-sm text-gray-500">No analysis yet — upload a photo to get started.</p>
          )}
          {latest && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge label="Undertone" value={latest.undertone} />
                <Badge label="Season" value={latest.seasonal_type} />
                {latest.seasonal_subtype && <Badge label="Subtype" value={latest.seasonal_subtype} />}
              </div>

              {bestColors.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Best Colors</p>
                  <div className="flex flex-wrap gap-3">
                    {bestColors.map((c) => (
                      <ColorSwatch key={c.hex + c.name} color={c} />
                    ))}
                  </div>
                </div>
              )}

              {avoidColors.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Colors to Avoid</p>
                  <div className="flex flex-wrap gap-3">
                    {avoidColors.map((c) => (
                      <ColorSwatch key={c.hex + c.name} color={c} />
                    ))}
                  </div>
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
                {new Date(h.created_at).toLocaleDateString()} — {h.undertone} / {h.seasonal_type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}

function parseColorList(value) {
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

function ColorSwatch({ color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-10 w-10 rounded-full border border-gray-200 shadow-sm"
        style={{ backgroundColor: color.hex }}
        title={color.hex}
      />
      <span className="max-w-16 text-center text-xs text-gray-600">{color.name}</span>
    </div>
  );
}
