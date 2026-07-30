const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(monthStr) {
  const [, m] = monthStr.split('-');
  return MONTH_LABELS[Number(m) - 1] || monthStr;
}

export default function MonthlyUsageChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium text-gray-500">Monthly Usage</p>
        <p className="text-sm text-gray-400">No wear history yet — mark items worn to see trends here.</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-medium text-gray-500">Monthly Usage</p>
      <div className="flex items-end gap-3 h-24">
        {data.map((d) => {
          const heightPct = Math.max((d.count / max) * 100, 4);
          return (
            <div key={d.month} className="flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-xs font-semibold text-gray-700">{d.count}</span>
              <div
                className="w-full max-w-8 rounded-t-md bg-brand-500"
                style={{ height: `${heightPct}%` }}
                title={`${formatMonth(d.month)}: ${d.count} wear${d.count === 1 ? '' : 's'}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-3">
        {data.map((d) => (
          <span key={d.month} className="flex-1 text-center text-xs text-gray-400">
            {formatMonth(d.month)}
          </span>
        ))}
      </div>
    </div>
  );
}
