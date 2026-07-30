import { Link } from 'react-router-dom';
import { outfitImageUrl } from '../api/client';

export default function OutfitCard({ outfit }) {
  return (
    <Link
      to={`/wardrobe/${outfit.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={outfitImageUrl(outfit.image_url)}
          alt={outfit.clothing_name || 'Wardrobe item'}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="truncate font-medium text-gray-900">{outfit.clothing_name || 'Untitled item'}</p>
        <p className="truncate text-xs text-gray-500">
          {[outfit.category, outfit.color].filter(Boolean).join(' · ') || 'No details yet'}
        </p>
      </div>
    </Link>
  );
}
