
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import client, { outfitImageUrl } from '../api/client';

export default function ChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open || loaded) return;
    async function load() {
      try {
        const { data } = await client.get('/chat');
        setHistory(data.history);
      } catch {
        setError('Failed to load chat history.');
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, [open, loaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, open]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImage(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearImage() {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setError('');
    setSending(true);
    const pendingMessage = message;
    const pendingImage = image;
    setMessage('');
    clearImage();
    try {
      let data;
      if (pendingImage) {
        const formData = new FormData();
        formData.append('message', pendingMessage);
        formData.append('image', pendingImage);
        ({ data } = await client.post('/chat', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }));
      } else {
        ({ data } = await client.post('/chat', { message: pendingMessage }));
      }
      setHistory((prev) => [...prev, data.chat]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reach the AI stylist.');
      setMessage(pendingMessage);
    } finally {
      setSending(false);
    }
  }

  if (location.pathname === '/chat') return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:right-6">
          <div className="flex items-center justify-between border-b border-gray-200 bg-brand-600 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">🤖 ChromaFit AI Stylist</p>
              <Link to="/chat" className="text-xs text-brand-100 hover:underline">
                Open full chat
              </Link>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {!loaded && <p className="text-xs text-gray-500">Loading…</p>}
            {loaded && history.length === 0 && (
              <p className="text-xs text-gray-400">
                Ask me "What should I wear tomorrow?" or attach a photo of an outfit.
              </p>
            )}
            {history.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="flex justify-end">
                  <div className="max-w-[85%] space-y-1.5 rounded-2xl rounded-br-sm bg-brand-600 px-3 py-1.5 text-xs text-white">
                    {entry.image_url && (
                      <img
                        src={outfitImageUrl(entry.image_url)}
                        alt="Attached outfit"
                        className="max-h-32 rounded-lg object-cover"
                      />
                    )}
                    {entry.message && <p>{entry.message}</p>}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-1.5 text-xs text-gray-800">
                    {entry.response}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error && <p className="px-3 pb-1 text-xs text-red-600">{error}</p>}

          {imagePreview && (
            <div className="flex items-center gap-2 border-t border-gray-200 px-3 pt-2">
              <img src={imagePreview} alt="Attachment preview" className="h-10 w-10 rounded-lg object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach a photo"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm text-gray-500 hover:bg-gray-50"
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your stylist…"
              className="flex-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {sending ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition hover:bg-brand-700 sm:right-6"
        aria-label="Toggle AI stylist chat"
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  );
}
