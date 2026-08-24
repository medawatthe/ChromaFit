import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';
import SwirlBackground from './SwirlBackground';

export default function Layout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-900 to-blue-950">
      <SwirlBackground />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
