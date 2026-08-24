export default function PageHeader({ icon, title, subtitle, gradient = 'from-brand-500 to-purple-500', action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl text-white shadow-md shadow-brand-500/20`}
        >
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-blue-100">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
