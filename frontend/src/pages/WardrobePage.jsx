import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';
import OutfitCard from '../components/OutfitCard';
import AddOutfitModal from '../components/AddOutfitModal';
import { CATEGORIES, OCCASIONS, SEASONS } from '../constants/wardrobeOptions';

export default function WardrobePage() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ category: '', occasion: '', season: '', search: '' });

  async function loadOutfits() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await client.get('/outfits', { params });
      setOutfits(data.outfits);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load wardrobe.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOutfits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function handleCreated(outfit) {
    setOutfits((prev) => [outfit, ...prev]);
    setShowModal(false);
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wardrobe</h1>
          <p className="text-sm text-gray-500">{outfits.length} item{outfits.length === 1 ? '' : 's'}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add Clothing Item
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search wardrobe…"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <FilterSelect label="Category" value={filters.category} options={CATEGORIES} onChange={(v) => setFilters((p) => ({ ...p, category: v }))} />
        <FilterSelect label="Occasion" value={filters.occasion} options={OCCASIONS} onChange={(v) => setFilters((p) => ({ ...p, occasion: v }))} />
        <FilterSelect label="Season" value={filters.season} options={SEASONS} onChange={(v) => setFilters((p) => ({ ...p, season: v }))} />
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-gray-500">Loading wardrobe…</p>}

      {!loading && outfits.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          Your wardrobe is empty. Add your first item to get AI styling suggestions.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {outfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>

      {showModal && <AddOutfitModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </Layout>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
    >
      <option value="">{label}: All</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
