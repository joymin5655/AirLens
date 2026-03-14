import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe as GlobeIcon, Edit3, Heart, Award, LogOut, Save, ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../logic/useAuthStore';
import { supabase } from '../../logic/supabase';
import { APP_CONFIG } from '../../logic/config';
import { motion, AnimatePresence } from 'framer-motion';

const HeroProfile = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      const fetchBio = async () => {
        const { data: profileData } = await supabase.from('profiles').select('bio').eq('id', user.id).single();
        if (profileData?.bio) setBio(profileData.bio);
      };
      fetchBio();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, bio: bio, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      setIsEditing(false);
    } catch (err: unknown) {
      alert('Update failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const defaultBio = isAdmin ? t('DEFAULT_BIO.ADMIN') : t('DEFAULT_BIO.USER');
  const userRole = isAdmin ? t('LABELS.INTEL_MANAGER') : t('LABELS.CITIZEN_SCIENTIST');

  return (
    <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-24 relative overflow-hidden bg-bg-base transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] animate-float"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-soft-green/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-20 items-center relative z-10">

        <div className="lg:col-span-7 space-y-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-4 bg-bg-card backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/20 shadow-xl group hover:scale-105 transition-transform"
          >
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#25e2f4] animate-pulse"></div>
            <span className="text-label !text-text-main">
              {user ? `Atmospheric Flux: ${user.email?.split('@')[0]}` : "Deciphering the Invisible"}
            </span>
          </motion.div>

          {user ? (
            <div className="space-y-10">
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="heading-xl !text-7xl md:!text-[110px]"
                >
                  {t('HERO.WELCOME_A')} <br />
                  <span className="text-primary italic font-serif font-light">Insight</span>
                </motion.h1>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6"
              >
                <p className="text-xl leading-relaxed text-text-dim max-w-xl font-serif italic text-glow">
                  "{t('HERO.QUOTE')}"
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-6 pt-6"
              >
                <Link to="/globe" className="bg-text-main text-bg-base px-12 py-5 rounded-[28px] text-label shadow-deep hover:scale-110 hover:-translate-y-1 transition-all flex items-center gap-3 group">
                  <GlobeIcon size={20} className="text-primary group-hover:rotate-12 transition-transform" /> {t('LABELS.EXPLORE_DATA')}
                </Link>
                <Link to="/policy" className="bg-bg-card backdrop-blur-2xl border border-white/20 text-text-main px-12 py-5 rounded-[28px] text-label hover:bg-bg-base transition-all flex items-center gap-3 shadow-xl group">
                  <Zap size={20} className="text-primary group-hover:scale-125 transition-transform" /> Policy Lab
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-10">
              <motion.h1 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="heading-xl !text-7xl md:!text-[110px]"
              >
                {t('HERO.TITLE_A')} <br />
                <span className="text-primary italic font-serif font-light">{t('HERO.TITLE_B')}</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl leading-relaxed text-text-dim max-w-xl font-serif font-light"
              >
                {t('HERO.DESCRIPTION')}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-6 pt-8"
              >
                <Link to="/auth" className="bg-text-main text-bg-base px-14 py-6 rounded-full text-label shadow-deep hover:scale-110 hover:shadow-primary/20 transition-all flex items-center gap-4 group">
                  {t('LABELS.GET_STARTED')} <ArrowRight size={22} className="text-primary group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, type: "spring" }}
          className="lg:col-span-5 relative perspective-1000"
        >
          {user ? (
            <div className="flex flex-col gap-8 relative z-10">
              <div className="narrative-card !p-0 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={120} className="text-primary" />
                 </div>

                <div className="h-40 bg-text-main relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>

                  <div className="absolute -bottom-14 left-12 p-2 bg-bg-card backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 group-hover:scale-105 transition-transform duration-700">
                    <div className="w-28 h-32 bg-bg-base rounded-[32px] flex items-center justify-center text-primary overflow-hidden shadow-inner border border-white/10">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Award size={56} strokeWidth={1.2} />
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleSignOut}
                    className="absolute top-8 right-8 bg-white/10 backdrop-blur-2xl p-4 rounded-2xl text-white hover:bg-red-500/80 transition-all border border-white/20 group-hover:scale-110"
                    title={t('LABELS.SIGN_OUT')}
                  >
                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                <div className="pt-20 pb-12 px-12 space-y-8">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div 
                        key="editing"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                           <label className="text-label ml-2">Display Name</label>
                           <input 
                            className="w-full bg-bg-base border border-border-subtle rounded-[24px] px-8 py-4 text-sm font-black text-text-main outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all shadow-inner"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your Name"
                          />
                        </div>
                        <div className="space-y-2">
                           <label className="text-label ml-2">Mission Statement</label>
                           <textarea 
                            className="w-full bg-bg-base border border-border-subtle rounded-[24px] px-8 py-5 text-xs text-text-dim outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 h-32 resize-none transition-all shadow-inner font-serif italic"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about your mission..."
                          />
                        </div>
                        <div className="flex gap-4 pt-2">
                          <button onClick={handleUpdateProfile} disabled={saving} className="flex-1 bg-text-main text-bg-base py-4 rounded-[24px] text-label flex items-center justify-center gap-3 shadow-deep hover:scale-105 transition-all">
                            {saving ? <div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin"></div> : <><Save size={16} className="text-primary"/> {t('LABELS.SAVE_CHANGES')}</>}
                          </button>
                          <button onClick={() => setIsEditing(false)} className="px-8 bg-text-dim/5 text-text-dim py-4 rounded-[24px] text-label hover:bg-text-dim/10 transition-colors">{t('LABELS.CANCEL')}</button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="display"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <div className="relative">
                          <div className="flex items-center gap-4">
                            <h3 className="heading-lg !text-4xl">{fullName || user.email?.split('@')[0]}</h3>
                            <AnimatePresence>
                              {isAdmin && (
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0 }} 
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-primary/20 text-primary text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/10 border border-primary/20"
                                >
                                  Verified Manager
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                          <p className="text-[11px] text-primary font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <Sparkles size={12} /> {userRole}
                          </p>
                        </div>
                        <div className="relative p-6 bg-bg-base rounded-[32px] border border-border-subtle">
                          <p className="text-[15px] text-text-dim leading-relaxed font-serif italic relative z-10">
                            "{bio || defaultBio}"
                          </p>
                        </div>
                        <div className="flex gap-5">
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-bg-card border border-text-main/5 text-text-main py-5 rounded-[28px] text-label hover:bg-text-main hover:text-bg-base transition-all duration-700 shadow-xl flex items-center justify-center gap-3 group"
                          >
                            <Edit3 size={16} className="text-primary group-hover:scale-125 transition-transform" /> {t('LABELS.EDIT_PROFILE')}
                          </button>
                          <button className="w-20 bg-primary text-text-main rounded-[28px] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 shadow-glow border border-primary/30 group">
                            <Heart size={24} className="group-hover:fill-text-main transition-colors" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group cursor-pointer perspective-1000">
              <div className="absolute -inset-14 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-all duration-1000 animate-pulse"></div>
              <img alt="Atmosphere" className="relative rounded-[72px] shadow-deep border-[12px] border-bg-card object-cover h-[650px] w-full group-hover:rotate-y-12 group-hover:scale-[1.03] transition-all duration-1000" src={APP_CONFIG.PLACEHOLDER_HERO_IMAGE} />
              <div className="absolute inset-0 bg-gradient-to-t from-text-main/60 to-transparent rounded-[72px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute bottom-12 left-12 right-12 bg-bg-card/80 backdrop-blur-3xl p-10 rounded-[48px] border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-20 group-hover:translate-y-0">
                 <p className="text-text-main font-serif italic text-xl text-center leading-relaxed">"Science is the atmospheric lens through which we decipher the invisible flux of our planet."</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroProfile;