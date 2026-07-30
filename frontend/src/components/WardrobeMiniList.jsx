import { Link } from 'react-router-dom';
import { outfitImageUrl } from '../api/client';

export default function WardrobeMiniList({ title, items, emptyText, showWearCount = false }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm font-medium text-gray-500">{title}</p>
      {items.length === 0 && <p className="text-sm text-gray-400">{emptyText}</p>}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/wardrobe/${item.id}`} className="flex items-center gap-3 group">
              <img
                src={outfitImageUrl(item.image_url)}
                alt={item.clothing_name || 'Wardrobe item'}
                className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 group-hover:text-brand-600">
                  {item.clothing_name || 'Untitled item'}
                </p>
                <p className="truncate text-xs text-gray-400">{item.category}</p>
              </div>
              {showWearCount && (
                <span className="flex-shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {item.wear_count}×
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
