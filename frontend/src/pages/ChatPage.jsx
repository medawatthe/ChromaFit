import { useEffect, useRef, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';

export default function ChatPage() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/chat');
        setHistory(data.history);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load chat history.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function handleSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setError('');
    setSending(true);
    const pending = message;
    setMessage('');
    try {
      const { data } = await client.post('/chat', { message: pending });
      setHistory((prev) => [...prev, data.chat]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reach the AI stylist.');
      setMessage(pending);
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">🎙 AI Stylist Chat</h1>

      <div className="flex h-[65vh] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-sm text-gray-500">Loading chat history…</p>}

          {!loading && history.length === 0 && (
            <p className="text-sm text-gray-400">
              Ask me anything — e.g. "What should I wear tomorrow?" or "Do I have a good outfit for an interview?"
            </p>
          )}

          {history.map((entry) => (
            <div key={entry.id} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2 text-sm text-white">
                  {entry.message}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2 text-sm text-gray-800">
                  {entry.response}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 p-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your AI stylist…"
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
