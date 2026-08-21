import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import SwirlBackground from './SwirlBackground';

export default function PublicLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-brand-50/60 via-white to-blue-50/50">
      <SwirlBackground />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
