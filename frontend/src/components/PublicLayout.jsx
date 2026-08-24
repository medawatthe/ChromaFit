import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import SwirlBackground from './SwirlBackground';

export default function PublicLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-900 to-blue-950">
      <SwirlBackground />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
