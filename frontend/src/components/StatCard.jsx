export default function StatCard({ label, value, sublabel, icon, accent = false }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
        accent ? 'border-brand-200 bg-brand-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-sm text-white">
            {icon}
          </div>
        )}
      </div>
      <p className={`mt-1 text-3xl font-bold ${accent ? 'text-brand-700' : 'text-gray-900'}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}
