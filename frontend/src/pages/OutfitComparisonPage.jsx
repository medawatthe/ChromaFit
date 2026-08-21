import { useEffect, useState } from 'react';
import client, { outfitImageUrl } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function OutfitComparisonPage() {
  const [outfits, setOutfits] = useState([]);
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
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

  function pick(id) {
    if (idA === id) {
      setIdA('');
      return;
    }
    if (idB === id) {
      setIdB('');
      return;
    }
    if (!idA) {
      setIdA(id);
    } else if (!idB) {
      setIdB(id);
    } else {
      setIdA(id);
      setIdB('');
    }
  }

  async function handleCompare() {
    if (!idA || !idB) return;
    setError('');
    setComparing(true);
    setResult(null);
    try {
      const { data } = await client.post('/compare', { outfitIdA: idA, outfitIdB: idB, occasion });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to compare outfits.');
    } finally {
      setComparing(false);
    }
  }

  return (
    <Layout>
      <PageHeader
        icon="⚖️"
        title="Outfit Comparison"
        subtitle="Pick two items and let AI decide which works best."
        gradient="from-amber-500 to-orange-500"
      />

      {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {!result && (
        <>
          {loading && <p className="mt-6 text-sm text-gray-500">Loading wardrobe…</p>}
          {!loading && outfits.length < 2 && (
            <p className="mt-6 text-sm text-gray-500">Add at least two items to your wardrobe to compare.</p>
          )}
          {!loading && outfits.length >= 2 && (
            <>
              <p className="mt-6 text-sm text-gray-500">
                Tap to select two items ({idA ? 1 : 0}{idB ? '+1' : ''}/2 selected).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {outfits.map((o) => {
                  const id = String(o.id);
                  const isA = idA === id;
                  const isB = idB === id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => pick(id)}
                      className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                        isA ? 'border-brand-600 ring-2 ring-brand-500' : isB ? 'border-purple-600 ring-2 ring-purple-500' : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                        <img src={outfitImageUrl(o.image_url)} alt={o.clothing_name} className="h-full w-full object-cover" />
                        {isA && <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">A</span>}
                        {isB && <span className="absolute left-2 top-2 rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">B</span>}
                      </div>
                      <div className="p-3">
                        <p className="truncate font-medium text-gray-900">{o.clothing_name || 'Untitled item'}</p>
                        <p className="truncate text-xs text-gray-500">{o.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Occasion (optional, e.g. job interview)"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  onClick={handleCompare}
                  disabled={!idA || !idB || comparing}
                  className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {comparing ? 'Comparing…' : 'Compare'}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {result && (
        <div className="mt-6">
          <button onClick={() => setResult(null)} className="mb-4 text-sm text-brand-600 hover:underline">
            ← Compare different items
          </button>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ComparisonCard item={result.itemA} label="A" reason={result.reasonA} isWinner={result.winner === 'A'} />
            <ComparisonCard item={result.itemB} label="B" reason={result.reasonB} isWinner={result.winner === 'B'} />
          </div>

          {result.verdict && (
            <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {result.winner === 'tie' ? '🤝 ' : '🏆 '}
              {result.verdict}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function ComparisonCard({ item, label, reason, isWinner }) {
  return (
    <div className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${isWinner ? 'border-brand-600' : 'border-gray-200'}`}>
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img src={outfitImageUrl(item.image_url)} alt={item.clothing_name} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-gray-900/70 px-2 py-0.5 text-xs font-bold text-white">{label}</span>
        {isWinner && <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">Winner</span>}
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900">{item.clothing_name || 'Untitled item'}</p>
        <p className="mt-1 text-sm text-gray-600">{reason}</p>
      </div>
    </div>
  );
}
