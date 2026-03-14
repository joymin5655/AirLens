import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../logic/supabase';
import { useAuthStore } from '../logic/useAuthStore';
import { Mail, Lock, LogIn, UserPlus, Chrome, AlertCircle, CheckCircle2, ShieldCheck, Zap, Database } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: email.split('@')[0] } }
        });
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      const redirectTo = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '') + '/';
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center px-4 bg-bg-base transition-colors duration-500">
<div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Value Proposition */}
        <div className="hidden lg:flex flex-col gap-8 pr-12">
          <div className="space-y-4">
            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">v1.1 Citizen Science</span>
            <h1 className="heading-xl">
              {t('AUTH.TITLE_A')} <br/>
              <span className="text-primary italic font-serif font-light">{t('AUTH.TITLE_B')}</span>
            </h1>
            <p className="text-text-dim text-lg font-serif italic">"{t('AUTH.SUBTITLE')}"</p>
          </div>

          <div className="space-y-6">
            {[
              { icon: <Database size={20}/>, title: t('AUTH.VAULT_TITLE'), desc: t('AUTH.VAULT_DESC') },
              { icon: <ShieldCheck size={20}/>, title: t('AUTH.ACCURACY_TITLE'), desc: t('AUTH.ACCURACY_DESC') },
              { icon: <Zap size={20}/>, title: t('AUTH.INSIGHTS_TITLE'), desc: t('AUTH.INSIGHTS_DESC') },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="bg-bg-card p-3 rounded-2xl shadow-sm text-primary group-hover:scale-110 transition-transform duration-500 border border-white/10">{feature.icon}</div>
                <div>
                  <h4 className="heading-lg !text-base !text-text-main">{feature.title}</h4>
                  <p className="text-p !text-xs !leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="narrative-card !p-8 md:!p-12 relative overflow-hidden w-full max-w-md mx-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 flex flex-col gap-8">
            {/* Tab Switcher */}
            <div className="bg-text-main/5 p-1 rounded-2xl flex relative">
              <div 
                className={`absolute inset-1 w-1/2 bg-bg-card rounded-xl shadow-sm transition-all duration-500 transform ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
              ></div>
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${isLogin ? 'text-primary' : 'text-text-dim hover:text-text-main'}`}
              >
                {t('AUTH.SIGN_IN')}
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${!isLogin ? 'text-primary' : 'text-text-dim hover:text-text-main'}`}
              >
                {t('AUTH.SIGN_UP')}
              </button>
            </div>

            <div className="text-center space-y-2">
              <h2 className="heading-lg !text-3xl">
                {isLogin ? t('AUTH.WELCOME_BACK') : t('AUTH.CREATE_ACCOUNT')}
              </h2>
              <p className="text-label !text-text-dim">
                {isLogin ? 'Inference Engine Ready' : 'Join the Global Matrix'}
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-6 py-8 animate-in fade-in zoom-in duration-500 text-center">
                <div className="bg-primary/10 p-6 rounded-full shadow-glow">
                  <CheckCircle2 size={48} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="heading-lg !text-xl">{t('AUTH.VERIFICATION_SENT')}</h3>
                  <p className="text-p !text-xs !leading-relaxed">
                    Verification link dispatched to <br/><strong>{email}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setIsLogin(true)}
                  className="btn-main px-10"
                >
                  Return to Matrix
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Social Login Section */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-4 py-4 bg-bg-card border border-text-main/10 rounded-2xl hover:bg-btn-main-bg hover:text-btn-main-text transition-all text-label shadow-xl group"
                  >
                    <div className="bg-bg-base p-1.5 rounded-lg border border-text-main/5 group-hover:scale-110 transition-transform">
                      <Chrome size={18} className="text-[#4285F4]" />
                    </div>
                    Continue with Google
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-text-main/10"></div>
                  <span className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest">Or Neural Link</span>
                  <div className="flex-1 h-px bg-text-main/10"></div>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-label ml-1">Registry Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim/40 w-4 h-4" />
                      <input 
                        type="email" 
                        required
                        placeholder="identity@matrix.io"
                        className="w-full pl-12 pr-4 py-4 bg-bg-base border border-text-main/5 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 text-text-main transition-all outline-none shadow-inner"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label ml-1">Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim/40 w-4 h-4" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-bg-base border border-text-main/5 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 text-text-main transition-all outline-none shadow-inner"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 text-red-500 bg-red-500/5 p-4 rounded-2xl text-[11px] font-bold border border-red-500/20">
                      <AlertCircle size={16} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="mt-4 w-full btn-main flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="w-5 h-5 border-2 border-btn-main-text/30 border-t-btn-main-text rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {isLogin ? <LogIn size={20} className="text-primary" /> : <UserPlus size={20} className="text-primary" />}
                        {isLogin ? t('AUTH.SIGN_IN') : t('AUTH.SIGN_UP')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
