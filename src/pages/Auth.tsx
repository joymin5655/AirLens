import { useState } from 'react';
import { supabase } from '../logic/supabase';
import { Mail, Lock, LogIn, UserPlus, Chrome, AlertCircle, CheckCircle2, ShieldCheck, Zap, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      // Get the absolute URL including the base path (e.g., /AirLens/)
      const getURL = () => {
        let url = window.location.origin + import.meta.env.BASE_URL;
        // Make sure to remove trailing slash if any and ensure it ends with /
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center px-4 bg-warm-cream/30">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Value Proposition */}
        <div className="hidden lg:flex flex-col gap-8 pr-12">
          <div className="space-y-4">
            <span className="bg-forest/10 text-forest text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">v1.0 Citizen Science</span>
            <h1 className="text-5xl font-bold text-earth-brown leading-tight">
              Unlock Your <br/>
              <span className="text-forest italic">Personal Atmosphere.</span>
            </h1>
            <p className="text-clay text-lg font-serif">로그인하여 당신만의 공기질 지도를 만들고, 인공지능 분석 리포트를 안전하게 보관하세요.</p>
          </div>

          <div className="space-y-6">
            {[
              { icon: <Database size={20}/>, title: 'Private Vault', desc: '분석한 모든 사진과 수치를 Supabase 클라우드에 암호화하여 저장합니다.' },
              { icon: <ShieldCheck size={20}/>, title: 'Verified Accuracy', desc: '개인 측정 데이터를 기반으로 더 정교한 지역별 DQSS 점수를 제공받으세요.' },
              { icon: <Zap size={20}/>, title: 'AI Insights', desc: 'DINOv2 모델을 통해 우리 동네의 헤이즈 패턴을 실시간으로 추적합니다.' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="bg-white p-2 rounded-xl shadow-sm text-forest">{feature.icon}</div>
                <div>
                  <h4 className="text-sm font-bold text-earth-brown">{feature.title}</h4>
                  <p className="text-xs text-clay leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="bg-white rounded-[40px] border border-earth-brown/5 p-8 md:p-12 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest/5 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 flex flex-col gap-8">
            {/* Tab Switcher */}
            <div className="bg-sage/20 p-1 rounded-2xl flex relative">
              <div 
                className={`absolute inset-1 w-1/2 bg-white rounded-xl shadow-sm transition-all duration-300 transform ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
              ></div>
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors ${isLogin ? 'text-forest' : 'text-clay hover:text-earth-brown'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors ${!isLogin ? 'text-forest' : 'text-clay hover:text-earth-brown'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-earth-brown tracking-tight font-sans">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-clay text-[10px] font-bold uppercase tracking-[0.2em] font-sans">
                {isLogin ? 'Log in to your workspace' : 'Join the global sensing network'}
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-6 py-8 animate-in fade-in zoom-in duration-500 text-center">
                <div className="bg-sage p-4 rounded-full">
                  <CheckCircle2 size={48} className="text-forest" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-earth-brown">Verification Sent!</h3>
                  <p className="text-xs text-clay leading-relaxed">
                    <strong>{email}</strong>로 확인 메일을 보냈습니다.<br/>
                    메일함의 링크를 클릭하면 가입이 완료됩니다.
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
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-earth-brown/10 rounded-2xl hover:bg-sage/10 transition-all text-xs font-bold text-earth-brown shadow-sm group font-sans"
                  >
                    <div className="bg-white p-1 rounded-md border border-gray-100 group-hover:scale-110 transition-transform">
                      <Chrome size={16} className="text-[#4285F4]" />
                    </div>
                    Continue with Google
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-earth-brown/5"></div>
                  <span className="text-[9px] font-black text-clay/40 uppercase tracking-widest">Or use email</span>
                  <div className="flex-1 h-px bg-earth-brown/5"></div>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-clay uppercase tracking-widest ml-1 font-sans">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-clay/40 w-4 h-4" />
                      <input 
                        type="email" 
                        required
                        placeholder="name@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-sage/5 border border-earth-brown/5 rounded-2xl text-sm focus:ring-2 focus:ring-forest/30 text-earth-brown transition-all font-sans outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-clay uppercase tracking-widest ml-1 font-sans">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-clay/40 w-4 h-4" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-sage/5 border border-earth-brown/5 rounded-2xl text-sm focus:ring-2 focus:ring-forest/30 text-earth-brown transition-all font-sans outline-none"
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
                        {isLogin ? 'Sign In' : 'Get Started'}
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