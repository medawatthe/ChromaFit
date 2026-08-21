import { useEffect, useState } from 'react';
import client, { outfitImageUrl } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { CATEGORIES } from '../constants/wardrobeOptions';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function loadItems() {
    setLoading(true);
    try {
      const { data } = await client.get('/wishlist');
      setItems(data.items);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handleCreated(item) {
    setItems((prev) => [item, ...prev]);
    setShowModal(false);
  }

  async function handleDelete(id) {
    try {
      await client.delete(`/wishlist/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError('Failed to delete item.');
    }
  }

  return (
    <Layout>
      <PageHeader
        icon="💖"
        title="Wishlist"
        subtitle={`${items.length} item${items.length === 1 ? '' : 's'}`}
        gradient="from-rose-500 to-pink-500"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Add to Wishlist
          </button>
        }
      />

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-gray-500">Loading wishlist…</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          Your wishlist is empty. Add items you're dreaming of buying next.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-gray-100">
              {item.image_url ? (
                <img src={outfitImageUrl(item.image_url)} alt={item.item_name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl">💖</span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate font-medium text-gray-900">{item.item_name}</p>
              <p className="truncate text-xs text-gray-500">
                {[item.brand, item.category].filter(Boolean).join(' · ') || 'No details'}
              </p>
              {item.estimated_price && (
                <p className="mt-1 text-sm font-semibold text-brand-600">${Number(item.estimated_price).toFixed(2)}</p>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="mt-2 text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && <AddWishlistModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </Layout>
  );
}

function AddWishlistModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ itemName: '', category: '', brand: '', estimatedPrice: '', notes: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.itemName) {
      setError('Item name is required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) formData.append(k, v);
      });
      if (file) formData.append('image', file);
      const { data } = await client.post('/wishlist', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreated(data.item);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add to Wishlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Item Name" value={form.itemName} onChange={(v) => updateField('itemName', v)} required />
          <SelectField label="Category" value={form.category} options={CATEGORIES} onChange={(v) => updateField('category', v)} />
          <TextField label="Brand" value={form.brand} onChange={(v) => updateField('brand', v)} />
          <TextField label="Estimated Price" type="number" value={form.estimatedPrice} onChange={(v) => updateField('estimatedPrice', v)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Photo (optional)</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" className="mt-2 h-24 w-24 rounded-lg object-cover" />}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add to Wishlist'}
          </button>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
