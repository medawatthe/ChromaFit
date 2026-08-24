import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import HeroIllustration from '../components/HeroIllustration';

const FEATURES = [
  {
    icon: '👗',
    title: 'Smart Wardrobe',
    description: 'Upload your clothes once and keep a searchable digital closet — category, color, brand, season, and more.',
    to: '/wardrobe',
  },
  {
    icon: '🤖',
    title: 'AI Outfit Analysis',
    description: 'Get a fashion score, color harmony rating, and skin-tone match for any item, powered by AI vision.',
    to: '/wardrobe',
  },
  {
    icon: '💬',
    title: 'AI Stylist Chatbot',
    description: 'Ask "What should I wear today?" and get context-aware advice based on your actual wardrobe.',
    to: '/chat',
  },
  {
    icon: '🌱',
    title: 'Sustainability Score',
    description: 'See how much of your wardrobe you actually use, and get nudged to rewear instead of rebuy.',
    to: '/dashboard',
  },
  {
    icon: '🎨',
    title: 'Color Analysis',
    description: 'Upload a photo and discover your undertone, seasonal palette, and best-fit colors.',
    to: '/color-analysis',
  },
  {
    icon: '🧍',
    title: 'Body Analysis',
    description: 'Get AI-powered insights on your body shape and personalized styling tips.',
    to: '/body-analysis',
  },
  {
    icon: '🖌️',
    title: 'Color Picker',
    description: 'Test any color against your palette and instantly see if it works for you.',
    to: '/color-picker',
  },
  {
    icon: '🔗',
    title: 'Match Tool',
    description: 'Pick an item and let AI find what pairs best with it from your wardrobe.',
    to: '/match-tool',
  },
  {
    icon: '💖',
    title: 'Wishlist',
    description: 'Track the items you want to buy next, with prices, brands, and notes.',
    to: '/wishlist',
  },
  {
    icon: '⚖️',
    title: 'Outfit Comparison',
    description: 'Compare two items head-to-head and let AI pick the winner for any occasion.',
    to: '/outfit-comparison',
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-20">
        <div
          className="animate-blob-1 pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand-500 opacity-60 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="animate-blob-2 pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-500 opacity-50 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="animate-blob-3 pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-400 opacity-50 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Your wardrobe, <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">styled by AI</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              ChromaFit analyzes your clothes, tracks what you actually wear, and gives you
              personalized, AI-powered styling advice — so getting dressed stops being a daily chore.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                to="/register"
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Get Started Free
              </Link>
              <Link
                to="/about"
                className="rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Learn More
              </Link>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-white">Everything you need to dress smarter</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{f.description}</p>
              {f.to && (
                <Link to={f.to} className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
                  Try Now →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 px-4 py-14">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="text-2xl font-bold">Ready to see what's really in your closet?</h2>
          <p className="mt-2 text-brand-100">Create a free account and upload your first item in under a minute.</p>
          <Link
            to="/register"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
