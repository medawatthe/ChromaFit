import Navbar from './Navbar';
import ChatWidget from './ChatWidget';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <ChatWidget />
    </div>
  );
}
