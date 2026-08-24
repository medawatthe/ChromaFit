import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, messagesRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/users'),
        client.get('/admin/contact-messages'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setMessages(messagesRes.data.messages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleRoleToggle(targetUser) {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setBusyId(targetUser.id);
    try {
      await client.put(`/admin/users/${targetUser.id}/role`, { role: nextRole });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: nextRole } : u)));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(targetUser) {
    if (!window.confirm(`Delete account "${targetUser.username}"? This cannot be undone.`)) return;
    setBusyId(targetUser.id);
    try {
      await client.delete(`/admin/users/${targetUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Layout>
      <Link to="/dashboard" className="mb-4 inline-block text-sm text-brand-600 hover:underline">
        ← Back to Dashboard
      </Link>
      <PageHeader
        icon="🛡️"
        title="Admin"
        subtitle="Site-wide stats, user management, and contact messages."
        gradient="from-slate-700 to-blue-900"
      />

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {loading && <p className="text-blue-100">Loading admin data…</p>}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            <StatCard icon="👥" label="Users" value={stats.totalUsers} />
            <StatCard icon="👗" label="Wardrobe Items" value={stats.totalOutfits} />
            <StatCard icon="🤖" label="AI Analyses" value={stats.totalAnalyses} />
            <StatCard icon="💬" label="Chat Messages" value={stats.totalChats} />
            <StatCard icon="💖" label="Wishlist Items" value={stats.totalWishlistItems} />
            <StatCard icon="✉️" label="Contact Messages" value={stats.totalContactMessages} />
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                    <th className="pb-2 pr-4">Username</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Items</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 font-medium text-gray-900">{u.username}</td>
                      <td className="py-2 pr-4 text-gray-600">{u.email}</td>
                      <td className="py-2 pr-4 text-gray-600">{u.item_count}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRoleToggle(u)}
                            disabled={busyId === u.id || u.id === currentUser?.id}
                            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={busyId === u.id || u.id === currentUser?.id}
                            className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Contact Messages</h2>
            {messages.length === 0 && <p className="text-sm text-gray-400">No messages yet.</p>}
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      {m.name} <span className="font-normal text-gray-500">· {m.email}</span>
                    </p>
                    <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
