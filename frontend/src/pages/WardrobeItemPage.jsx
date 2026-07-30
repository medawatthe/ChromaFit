import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client, { outfitImageUrl } from '../api/client';
import Layout from '../components/Layout';

export default function WardrobeItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  async function handleMarkWorn() {
    try {
      const { data } = await client.post(`/outfits/${id}/wear`);
      setOutfit(data.outfit);
    } catch {
      setError('Failed to log this wear.');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this wardrobe item? This cannot be undone.')) return;
    try {
      await client.delete(`/outfits/${id}`);
      navigate('/wardrobe');
    } catch {
      setError('Failed to delete item.');
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

  return (
    <Layout>
      <button onClick={() => navigate('/wardrobe')} className="mb-4 text-sm text-brand-600 hover:underline">
        ← Back to wardrobe
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <img
            src={outfitImageUrl(outfit.image_url)}
            alt={outfit.clothing_name || 'Wardrobe item'}
            className="w-full rounded-2xl border border-gray-200 object-cover"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleMarkWorn}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Mark worn today
            </button>
            <button
              onClick={handleDelete}
              className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete item
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{outfit.clothing_name || 'Untitled item'}</h1>
          <p className="text-sm text-gray-500">
            {outfit.last_worn_date ? `Last worn ${outfit.last_worn_date.slice(0, 10)}` : 'Never marked as worn'}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Detail label="Category" value={outfit.category} />
            <Detail label="Brand" value={outfit.brand} />
            <Detail label="Color" value={outfit.color} />
            <Detail label="Secondary Color" value={outfit.secondary_color} />
            <Detail label="Pattern" value={outfit.pattern} />
            <Detail label="Material" value={outfit.material} />
            <Detail label="Sleeve Type" value={outfit.sleeve_type} />
            <Detail label="Neck Type" value={outfit.neck_type} />
            <Detail label="Fit Type" value={outfit.fit_type} />
            <Detail label="Season" value={outfit.season} />
            <Detail label="Occasion" value={outfit.occasion} />
            <Detail label="Price" value={outfit.price ? `Rs. ${outfit.price}` : null} />
          </dl>

          {outfit.notes && (
            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{outfit.notes}</p>
          )}

          <Link
            to={`/wardrobe/${id}/analysis`}
            className="mt-6 flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50 p-5 transition hover:bg-brand-100"
          >
            <div>
              <h2 className="font-semibold text-brand-700">🤖 AI Outfit Analysis</h2>
              {analysis ? (
                <p className="mt-1 text-sm text-gray-600">
                  Fashion score {analysis.fashion_score ? `${Number(analysis.fashion_score).toFixed(1)}/10` : '—'} ·{' '}
                  {analysis.skin_tone_category || 'view full report'}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-600">Not analyzed yet — tap to run AI analysis.</p>
              )}
            </div>
            <span className="text-brand-600">→</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}
