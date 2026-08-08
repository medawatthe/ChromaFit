import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
