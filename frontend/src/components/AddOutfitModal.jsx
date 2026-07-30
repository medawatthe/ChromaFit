import { useState } from 'react';
import client from '../api/client';
import {
  CATEGORIES,
  PATTERNS,
  MATERIALS,
  SLEEVE_TYPES,
  NECK_TYPES,
  FIT_TYPES,
  SEASONS,
  OCCASIONS,
} from '../constants/wardrobeOptions';

const initialForm = {
  clothingName: '',
  category: '',
  brand: '',
  color: '',
  secondaryColor: '',
  pattern: '',
  material: '',
  sleeveType: '',
  neckType: '',
  fitType: '',
  season: '',
  occasion: '',
  purchaseDate: '',
  price: '',
  notes: '',
};

export default function AddOutfitModal({ onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
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
    setError('');

    if (!file) {
      setError('Please choose an image of the clothing item.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const { data } = await client.post('/outfits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreated(data.outfit);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save item.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Add Clothing Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image *</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} required />
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 h-32 w-32 rounded-lg object-cover" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Clothing Name" value={form.clothingName} onChange={(v) => updateField('clothingName', v)} />
            <SelectField label="Category" value={form.category} onChange={(v) => updateField('category', v)} options={CATEGORIES} />
            <TextField label="Brand" value={form.brand} onChange={(v) => updateField('brand', v)} />
            <TextField label="Color" value={form.color} onChange={(v) => updateField('color', v)} />
            <TextField label="Secondary Color" value={form.secondaryColor} onChange={(v) => updateField('secondaryColor', v)} />
            <SelectField label="Pattern" value={form.pattern} onChange={(v) => updateField('pattern', v)} options={PATTERNS} />
            <SelectField label="Material" value={form.material} onChange={(v) => updateField('material', v)} options={MATERIALS} />
            <SelectField label="Sleeve Type" value={form.sleeveType} onChange={(v) => updateField('sleeveType', v)} options={SLEEVE_TYPES} />
            <SelectField label="Neck Type" value={form.neckType} onChange={(v) => updateField('neckType', v)} options={NECK_TYPES} />
            <SelectField label="Fit Type" value={form.fitType} onChange={(v) => updateField('fitType', v)} options={FIT_TYPES} />
            <SelectField label="Season" value={form.season} onChange={(v) => updateField('season', v)} options={SEASONS} />
            <SelectField label="Occasion" value={form.occasion} onChange={(v) => updateField('occasion', v)} options={OCCASIONS} />
            <TextField label="Purchase Date" type="date" value={form.purchaseDate} onChange={(v) => updateField('purchaseDate', v)} />
            <TextField label="Price" type="number" value={form.price} onChange={(v) => updateField('price', v)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
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
