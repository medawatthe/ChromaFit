export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 420"
      className="mx-auto w-full max-w-sm drop-shadow-xl"
      role="img"
      aria-label="Illustration of a digital wardrobe with AI-powered outfit suggestions"
    >
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fdf2f8" />
        </linearGradient>
        <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#a21caf" />
        </linearGradient>
      </defs>

      {/* Phone / app frame */}
      <rect x="60" y="20" width="300" height="380" rx="36" fill="url(#cardGrad)" stroke="#f3d9ee" strokeWidth="2" />

      {/* Status bar dot */}
      <circle cx="210" cy="50" r="4" fill="#d946ef" />

      {/* Wardrobe grid backgrounds */}
      <rect x="88" y="80" width="108" height="108" rx="18" fill="#3b82f6" />
      <rect x="224" y="80" width="108" height="108" rx="18" fill="#f472b6" />
      <rect x="88" y="216" width="108" height="108" rx="18" fill="#22c55e" />
      <rect x="224" y="216" width="108" height="108" rx="18" fill="#f97316" />

      {/* T-shirt icon (blue swatch) */}
      <g transform="translate(142,134)">
        <path
          d="M-27,-30 L-9,-42 L9,-42 L27,-30 L38,-10 L23,3 L15,-6 L15,36 L-15,36 L-15,-6 L-23,3 L-38,-10 Z"
          fill="white"
        />
        <ellipse cx="0" cy="-38" rx="9" ry="5" fill="#3b82f6" />
      </g>

      {/* Dress icon (pink swatch) */}
      <g transform="translate(278,134)">
        <path d="M-12,-40 L-8,-46 L8,-46 L12,-40 L9,-16 L28,36 L-28,36 L-9,-16 Z" fill="white" />
        <ellipse cx="0" cy="-42" rx="7" ry="4" fill="#f472b6" />
      </g>

      {/* Jeans icon (green swatch) */}
      <g transform="translate(142,270)">
        <path
          d="M-22,-38 H22 V-10 L14,-10 L11,36 H-2 L-4,4 L-6,36 H-19 L-22,-10 Z"
          fill="white"
        />
      </g>

      {/* Jacket icon (orange swatch) */}
      <g transform="translate(278,270)">
        <path
          d="M-27,-30 L-9,-42 L9,-42 L27,-30 L38,-10 L23,3 L15,-6 L15,36 L-15,36 L-15,-6 L-23,3 L-38,-10 Z"
          fill="white"
        />
        <line x1="0" y1="-32" x2="0" y2="34" stroke="#f97316" strokeWidth="4" />
        <ellipse cx="0" cy="-38" rx="9" ry="5" fill="#f97316" />
      </g>

      {/* Bottom label bar */}
      <rect x="88" y="344" width="244" height="14" rx="7" fill="#f3d9ee" />
      <rect x="88" y="366" width="160" height="10" rx="5" fill="#f3d9ee" />

      {/* Floating AI badge */}
      <circle cx="352" cy="330" r="46" fill="url(#badgeGrad)" stroke="white" strokeWidth="6" />
      <text x="352" y="325" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">AI</text>
      <text x="352" y="343" textAnchor="middle" fontSize="9" fill="white" opacity="0.9">STYLIST</text>

      {/* Sparkle accents */}
      <path d="M46 200 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" fill="#facc15" />
      <path d="M372 70 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#facc15" />
    </svg>
  );
}
