import { BookOpen, Server, Cpu, Github } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6 flex flex-col gap-20">
      {/* Vision */}
      <section className="text-center flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 bg-sage px-4 py-2 rounded-full border border-soft-green/20 self-center">
          <BookOpen className="text-forest w-4 h-4" />
          <span className="text-[10px] font-bold text-forest uppercase tracking-widest font-sans">v1.0 Scientific Integrity</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold text-earth-brown tracking-tight leading-tight">Physics-Informed, <br/><span className="text-forest italic">Human-Centered.</span></h1>
        <p className="text-clay text-lg max-w-3xl mx-auto leading-relaxed font-serif italic">"데이터는 보여주는 것이 아니라, 증명하는 것입니다."</p>
      </section>

      {/* 6 Intelligence Engines */}
      <section className="flex flex-col gap-10">
        <h2 className="text-2xl font-bold text-earth-brown uppercase tracking-tight flex items-center gap-3"><Cpu className="text-forest"/> 6 Analysis Engines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'XGBoost-GTWR', desc: 'AOD 위성 데이터를 지상 PM2.5 농도로 정밀 보정하는 공간-시계열 회귀 엔진' },
            { name: 'Synthetic DID', desc: '68개국 환경 정책의 순수 효과를 추출하는 인과 추론 엔진' },
            { name: 'DINOv2-PINN', desc: '물리 법칙을 강제한 시각 지능 기반 헤이즈 분석 엔진' },
            { name: 'PARAAD DQSS', desc: 'Bi-LSTM 기반의 실시간 데이터 품질 및 신뢰도 측정 엔진' },
            { name: 'Bayesian BNN', desc: 'p10~p90 불확실성 구간을 산출하는 확률론적 예측 엔진' },
            { name: 'Deep iForest', desc: 'LSTM-AE 기반의 다차원 이상치 탐지 및 필터링 엔진' }
          ].map((engine, i) => (
            <div key={i} className="narrative-card group !p-6 border-forest/5 hover:border-forest/20">
              <h3 className="font-bold text-forest text-sm mb-2">{engine.name}</h3>
              <p className="text-[11px] text-clay leading-relaxed font-sans">{engine.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Pipeline */}
      <section className="bg-forest text-warm-cream rounded-[40px] p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight italic text-soft-green flex items-center gap-3"><Server/> Automated Pipeline</h2>
            <p className="text-warm-cream/70 text-sm leading-relaxed font-sans font-light">매 30분마다 WAQI, OpenAQ, NASA Earthdata로부터 데이터를 수집하고, GitHub Actions를 통해 무중단으로 ML 분석을 수행합니다.</p>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">30m Cycle</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">CI/CD Deploy</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass-panel !bg-white/5 border-white/10"><p className="text-[10px] font-bold text-soft-green mb-1 uppercase">GitHub Pages</p><p className="text-xs">Frontend Hosting</p></div>
            <div className="p-4 glass-panel !bg-white/5 border-white/10"><p className="text-[10px] font-bold text-soft-green mb-1 uppercase">Cloud Run</p><p className="text-xs">FastAPI Backend</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10 bg-sage/30 p-10 rounded-[40px] border border-soft-green/10">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-earth-brown tracking-tight">Open Intelligence Mission</h2>
          <p className="text-sm text-clay font-sans">누구나 재현 가능한 투명한 환경 데이터를 지향합니다.</p>
        </div>
        <div className="flex gap-4">
          <a href="https://github.com/joymin5655/AirLens" target="_blank" className="flex items-center gap-2 bg-earth-brown text-warm-cream px-6 py-3 rounded-2xl font-bold text-sm hover:bg-earth-brown/90 transition-all font-sans"><Github size={18} /> Source Code</a>
        </div>
      </section>
    </div>
  );
};

export default About;
