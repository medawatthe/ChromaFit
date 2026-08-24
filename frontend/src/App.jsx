import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WardrobePage from './pages/WardrobePage';
import WardrobeItemPage from './pages/WardrobeItemPage';
import AnalysisPage from './pages/AnalysisPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import ColorAnalysisPage from './pages/ColorAnalysisPage';
import BodyAnalysisPage from './pages/BodyAnalysisPage';
import ColorPickerPage from './pages/ColorPickerPage';
import MatchToolPage from './pages/MatchToolPage';
import WishlistPage from './pages/WishlistPage';
import OutfitComparisonPage from './pages/OutfitComparisonPage';
import SettingsPage from './pages/SettingsPage';

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <HomePage />;
}

function ThemeSync() {
  const { user } = useAuth();
  const { syncFromUser } = useTheme();
  useEffect(() => {
    if (user) syncFromUser(user);
  }, [user, syncFromUser]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemeSync />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/wardrobe" element={<ProtectedRoute><WardrobePage /></ProtectedRoute>} />
          <Route path="/wardrobe/:id" element={<ProtectedRoute><WardrobeItemPage /></ProtectedRoute>} />
          <Route path="/wardrobe/:id/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/color-analysis" element={<ProtectedRoute><ColorAnalysisPage /></ProtectedRoute>} />
          <Route path="/body-analysis" element={<ProtectedRoute><BodyAnalysisPage /></ProtectedRoute>} />
          <Route path="/color-picker" element={<ProtectedRoute><ColorPickerPage /></ProtectedRoute>} />
          <Route path="/match-tool" element={<ProtectedRoute><MatchToolPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/outfit-comparison" element={<ProtectedRoute><OutfitComparisonPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
