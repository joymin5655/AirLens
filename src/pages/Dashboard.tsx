import { Link } from 'react-router-dom';
import { Wind, ShieldCheck, Activity, ArrowRight, Camera, Globe as GlobeIcon, History, Edit3, Heart, Award } from 'lucide-react';
import { useAuthStore } from '../logic/useAuthStore';

const Dashboard = () => {
  const { user, isAdmin } = useAuthStore();

  return (
    <div className="h-screen overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory flex">
      
      {/* Chapter 0: Personalized Hero & Profile */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20 bg-warm-cream">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-forest/5 px-3 py-1 rounded-full border border-forest/10">
              <div className="w-1.5 h-1.5 bg-forest rounded-full animate-pulse"></div>
              <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-[10px]">
                {user ? `Active Session: ${user.email?.split('@')[0]}` : 'v1.0 Atmospheric Intelligence'}
              </span>
            </div>
            
            {user ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                <h1 className="text-5xl md:text-7xl font-bold text-earth-brown leading-tight tracking-tight">
                  Welcome to Your <br />
                  <span className="text-forest italic">Personal Hub.</span>
                </h1>
                <p className="text-lg leading-relaxed text-clay max-w-lg font-serif italic">
                  "우리는 대기를 데이터로 읽고, 당신은 그 데이터의 증인이 됩니다."
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link to="/camera" className="bg-forest text-warm-cream px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-forest/90 transition-all flex items-center gap-3">
                    <Camera size={20} /> New Measurement
                  </Link>
                  <Link to="/globe" className="bg-white border border-earth-brown/10 text-earth-brown px-8 py-4 rounded-2xl font-bold text-sm hover:bg-sage/20 transition-all flex items-center gap-3">
                    <GlobeIcon size={20} /> Explore Data
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-semibold leading-tight text-earth-brown tracking-tight">
                  Beyond Numbers, <br />
                  <span className="text-forest italic">Towards Truth.</span>
                </h1>
                <p className="text-lg leading-relaxed text-clay max-w-lg font-serif">
                  AirLens는 단순한 수치 확인을 넘어, 인공지능과 대기 과학으로 환경의 진실을 파헤치는 투명한 지능형 플랫폼입니다.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link to="/auth" className="bg-forest text-warm-cream px-10 py-4 rounded-full font-sans font-bold text-sm shadow-xl hover:bg-forest/90 transition-all flex items-center gap-2">
                    Get Started <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile & Stats Area */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute -inset-4 bg-soft-green/20 rounded-full blur-3xl"></div>
            
            {user ? (
              <div className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-right-4 duration-700">
                {/* Profile Card */}
                <div className="narrative-card !p-0 overflow-hidden bg-white/90">
                  <div className="h-24 bg-forest relative">
                    <div className="absolute -bottom-10 left-8 p-1 bg-white rounded-3xl shadow-lg">
                      <div className="w-20 h-24 bg-sage rounded-2xl flex items-center justify-center text-forest overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Award size={40} />
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/20">
                        System Admin
                      </div>
                    )}
                  </div>
                  <div className="pt-14 pb-8 px-8 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-earth-brown font-sans">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h3>
                      <p className="text-xs text-clay font-bold uppercase tracking-widest">{isAdmin ? 'AirLens Intelligence Manager' : 'Citizen Scientist'}</p>
                    </div>
                    <p className="text-sm text-clay leading-relaxed font-serif italic bg-sage/20 p-4 rounded-2xl border border-soft-green/10">
                      {isAdmin ? "AirLens 시스템의 무결성과 데이터 품질을 감독하며, 글로벌 환경 정책의 인과관계를 분석합니다." : "우리 동네의 공기질 데이터를 수집하고 AI 분석에 기여하는 시민 과학자입니다."}
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 bg-forest/5 text-forest py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-forest/10 transition-all flex items-center justify-center gap-2">
                        <Edit3 size={12} /> Edit Profile
                      </button>
                      <button className="w-12 bg-sage/30 text-forest rounded-xl flex items-center justify-center hover:bg-sage/50 transition-all">
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* mini stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-6 flex flex-col gap-1">
                    <p className="text-[9px] font-black text-clay uppercase">Contributions</p>
                    <p className="text-2xl font-bold text-forest font-sans">128 pts</p>
                  </div>
                  <div className="glass-panel p-6 flex flex-col gap-1">
                    <p className="text-[9px] font-black text-clay uppercase">Accuracy</p>
                    <p className="text-2xl font-bold text-forest font-sans">94.2%</p>
                  </div>
                </div>
              </div>
            ) : (
              <img alt="Atmosphere" className="relative rounded-[40px] shadow-2xl border-4 border-white object-cover h-[550px] w-full" src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1024" />
            )}
          </div>
        </div>
      </section>

      {/* Chapter 1: Intelligence Engines */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20 bg-sage/20">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 space-y-4">
            <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-xs">Scientific Integrity</span>
            <h2 className="text-5xl font-semibold text-earth-brown leading-tight">6 Intelligence <span className="italic text-clay">Engines</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'AOD Correction', desc: 'XGBoost-GTWR 모델로 위성 AOD를 지상 PM2.5 수치로 정밀 보정합니다.', icon: <Wind className="text-forest" /> },
              { title: 'Policy Lab (SDID)', desc: '68개국 정책 효과를 Synthetic DID 모델로 분석해 인과관계를 증명합니다.', icon: <Activity className="text-forest" /> },
              { title: 'DQSS Scoring', desc: '5가지 파라미터로 데이터 품질을 점수화하여 불확실성을 공시합니다.', icon: <ShieldCheck className="text-forest" /> }
            ].map((item, i) => (
              <div key={i} className="narrative-card group">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2 font-sans">{item.title}</h3>
                <p className="text-sm text-clay leading-relaxed font-serif">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 2: Navigation Hub */}
      <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-20">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="font-sans font-bold text-forest uppercase tracking-[0.2em] text-xs">Platform Modules</span>
            <h2 className="text-5xl font-semibold leading-tight text-earth-brown">Decode the <span className="italic text-clay">Atmosphere</span></h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/globe" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                <p className="font-bold text-forest mb-1 group-hover:underline">Global Flux</p>
                <p className="text-[10px] text-clay uppercase">3D Globe & AOD</p>
              </Link>
              <Link to="/camera" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                <p className="font-bold text-forest mb-1 group-hover:underline">Vision Sensing</p>
                <p className="text-[10px] text-clay uppercase">DINOv2 Camera AI</p>
              </Link>
              <Link to="/policy" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                <p className="font-bold text-forest mb-1 group-hover:underline">Impact Lab</p>
                <p className="text-[10px] text-clay uppercase">SDID Policy Analysis</p>
              </Link>
              {isAdmin ? (
                <div className="p-6 bg-earth-brown text-warm-cream rounded-3xl border border-transparent shadow-lg flex items-center justify-between group cursor-pointer hover:brightness-110 transition-all">
                  <div>
                    <p className="font-bold mb-1">Admin Console</p>
                    <p className="text-[10px] uppercase opacity-60">System Monitoring</p>
                  </div>
                  <Award className="opacity-40" />
                </div>
              ) : (
                <Link to="/about" className="p-6 bg-white border border-earth-brown/10 rounded-3xl hover:border-forest/40 transition-all group">
                  <p className="font-bold text-forest mb-1 group-hover:underline">Methods</p>
                  <p className="text-[10px] text-clay uppercase">Open Pipeline</p>
                </Link>
              )}
            </div>
          </div>
          <div className="bg-earth-brown text-warm-cream p-10 rounded-[40px] shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 font-sans tracking-tight">Transparency & Integrity</h3>
            <p className="text-warm-cream/70 leading-relaxed mb-6 font-serif">우리는 "보여주는 것"에 그치지 않습니다. 측정 공백을 위성 데이터로 메우고, AI 모델의 신뢰 구간을 p10~p90으로 투명하게 공개하여 과학적 무결성을 유지합니다.</p>
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
              <ShieldCheck className="text-soft-green" />
              <span className="text-xs font-bold font-sans uppercase">DQSS Quality Badge Active</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
