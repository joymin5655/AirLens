import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, ChevronDown, Bell, Search, Sun, Moon, BarChart3, Globe, Camera, Activity, Zap, BookOpen, DollarSign, Home } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../logic/useAuthStore';
import { useThemeStore } from '../logic/useThemeStore';
import { APP_CONFIG } from '../logic/config';
import { motion, AnimatePresence } from 'framer-motion';

const SEARCH_PAGES = [
  { name: 'Dashboard', path: '/', desc: 'Real-time air quality overview', icon: Home },
  { name: 'Globe View', path: '/globe', desc: '3D atmospheric visualization', icon: Globe },
  { name: 'Camera AI', path: '/camera', desc: 'AI sky photo PM2.5 sensing', icon: Camera },
  { name: 'Analytics', path: '/analytics', desc: 'Global policy effectiveness rankings', icon: BarChart3 },
  { name: 'Impact Lab', path: '/policy', desc: 'Causal policy analysis (SDID)', icon: Activity },
  { name: 'Pricing', path: '/pricing', desc: 'Mission membership plans', icon: DollarSign },
  { name: 'Resources', path: '/about', desc: 'Data sources & methodology', icon: BookOpen },
  { name: 'Profile Settings', path: '/profile', desc: 'Manage your account', icon: User },
];

const MOCK_NOTIFS = [
  { id: 1, title: 'Policy Data Updated', msg: 'South Korea Q4 2024 atmospheric dataset synced', time: '2h ago', read: false },
  { id: 2, title: 'PM2.5 Alert', msg: 'Beijing exceeds WHO daily limit — 89.4 µg/m³ detected', time: '5h ago', read: false },
  { id: 3, title: 'Matrix Refreshed', msg: 'Global Analytics Matrix updated (66 nodes active)', time: '1d ago', read: true },
  { id: 4, title: 'Camera AI Result', msg: 'Last sky scan: Grade A · 12.3 µg/m³ estimated', time: '2d ago', read: true },
];

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const location = useLocation();
  const navigate = useNavigate();
  const notifsRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, loading, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const unreadCount = notifs.filter(n => !n.read).length;
  const searchResults = searchQuery.trim()
    ? SEARCH_PAGES.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_PAGES;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowSearch(false); setShowNotifs(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { name: t('NAV.STORY'), path: '/' },
    { name: t('NAV.GLOBE'), path: '/globe' },
    { name: 'Camera AI', path: '/camera' },
    { name: 'Analytics', path: '/analytics' },
    { name: t('NAV.IMPACT'), path: '/policy' },
    { name: 'Pricing', path: '/pricing' },
    { name: t('NAV.RESOURCES'), path: '/about' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const isGlobe = location.pathname === '/globe';

  return (
    <nav 
      className={`fixed top-6 left-0 right-0 z-[100] transition-all duration-700 px-6 sm:px-12 flex justify-center`}
    >
      <div 
        className={`w-full max-w-7xl flex items-center justify-between px-6 py-3 transition-all duration-700 ${
          scrolled || !isGlobe 
            ? 'glass-island py-2' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-earth-brown rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent"></div>
              <span className="material-symbols-outlined text-primary text-2xl relative z-10">eco</span>
            </div>
            <span className={`heading-lg !text-2xl transition-colors ${isGlobe && !scrolled ? 'text-white' : 'text-text-main'}`}>
              {APP_CONFIG.APP_NAME}<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2.5 rounded-2xl transition-all relative group text-label ${
                  location.pathname === link.path 
                    ? (isGlobe && !scrolled ? 'text-white bg-white/10' : 'text-text-main bg-text-main/5') 
                    : (isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-text-dim hover:text-text-main hover:bg-text-main/5')
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="nav-active"
                    className={`absolute bottom-0.5 left-5 right-5 h-0.5 ${isGlobe && !scrolled ? 'bg-white' : 'bg-primary'}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl transition-all ${isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-text-dim hover:text-text-main hover:bg-text-main/5'}`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => { setShowSearch(true); setShowNotifs(false); }}
            className={`p-2.5 rounded-2xl transition-all ${isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-text-dim hover:text-text-main hover:bg-text-main/5'}`}
          >
            <Search size={18} />
          </button>

          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowSearch(false); }}
              className={`p-2.5 rounded-2xl transition-all relative ${isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-text-dim hover:text-text-main hover:bg-text-main/5'}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#25e2f4]"></span>
              )}
            </button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-4 w-80 bg-bg-card border border-white/20 rounded-[32px] shadow-2xl py-4 z-50"
                >
                  <div className="px-6 py-3 flex items-center justify-between border-b border-text-main/10">
                    <span className="text-label">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))}
                        className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-text-main/5">
                    {notifs.map(n => (
                      <div
                        key={n.id}
                        className={`px-6 py-4 flex gap-3 hover:bg-text-main/5 transition-colors cursor-pointer ${n.read ? 'opacity-50' : ''}`}
                        onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                      >
                        <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary shadow-[0_0_6px_#25e2f4]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-text-main">{n.title}</p>
                          <p className="text-[10px] text-text-dim mt-0.5 leading-relaxed">{n.msg}</p>
                          <p className="text-[9px] text-text-dim/50 mt-1 uppercase tracking-widest font-bold">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`h-6 w-px mx-3 ${isGlobe && !scrolled ? 'bg-white/10' : 'bg-text-main/10'}`}></div>

          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
          ) : user ? (
            <div className="relative group flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isGlobe && !scrolled ? 'text-white' : 'text-text-main'}`}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <span className={`text-[7px] font-bold uppercase tracking-tighter ${isGlobe && !scrolled ? 'text-primary/70' : 'text-primary'}`}>
                  {isAdmin ? 'Atmospheric Manager' : 'Climate Observer'}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-primary font-black shadow-xl overflow-hidden group-hover:scale-110 transition-all duration-500">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>

              <div className="absolute top-full right-0 mt-4 w-56 bg-bg-card backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 py-3 z-50 translate-y-2 group-hover:translate-y-0">
                <div className="px-5 py-3 mb-2">
                  <p className="text-[10px] font-black text-text-main truncate leading-tight">{user.email}</p>
                  <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest mt-1">v1.1 Stable Account</p>
                </div>
                <Link to="/profile" className="w-full px-5 py-2.5 text-left text-[10px] font-black text-text-dim hover:bg-text-main/5 hover:text-text-main transition-colors flex items-center gap-3">
                  <User size={14} className="text-primary" /> Profile Settings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full px-5 py-2.5 text-left text-[10px] font-black text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <LogOut size={14} /> {t('NAV.SIGN_OUT')}
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="btn-main px-7 py-3 flex items-center gap-2"
            >
              <User size={16} />
              {t('NAV.SIGN_IN')}
            </Link>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`lg:hidden p-2.5 rounded-2xl transition-all ${isGlobe && !scrolled ? 'text-white hover:bg-white/10' : 'text-text-main hover:bg-text-main/5'}`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-bg-base/80 backdrop-blur-xl flex items-start justify-center pt-32 px-6"
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-bg-card border border-white/20 rounded-[32px] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 p-5 border-b border-text-main/10">
                <Search size={18} className="text-primary flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search pages, features..."
                  className="flex-1 bg-transparent outline-none text-text-main placeholder:text-text-dim font-medium text-sm"
                />
                <kbd className="text-[10px] text-text-dim border border-text-main/10 px-2 py-1 rounded-lg font-mono hidden sm:block">ESC</kbd>
              </div>
              <div className="p-3 max-h-80 overflow-y-auto">
                {searchResults.map(page => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => { navigate(page.path); setShowSearch(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-text-main/5 text-left transition-colors group"
                    >
                      <div className="w-9 h-9 bg-text-main/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                        <Icon size={16} className="text-text-dim group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-text-main">{page.name}</p>
                        <p className="text-[10px] text-text-dim">{page.desc}</p>
                      </div>
                      <Zap size={12} className="ml-auto text-text-dim/20 group-hover:text-primary/40 transition-colors" />
                    </button>
                  );
                })}
                {searchResults.length === 0 && (
                  <p className="text-center text-text-dim text-sm py-8 font-medium">No results for "{searchQuery}"</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-28 left-6 right-6 bg-bg-card backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 lg:hidden shadow-[0_32px_64px_rgba(0,0,0,0.15)] z-50"
          >
            <div className="flex flex-col gap-8 text-label">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between group transition-colors ${location.pathname === link.path ? 'text-text-main' : 'hover:text-text-main'}`}
                >
                  {link.name}
                  <ChevronDown size={14} className="-rotate-90 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
              <div className="h-px bg-text-main/10 w-full my-2"></div>
              {!user && (
                <Link 
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="btn-main p-5 text-center"
                >
                  {t('NAV.SIGN_IN')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
