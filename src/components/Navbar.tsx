import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, Bell, Search, BarChart3, Globe, Camera, Activity, BookOpen, DollarSign, Home } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../logic/useAuthStore';
import { useNotificationStore } from '../logic/useNotificationStore';
import { APP_CONFIG } from '../logic/config';
import { motion, AnimatePresence } from 'framer-motion';

const SEARCH_PAGES = [
  { name: 'Dashboard', path: '/today', desc: 'Real-time air quality overview', icon: Home },
  { name: 'Globe View', path: '/globe', desc: '3D atmospheric visualization', icon: Globe },
  { name: 'Camera AI', path: '/camera', desc: 'AI sky photo PM2.5 sensing', icon: Camera },
  { name: 'Analytics', path: '/analytics', desc: 'Global policy effectiveness rankings', icon: BarChart3 },
  { name: 'Impact Lab', path: '/policy', desc: 'Causal policy analysis (SDID)', icon: Activity },
  { name: 'Pricing', path: '/pricing', desc: 'Mission membership plans', icon: DollarSign },
  { name: 'Resources', path: '/about', desc: 'Data sources & methodology', icon: BookOpen },
  { name: 'Profile Settings', path: '/profile', desc: 'Manage your account', icon: User },
];

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const notifsRef = useRef<HTMLDivElement>(null);
  
  const { user, profile, loading, signOut } = useAuthStore();
const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationStore();

  const searchResults = searchQuery.trim()
    ? SEARCH_PAGES.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_PAGES;

  // Initialize Notifications
  useEffect(() => {
    if (user && !user.is_anonymous) {
      fetchNotifications();
      subscribeToNotifications();
    }
    return () => {
      unsubscribeFromNotifications();
    };
  }, [user, fetchNotifications, subscribeToNotifications, unsubscribeFromNotifications]);

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

  const iconBtnClass = `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
    isGlobe && !scrolled ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-text-dim hover:text-text-main hover:bg-text-main/5'
  }`;

  return (
    <nav className="fixed top-6 left-0 right-0 z-[100] px-6 sm:px-12 flex justify-center">
      <div 
        className={`w-full max-w-7xl flex items-center justify-between px-6 h-16 transition-all duration-700 ${
          scrolled || !isGlobe 
            ? 'glass-island' 
            : 'bg-transparent border-transparent'
        }`}
      >
        {/* Brand & Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-earth-brown rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-105 transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent"></div>
              <span className="material-symbols-outlined text-primary text-2xl relative z-10">eco</span>
            </div>
            <span className={`heading-lg !text-xl tracking-tighter transition-colors ${isGlobe && !scrolled ? 'text-white' : 'text-text-main'}`}>
              {APP_CONFIG.APP_NAME}<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl transition-all relative group text-[11px] font-black uppercase tracking-widest ${
                  location.pathname === link.path 
                    ? (isGlobe && !scrolled ? 'text-white bg-white/10' : 'text-primary bg-primary/5') 
                    : (isGlobe && !scrolled ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-text-dim hover:text-text-main hover:bg-text-main/5')
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="nav-active"
                    className={`absolute bottom-1 left-4 right-4 h-0.5 ${isGlobe && !scrolled ? 'bg-white' : 'bg-primary'}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-1.5">
<button onClick={() => { setShowSearch(true); setShowNotifs(false); }} className={iconBtnClass} title="Search">
            <Search size={18} />
          </button>

          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowSearch(false); }}
              className={`${iconBtnClass} relative`}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#25e2f4]"></span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-80 bg-bg-card border border-white/10 rounded-3xl shadow-2xl py-4 z-50 overflow-hidden"
                >
                  <div className="px-6 py-2 flex items-center justify-between border-b border-text-main/5 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Intelligence Feed</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[9px] font-black text-primary hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-text-dim text-[10px] py-10 font-bold uppercase tracking-widest">No updates found</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`px-6 py-4 flex gap-3 hover:bg-text-main/5 transition-colors cursor-pointer ${n.read ? 'opacity-40' : ''}`}
                          onClick={() => !n.read && markAsRead(n.id)}
                        >
                          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-text-main leading-tight">{n.title}</p>
                            <p className="text-[10px] text-text-dim mt-1 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`h-6 w-px mx-2 ${isGlobe && !scrolled ? 'bg-white/10' : 'bg-text-main/10'}`}></div>

          {loading ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
            </div>
          ) : user && !user.is_anonymous ? (
            <div className="relative group h-10 flex items-center gap-3 pl-2 pr-1 rounded-xl hover:bg-text-main/5 transition-colors cursor-pointer">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isGlobe && !scrolled ? 'text-white' : 'text-text-main'}`}>
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="text-[7px] font-black text-primary uppercase tracking-tighter">
                  {profile?.plan || 'Member'}
                </span>
              </div>
              
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden shadow-sm">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>

              <div className="absolute top-full right-0 mt-3 w-52 bg-bg-card backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2 z-50 translate-y-2 group-hover:translate-y-0">
                <div className="px-4 py-2 border-b border-text-main/5 mb-1">
                  <p className="text-[9px] font-black text-text-main truncate">{user.email}</p>
                </div>
                <Link to="/profile" className="w-full px-4 py-2 text-left text-[10px] font-black text-text-dim hover:text-text-main hover:bg-text-main/5 transition-colors flex items-center gap-3">
                  <User size={14} className="text-primary" /> Settings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-[10px] font-black text-red-500 hover:bg-red-500/5 transition-colors flex items-center gap-3"
                >
                  <LogOut size={14} /> {t('NAV.SIGN_OUT')}
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="btn-main !h-10 !px-6 !py-0 flex items-center gap-2 !text-[10px]"
            >
              <User size={14} />
              {t('NAV.SIGN_IN')}
            </Link>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-text-main/5 transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Search Overlay & Mobile Menu (remain largely unchanged in logic, just updated dimensions) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-bg-base/80 backdrop-blur-xl flex items-start justify-center pt-32 px-6"
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="w-full max-w-xl bg-bg-card border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 p-5 border-b border-text-main/10">
                <Search size={18} className="text-primary" />
                <input
                  autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Intelligence Search..."
                  className="flex-1 bg-transparent outline-none text-text-main placeholder:text-text-dim font-bold text-sm"
                />
                <kbd className="text-[9px] text-text-dim border border-text-main/10 px-2 py-1 rounded-lg font-black uppercase">ESC</kbd>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                {searchResults.map(page => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => { navigate(page.path); setShowSearch(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-text-main/5 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-text-main/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10">
                        <Icon size={18} className="text-text-dim group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-text-main uppercase tracking-widest">{page.name}</p>
                        <p className="text-[10px] text-text-dim font-medium">{page.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-6 right-6 bg-bg-card backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 lg:hidden shadow-2xl z-50"
          >
            <div className="flex flex-col gap-6">
              {links.map((link) => (
                <Link
                  key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                  className={`text-sm font-black uppercase tracking-[0.2em] ${location.pathname === link.path ? 'text-primary' : 'text-text-dim'}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-text-main/5 w-full"></div>
              {(!user || user.is_anonymous) && (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="btn-main p-4 text-center text-xs font-black uppercase">
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
