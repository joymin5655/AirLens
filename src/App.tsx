import { useLocation, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, Suspense } from 'react';
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
import { supabase } from './logic/supabase';
import { useAuthStore } from './logic/useAuthStore';
import { useThemeStore, applyTheme } from './logic/useThemeStore';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base gap-4">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    <p className="text-label text-primary">Atmospheric Decoding...</p>
  </div>
);

function App() {
  const location = useLocation();
  const isGlobe = location.pathname === '/globe';
  
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const signInAnonymously = useAuthStore((state) => state.signInAnonymously);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // 0. Initialize Theme
    applyTheme(theme);

    // 1. Initial Session Check — no session → anonymous login
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          await signInAnonymously();
        }
      } catch (err) {
        console.error('Initial Auth Error:', err);
        setLoading(false);
      }
    };
    initAuth();

    // 2. Continuous State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, signInAnonymously, theme]);

  return (
    <Suspense fallback={<PageLoader />}>
      <div className="flex flex-col min-h-screen bg-bg-base transition-colors duration-500">
        <Navbar />
        <main className={`flex-1 ${isGlobe ? '' : 'pt-20'}`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
              <Route path="/globe" element={<PageTransition><GlobeView /></PageTransition>} />
              <Route path="/policy" element={<PageTransition><PolicyView /></PageTransition>} />
              <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
              <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
              <Route path="/camera" element={<PageTransition><CameraAI /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
              <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
        {!isGlobe && <Footer />}
      </div>
    </Suspense>
  );
}

export default App;
