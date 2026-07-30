import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client, { outfitImageUrl } from '../api/client';
import Layout from '../components/Layout';

export default function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysisError, setAnalysisError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get(`/outfits/${id}`);
      setOutfit(data.outfit);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load item.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalysisError('');
    try {
      const { data } = await client.post(`/outfits/${id}/analyze`);
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysisError(err.response?.data?.error || 'AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading…</p>
      </Layout>
    );
  }

  if (error || !outfit) {
    return (
      <Layout>
        <p className="text-red-600">{error || 'Item not found.'}</p>
      </Layout>
    );
  }

  const dominantColors = Array.isArray(analysis?.dominant_colors)
    ? analysis.dominant_colors
    : typeof analysis?.dominant_colors === 'string'
      ? JSON.parse(analysis.dominant_colors)
      : [];

  return (
    <Layout>
      <button onClick={() => navigate(`/wardrobe/${id}`)} className="mb-4 text-sm text-brand-600 hover:underline">
        ← Back to item
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <img
            src={outfitImageUrl(outfit.image_url)}
            alt={outfit.clothing_name || 'Wardrobe item'}
            className="w-full rounded-2xl border border-gray-200 object-cover"
          />
          <h1 className="mt-4 text-xl font-bold text-gray-900">{outfit.clothing_name || 'Untitled item'}</h1>
          <p className="text-sm text-gray-500">
            {[outfit.category, outfit.color, outfit.occasion].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-700">🤖 AI Outfit Analysis</h2>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {analyzing ? 'Analyzing…' : analysis ? 'Re-analyze' : 'Analyze with AI'}
            </button>
          </div>

          {analysisError && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{analysisError}</div>
          )}

          {!analysis && !analysisError && (
            <p className="text-sm text-gray-500">
              No analysis yet — click "Analyze with AI" to get a fashion score, color harmony, skin-tone match, and
              styling advice for this item.
            </p>
          )}

          {analysis && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <ScoreBadge
                  label="Fashion Score"
                  value={analysis.fashion_score ? `${Number(analysis.fashion_score).toFixed(1)}/10` : '—'}
                />
                <ScoreBadge
                  label="Color Harmony"
                  value={analysis.color_harmony_score ? `${Number(analysis.color_harmony_score).toFixed(0)}%` : '—'}
                />
                <ScoreBadge label="Skin Tone Match" value={analysis.skin_tone_category || '—'} />
              </div>

              {dominantColors.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">Dominant Colors</p>
                  <p className="text-sm text-gray-700">{dominantColors.join(', ')}</p>
                </div>
              )}

              {analysis.occasion_match && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">Best For</p>
                  <p className="text-sm text-gray-700">{analysis.occasion_match}</p>
                </div>
              )}

              {analysis.ai_summary && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">Styling Advice</p>
                  <p className="rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm">{analysis.ai_summary}</p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Last analyzed {new Date(analysis.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ScoreBadge({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
