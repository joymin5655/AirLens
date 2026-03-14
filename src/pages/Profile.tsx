import { useState } from 'react';
import { User, LogOut, Mail, Shield, Camera, Calendar, Edit2, Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../logic/useAuthStore';
import { supabase } from '../logic/supabase';

const Profile = () => {
  const { user, isAdmin, isAnonymous, setUser, signOut } = useAuthStore();
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
              <h1 className="heading-lg text-2xl">임시 계정 이용 중</h1>
              <p className="text-text-dim text-sm mt-1">현재 측정 데이터는 브라우저에만 저장됩니다</p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            {[
              '측정 기록 영구 보관',
              '기기 간 데이터 동기화',
              '개인화 대기질 리포트',
              '정책 즐겨찾기 & 알림',
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
              무료로 계정 만들기 <ArrowRight size={16} />
            </button>
            <button
              onClick={handleSignOut}
              className="w-full py-3 text-text-dim hover:text-text-main text-label transition-colors"
            >
              나중에 하기
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
            <div>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Email</p>
              <p className="text-sm font-semibold text-text-main">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
            <Shield size={16} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Account Type</p>
              <p className="text-sm font-semibold text-text-main">{isAdmin ? 'Administrator' : 'Standard Member'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
            <Camera size={16} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Plan</p>
              <p className="text-sm font-semibold text-text-main">Free — 3 Camera AI measurements/day</p>
            </div>
          </div>

          {joinedAt && (
            <div className="flex items-center gap-4 p-4 bg-text-main/5 rounded-2xl">
              <Calendar size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-semibold text-text-main">{joinedAt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="btn-primary w-full py-4"
          >
            Upgrade Plan
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50/10 rounded-2xl transition-colors text-label"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
