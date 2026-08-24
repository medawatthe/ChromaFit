import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client, { outfitImageUrl } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function MatchToolPage() {
  const [searchParams] = useSearchParams();
  const [outfits, setOutfits] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('outfitId') || '');
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/outfits');
        setOutfits(data.outfits);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load wardrobe.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleFindMatches() {
    if (!selectedId) return;
    setError('');
    setMatching(true);
    setResult(null);
    try {
      const { data } = await client.post(`/outfits/${selectedId}/match`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find matches.');
    } finally {
      setMatching(false);
    }
  }

  return (
    <Layout>
      <Link to="/dashboard" className="mb-4 inline-block text-sm text-brand-600 hover:underline">
        ← Back to Dashboard
      </Link>
      <PageHeader
        icon="🔗"
        title="Match Tool"
        subtitle="Pick an item and let AI find what pairs best with it from your wardrobe."
        gradient="from-cyan-500 to-blue-500"
      />

      {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {!result && (
        <>
          {loading && <p className="mt-6 text-sm text-gray-500">Loading wardrobe…</p>}
          {!loading && outfits.length === 0 && (
            <p className="mt-6 text-sm text-gray-500">Add items to your wardrobe first.</p>
          )}
          {!loading && outfits.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {outfits.map((o) => (
                  <PickerCard key={o.id} outfit={o} selected={selectedId === String(o.id)} onClick={() => setSelectedId(String(o.id))} />
                ))}
              </div>
              <button
                onClick={handleFindMatches}
                disabled={!selectedId || matching}
                className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {matching ? 'Finding Matches…' : 'Find Matches'}
              </button>
            </>
          )}
        </>
      )}

      {result && (
        <div className="mt-6">
          <button onClick={() => setResult(null)} className="mb-4 text-sm text-brand-600 hover:underline">
            ← Choose a different item
          </button>

          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <img
              src={outfitImageUrl(result.selected.image_url)}
              alt={result.selected.clothing_name}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div>
              <p className="text-xs text-gray-400">Matching for</p>
              <p className="font-semibold text-gray-900">{result.selected.clothing_name}</p>
            </div>
          </div>

          {result.stylingTip && (
            <div className="mb-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
              💡 {result.stylingTip}
            </div>
          )}

          {result.matches.length === 0 ? (
            <p className="text-sm text-gray-500">No strong matches found — try adding more variety to your wardrobe.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.matches.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    <img src={outfitImageUrl(m.image_url)} alt={m.clothing_name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="truncate font-medium text-gray-900">{m.clothing_name}</p>
                      <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {m.match_score}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{m.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function PickerCard({ outfit, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
        selected ? 'border-brand-600 ring-2 ring-brand-500' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <img src={outfitImageUrl(outfit.image_url)} alt={outfit.clothing_name} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <p className="truncate font-medium text-gray-900">{outfit.clothing_name || 'Untitled item'}</p>
        <p className="truncate text-xs text-gray-500">{outfit.category}</p>
      </div>
    </button>
  );
}
