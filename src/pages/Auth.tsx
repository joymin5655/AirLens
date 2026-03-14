import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../logic/supabase';
import { Mail, Lock, LogIn, UserPlus, Chrome, AlertCircle, CheckCircle2, ShieldCheck, Zap, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const getURL = () => {
        let url = window.location.origin + import.meta.env.BASE_URL;
        url = url.replace(/\/$/, "") + "/";
        return url;
      };

      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: getURL()
        }
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center px-4 bg-warm-cream/30">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Value Proposition */}
        <div className="hidden lg:flex flex-col gap-8 pr-12">
          <div className="space-y-4">
            <span className="bg-forest/10 text-forest text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">v1.0 Citizen Science</span>
            <h1 className="heading-xl">
              {t('AUTH.TITLE_A')} <br/>
              <span className="text-forest italic">{t('AUTH.TITLE_B')}</span>
            </h1>
            <p className="text-text-dim text-lg font-serif">{t('AUTH.SUBTITLE')}</p>
          </div>

          <div className="space-y-6">
            {[
              { icon: <Database size={20}/>, title: t('AUTH.VAULT_TITLE'), desc: t('AUTH.VAULT_DESC') },
              { icon: <ShieldCheck size={20}/>, title: t('AUTH.ACCURACY_TITLE'), desc: t('AUTH.ACCURACY_DESC') },
              { icon: <Zap size={20}/>, title: t('AUTH.INSIGHTS_TITLE'), desc: t('AUTH.INSIGHTS_DESC') },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="bg-bg-card p-2 rounded-xl shadow-sm text-forest">{feature.icon}</div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">{feature.title}</h4>
                  <p className="text-xs text-text-dim leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="bg-bg-card rounded-[40px] border border-text-main/5 p-8 md:p-12 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest/5 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 flex flex-col gap-8">
            {/* Tab Switcher */}
            <div className="bg-sage/20 p-1 rounded-2xl flex relative">
              <div 
                className={`absolute inset-1 w-1/2 bg-white rounded-xl shadow-sm transition-all duration-300 transform ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
              ></div>
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors ${isLogin ? 'text-forest' : 'text-text-dim hover:text-text-main'}`}
              >
                {t('AUTH.SIGN_IN')}
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors ${!isLogin ? 'text-forest' : 'text-text-dim hover:text-text-main'}`}
              >
                {t('AUTH.SIGN_UP')}
              </button>
            </div>

            <div className="text-center space-y-1">
              <h2 className="heading-lg !text-2xl font-sans">
                {isLogin ? t('AUTH.WELCOME_BACK') : t('AUTH.CREATE_ACCOUNT')}
              </h2>
              <p className="text-text-dim text-[10px] font-bold uppercase tracking-[0.2em] font-sans">
                {isLogin ? 'Log in to your workspace' : 'Join the global sensing network'}
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-6 py-8 animate-in fade-in zoom-in duration-500 text-center">
                <div className="bg-sage p-4 rounded-full">
                  <CheckCircle2 size={48} className="text-forest" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-text-main">{t('AUTH.VERIFICATION_SENT')}</h3>
                  <p className="text-xs text-text-dim leading-relaxed">
                    <strong>{email}</strong>{t('AUTH.VERIFICATION_DESC')}
                  </p>
                </div>
                <button 
                  onClick={() => setIsLogin(true)}
                  className="bg-forest text-warm-cream px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-forest/20"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Social Login Section */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-bg-card border border-text-main/10 rounded-2xl hover:bg-sage/10 transition-all text-xs font-bold text-text-main shadow-sm group font-sans"
                  >
                    <div className="bg-white p-1 rounded-md border border-gray-100 group-hover:scale-110 transition-transform">
                      <Chrome size={16} className="text-[#4285F4]" />
                    </div>
                    Continue with Google
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-text-main/5"></div>
                  <span className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest">Or use email</span>
                  <div className="flex-1 h-px bg-text-main/5"></div>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1 font-sans">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim/40 w-4 h-4" />
                      <input 
                        type="email" 
                        required
                        placeholder="name@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-sage/5 border border-text-main/5 rounded-2xl text-sm focus:ring-2 focus:ring-forest/30 text-text-main transition-all font-sans outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1 font-sans">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim/40 w-4 h-4" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-sage/5 border border-text-main/5 rounded-2xl text-sm focus:ring-2 focus:ring-forest/30 text-text-main transition-all font-sans outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-[11px] font-bold border border-red-100 font-sans">
                      <AlertCircle size={14} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-4 w-full bg-forest text-warm-cream py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-forest/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-forest/20 font-sans"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-warm-cream/30 border-t-warm-cream rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
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
