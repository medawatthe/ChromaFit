import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import WardrobeMiniList from '../components/WardrobeMiniList';
import MonthlyUsageChart from '../components/MonthlyUsageChart';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

function sustainabilityLevel(score) {
  if (score >= 70) return { label: 'Excellent — Eco-friendly wardrobe', color: 'text-green-600' };
  if (score >= 40) return { label: 'Good, but can improve', color: 'text-amber-600' };
  return { label: 'Consider reusing outfits more', color: 'text-red-600' };
}

const STYLE_TOOLS = [
  { icon: '🎨', title: 'Color Analysis', description: 'Find your undertone and best colors.', to: '/color-analysis', gradient: 'from-pink-500 to-rose-500' },
  { icon: '🧍', title: 'Body Analysis', description: 'Get styling tips for your body shape.', to: '/body-analysis', gradient: 'from-indigo-500 to-blue-500' },
  { icon: '🖌️', title: 'Color Picker', description: 'Test any color against your palette.', to: '/color-picker', gradient: 'from-fuchsia-500 to-purple-500' },
  { icon: '🔗', title: 'Match Tool', description: 'Find what pairs with an item.', to: '/match-tool', gradient: 'from-cyan-500 to-blue-500' },
  { icon: '💖', title: 'Wishlist', description: 'Track items you want to buy.', to: '/wishlist', gradient: 'from-rose-500 to-pink-500' },
  { icon: '⚖️', title: 'Outfit Comparison', description: 'Compare two items head-to-head.', to: '/outfit-comparison', gradient: 'from-amber-500 to-orange-500' },
  { icon: '💬', title: 'AI Stylist Chat', description: 'Chat with your personal AI stylist.', to: '/chat', gradient: 'from-violet-500 to-brand-500' },
  { icon: '✅', title: 'Outfit Check', description: 'Get an AI rating on any wardrobe item.', to: '/wardrobe', gradient: 'from-emerald-500 to-teal-500' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/outfits/dashboard');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading dashboard…</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-600">{error}</p>
      </Layout>
    );
  }

  const level = sustainabilityLevel(stats.sustainabilityScore);

  return (
    <Layout>
      <PageHeader
        icon="👋"
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ''}`}
        subtitle="Here's how your wardrobe is doing."
        gradient="from-brand-500 to-purple-500"
        action={
          <Link
            to="/wardrobe"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Add Clothing Item
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="👗" label="Total Items" value={stats.totals.total_items} />
        <StatCard icon="✅" label="Worn Items" value={stats.totals.worn_items} />
        <StatCard icon="📦" label="Unused Items" value={stats.totals.unused_items} />
        <StatCard
          icon="⭐"
          label="Avg Fashion Score"
          value={stats.avgFashionScore ? stats.avgFashionScore.toFixed(1) : '—'}
          sublabel="out of 10"
        />
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-gray-500">✨ Style Tools</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STYLE_TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-lg text-white shadow-sm`}
              >
                {tool.icon}
              </div>
              <p className="mt-2 font-semibold text-gray-900">{tool.title}</p>
              <p className="mt-1 text-xs text-gray-500">{tool.description}</p>
              <p className="mt-2 text-xs font-medium text-brand-600 group-hover:underline">Try Now →</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 shadow-sm lg:col-span-1">
          <p className="text-sm font-medium text-gray-500">🌱 Sustainability Score</p>
          <p className="mt-1 text-4xl font-bold text-brand-700">{stats.sustainabilityScore}/100</p>
          <p className={`mt-2 text-sm font-medium ${level.color}`}>{level.label}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
          <p className="mb-3 text-sm font-medium text-gray-500">Top Categories</p>
          {stats.byCategory.length === 0 && <p className="text-sm text-gray-400">No items yet.</p>}
          <ul className="space-y-2">
            {stats.byCategory.map((c) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{c.category}</span>
                <span className="font-semibold text-gray-900">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
          <p className="mb-3 text-sm font-medium text-gray-500">Favorite Colors</p>
          {stats.byColor.length === 0 && <p className="text-sm text-gray-400">No items yet.</p>}
          <ul className="space-y-2">
            {stats.byColor.map((c) => (
              <li key={c.color} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{c.color}</span>
                <span className="font-semibold text-gray-900">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyUsageChart data={stats.monthlyUsage} />
        <WardrobeMiniList
          title="🏆 Most Worn Clothes"
          items={stats.mostWorn}
          emptyText="Mark items worn to see your favorites here."
          showWearCount
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WardrobeMiniList
          title="💤 Least Used Clothes"
          items={stats.leastWorn}
          emptyText="No worn items yet."
          showWearCount
        />
        <WardrobeMiniList
          title="📦 Unused Clothes"
          items={stats.unused}
          emptyText={
            stats.totals.total_items === 0
              ? 'Add items to your wardrobe to see this.'
              : 'Everything in your wardrobe has been worn at least once!'
          }
        />
      </div>
    </Layout>
  );
}
