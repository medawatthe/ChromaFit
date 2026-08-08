import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import WardrobeMiniList from '../components/WardrobeMiniList';
import MonthlyUsageChart from '../components/MonthlyUsageChart';
import { useAuth } from '../context/AuthContext';

function sustainabilityLevel(score) {
  if (score >= 70) return { label: 'Excellent — Eco-friendly wardrobe', color: 'text-green-600' };
  if (score >= 40) return { label: 'Good, but can improve', color: 'text-amber-600' };
  return { label: 'Consider reusing outfits more', color: 'text-red-600' };
}

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''} 👋
          </h1>
          <p className="text-sm text-gray-500">Here's how your wardrobe is doing.</p>
        </div>
        <Link
          to="/wardrobe"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add Clothing Item
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Items" value={stats.totals.total_items} />
        <StatCard label="Worn Items" value={stats.totals.worn_items} />
        <StatCard label="Unused Items" value={stats.totals.unused_items} />
        <StatCard
          label="Avg Fashion Score"
          value={stats.avgFashionScore ? stats.avgFashionScore.toFixed(1) : '—'}
          sublabel="out of 10"
        />
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
