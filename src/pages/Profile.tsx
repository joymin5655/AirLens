import { useState } from 'react';
import { User, LogOut, Mail, Shield, Camera, Calendar, Edit2, Check, X, Sparkles, ArrowRight, Sun, Moon, Monitor, Globe, Trash2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../logic/useAuthStore';
import { useThemeStore } from '../logic/useThemeStore';
import { supabase } from '../logic/supabase';
import { APP_CONFIG } from '../logic/config';

const Profile = () => {
  const { user, isAdmin, isAnonymous, setUser, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setNameLoading(true);
    setNameError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: nameInput.trim() }
      });
      if (error) throw error;
      if (data.user) setUser(data.user);
      setEditingName(false);
    } catch (err: unknown) {
      setNameError(err instanceof Error ? err.message : String(err));
    } finally {
      setNameLoading(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This will reset your theme and language preferences.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const joinedAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // Anonymous user — show upgrade CTA only
  if (isAnonymous) {
    return (
      <div className="pt-28 pb-24 max-w-2xl mx-auto px-6 transition-colors duration-500">
        <Helmet>
          <title>Profile | AirLens</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="narrative-card p-10 space-y-8 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xl">
              <Sparkles size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="heading-lg text-2xl">Using Temporary Account</h1>
              <p className="text-text-dim text-sm mt-1">Measurements are stored locally in this browser.</p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            {[
              'Permanent measurement history',
              'Cross-device data synchronization',
              'Personalized air quality reports',
              'Policy bookmarks & alerts',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                <Check size={14} className="text-primary shrink-0" />
                <span className="text-sm font-semibold text-text-main">{item}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/auth')}
              className="btn-main w-full py-4 flex items-center justify-center gap-2"
            >
              Create Free Account <ArrowRight size={16} />
            </button>
            <button
              onClick={handleSignOut}
              className="w-full py-3 text-text-dim hover:text-text-main text-label transition-colors"
            >
              Continue later
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-2xl mx-auto px-6 transition-colors duration-500">
      <Helmet>
        <title>Profile Settings | AirLens</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="narrative-card p-10 space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shadow-xl">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    className="flex-1 bg-bg-base border border-primary/30 rounded-xl px-3 py-1.5 text-sm font-black text-text-main outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={handleSaveName} disabled={nameLoading} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => { setEditingName(false); setNameError(null); }} className="p-1.5 rounded-lg hover:bg-text-main/10 text-text-dim transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="heading-lg truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </h1>
                  <button
                    onClick={() => { setEditingName(true); setNameInput(user.user_metadata?.full_name || user.email?.split('@')[0] || ''); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-text-main/10 text-text-dim transition-all"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
              {nameError && <p className="text-[10px] text-red-500 mt-1">{nameError}</p>}
              <span className="text-label text-primary">
                {isAdmin ? 'Atmospheric Manager' : 'Climate Observer'}
              </span>
            </div>
          </div>

          {/* Info Fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
              <Mail size={16} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Email</p>
                <p className="text-sm font-semibold text-text-main">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
              <Shield size={16} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Account Type</p>
                <p className="text-sm font-semibold text-text-main">{isAdmin ? 'Administrator' : 'Standard Member'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl border border-primary/20">
              <Camera size={16} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Plan</p>
                <p className="text-sm font-semibold text-text-main">Free — 3 Camera AI measurements/day</p>
              </div>
              <button onClick={() => navigate('/pricing')} className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest">Upgrade</button>
            </div>

            {joinedAt && (
              <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
                <Calendar size={16} className="text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Member Since</p>
                  <p className="text-sm font-semibold text-text-main">{joinedAt}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Preferences — Migrated from settings.html */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="narrative-card p-10 space-y-8"
        >
          <h2 className="heading-lg !text-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">tune</span>
            User Preferences
          </h2>

          <div className="space-y-6">
            {/* Appearance */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Appearance</h3>
                  <p className="text-[10px] text-text-dim">Choose your preferred visual theme</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-1 bg-text-main/5 rounded-2xl">
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'system', icon: Monitor, label: 'System' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as 'light' | 'dark' | 'system')}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                      theme === item.id 
                        ? 'bg-bg-card text-primary shadow-sm border border-primary/20' 
                        : 'text-text-dim hover:text-text-main hover:bg-bg-card/50'
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Language</h3>
                  <p className="text-[10px] text-text-dim">Interface and data translation</p>
                </div>
                <Globe size={16} className="text-primary" />
              </div>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="w-full bg-text-main/5 border border-text-main/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-text-main outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
              >
                <option value="en">English</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Data & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="narrative-card p-10 space-y-8"
        >
          <h2 className="heading-lg !text-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">lock</span>
            Data & Privacy
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex items-start gap-4">
              <Trash2 size={20} className="text-red-500 shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-sm font-black text-text-main uppercase tracking-widest">Clear Cache</h4>
                <p className="text-[10px] text-text-dim mt-1 leading-relaxed">
                  Permanently delete local storage, including theme settings and cached air quality data. 
                  This will not delete your account from Supabase.
                </p>
                <button
                  onClick={handleClearData}
                  className="mt-3 text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest"
                >
                  Confirm and Clear Data
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-4">
              <Info size={20} className="text-blue-500 shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-sm font-black text-text-main uppercase tracking-widest">Privacy Policy</h4>
                <p className="text-[10px] text-text-dim mt-1">Your measurements are processed locally or in your private vault.</p>
                <button className="mt-3 text-[10px] font-black text-blue-500 hover:underline uppercase tracking-widest">Read Full Policy</button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-text-main/10">
            <button
              onClick={handleSignOut}
              className="w-full py-4 flex items-center justify-center gap-3 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all text-label font-black border border-red-500/10"
            >
              <LogOut size={16} /> Sign Out from {APP_CONFIG.APP_NAME}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[10px] text-text-dim font-black uppercase tracking-[0.3em] opacity-40">
          Atmospheric Decoded · v1.1.0 Stable
        </p>
      </div>
    </div>
  );
};

export default Profile;
