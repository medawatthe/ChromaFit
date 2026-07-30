export default function StatCard({ label, value, sublabel, accent = false }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        accent ? 'border-brand-200 bg-brand-50' : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? 'text-brand-700' : 'text-gray-900'}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}
