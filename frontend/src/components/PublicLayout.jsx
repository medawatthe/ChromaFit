import PublicNavbar from './PublicNavbar';
import Footer from './Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
