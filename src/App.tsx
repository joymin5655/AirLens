import { useLocation, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import GlobeView from './pages/GlobeView';
import PolicyView from './pages/PolicyView';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import CameraAI from './pages/CameraAI';
import About from './pages/About';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base gap-4">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    <p className="text-label text-primary">Atmospheric Decoding...</p>
  </div>
);

// Public Layout with Navbar and Footer (no auth required)
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen bg-bg-base transition-colors duration-500">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Common Layout with Navbar and Footer
const AppLayout = () => {
  const location = useLocation();
  const isGlobe = location.pathname === '/globe';

  return (
    <div className="flex flex-col min-h-screen bg-bg-base transition-colors duration-500">
      <Navbar />
      <main className={`flex-1 ${isGlobe ? '' : 'pt-20'}`}>
        <Outlet />
      </main>
      {!isGlobe && <Footer />}
    </div>
  );
};

function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Root → landing page */}
            <Route path="/" element={<Navigate to="/about" replace />} />

            {/* Public pages with Navbar/Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            </Route>

            {/* Auth – standalone, no layout */}
            <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />

            {/* SaaS Protected App Shell */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/today" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/globe" element={<PageTransition><GlobeView /></PageTransition>} />
              <Route path="/policy" element={<PageTransition><PolicyView /></PageTransition>} />
              <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
              <Route path="/camera" element={<PageTransition><CameraAI /></PageTransition>} />
              <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
            </Route>

            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Suspense>
  );
}

export default App;
