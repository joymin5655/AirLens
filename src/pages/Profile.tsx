import { useState } from 'react';
import { User, LogOut, Mail, Shield, Edit2, Check, X, Globe, Trash2, CreditCard, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../logic/useAuthStore';
import { supabase } from '../logic/supabase';
import { APP_CONFIG } from '../logic/config';

const Profile = () => {
  const { user, profile, fetchProfile, signOut, isPro, isAdmin } = useAuthStore();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!nameInput.trim() || !user) return;
    if (nameInput.trim().length > 100) return;
    setNameLoading(true);
    setNameError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: nameInput.trim() })
        .eq('id', user.id);
      
      if (error) throw error;
      await fetchProfile(user.id);
      setEditingName(false);
    } catch (err: unknown) {
      setNameError(err instanceof Error ? err.message : String(err));
    } finally {
      setNameLoading(false);
    }
  };

  const handleClearData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  if (!user || !profile) return null;

  return (
    <div className="pt-28 pb-24 max-w-2xl mx-auto px-6 transition-colors duration-500">
      <Helmet>
        <title>Settings | AirLens Intelligence</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="narrative-card p-10 space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-xl">
              {profile.avatar_url && /^https?:\/\//i.test(profile.avatar_url) ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
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
                    maxLength={100}
                    className="flex-1 bg-bg-base border border-primary/30 rounded-xl px-3 py-1.5 text-sm font-black text-text-main outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={handleSaveName} disabled={nameLoading} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                    {nameLoading ? <X size={14} className="animate-pulse" /> : <Check size={14} />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="heading-lg truncate">
                    {profile.full_name || 'Climate Observer'}
                  </h1>
                  <button
                    onClick={() => { setEditingName(true); setNameInput(profile.full_name || ''); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-text-main/10 text-text-dim transition-all"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
              {nameError && <p className="text-[10px] text-red-500 mt-1">{nameError}</p>}
              <span className="text-label text-primary">
                {isAdmin() ? 'Atmospheric Manager' : 'Verified Member'}
              </span>
            </div>
          </div>

          {/* Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
              <Mail size={16} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Email</p>
                <p className="text-xs font-semibold text-text-main truncate">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
              <Shield size={16} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Role</p>
                <p className="text-xs font-semibold text-text-main uppercase">{profile.role}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subscription & Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="narrative-card p-10 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="heading-lg !text-xl flex items-center gap-3">
              <CreditCard size={20} className="text-primary" />
              Subscription Plan
            </h2>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPro() ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-text-main/10 text-text-dim'}`}>
              {profile.plan === 'Free' ? 'Free · 광고 포함' : profile.plan === 'Plus' ? 'Plus ✓' : 'Pro ✓'}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl border border-primary/20 relative overflow-hidden group">
            <Sparkles className="absolute -right-4 -top-4 text-primary/10 group-hover:scale-110 transition-transform duration-700" size={120} />
            <div className="relative z-10">
              <h3 className="text-lg font-black text-text-main mb-1">
                {profile.plan === 'Free' ? '광고 없이 더 쾌적하게' : profile.plan === 'Plus' ? '광고 없는 프리미엄 환경' : '연구자 전용 플랜'}
              </h3>
              <p className="text-xs text-text-dim leading-relaxed mb-4 max-w-sm">
                {profile.plan === 'Free'
                  ? 'Plus로 업그레이드하면 카메라 측정도 무제한이에요.'
                  : profile.plan === 'Plus'
                  ? '광고 없는 프리미엄 환경에서 AirLens를 사용하고 있어요.'
                  : '연구자 전용 분석 도구를 모두 사용할 수 있어요.'}
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-main !py-2.5 !px-6 !text-[11px] shadow-lg shadow-primary/20"
              >
                {profile.plan === 'Free' ? 'View Pricing' : 'Manage Subscription'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="narrative-card p-10 space-y-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Language */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-primary" />
                <h3 className="text-xs font-black text-text-main uppercase tracking-widest">Language</h3>
              </div>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="w-full bg-text-main/5 border border-text-main/10 rounded-xl px-4 py-2 text-xs font-bold text-text-main outline-none appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>

          <div className="pt-8 border-t border-text-main/10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={signOut}
              className="flex-1 py-4 flex items-center justify-center gap-3 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all text-xs font-black border border-red-500/10"
            >
              <LogOut size={16} /> Sign Out
            </button>
            <button
              onClick={handleClearData}
              onBlur={() => setConfirmClear(false)}
              className={`px-6 py-4 flex items-center justify-center gap-3 transition-all text-xs font-black ${confirmClear ? 'text-red-500 hover:text-red-400' : 'text-text-dim hover:text-text-main'}`}
            >
              <Trash2 size={16} /> {confirmClear ? 'Confirm Clear?' : 'Clear Cache'}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[10px] text-text-dim font-black uppercase tracking-[0.3em] opacity-40">
          AirLens Intelligence · {APP_CONFIG.APP_NAME} v1.9.0
        </p>
      </div>
    </div>
  );
};

export default Profile;
