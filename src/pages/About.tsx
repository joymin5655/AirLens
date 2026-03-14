import { BookOpen, Server, Cpu, Github } from 'lucide-react';
import { APP_CONFIG } from '../logic/config';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6 flex flex-col gap-20">
      {/* Vision */}
      <section className="text-center flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 bg-sage px-4 py-2 rounded-full border border-soft-green/20 self-center">
          <BookOpen className="text-forest w-4 h-4" />
          <span className="text-[10px] font-bold text-forest uppercase tracking-widest font-sans">v{APP_CONFIG.VERSION} {t('ABOUT.TAG')}</span>
        </div>
        <h1 className="heading-xl">{t('ABOUT.TITLE_A')} <br/><span className="text-forest italic">{t('ABOUT.TITLE_B')}</span></h1>
        <p className="text-text-dim text-lg max-w-3xl mx-auto leading-relaxed font-serif italic">{t('ABOUT.QUOTE')}</p>
      </section>

      {/* 6 Intelligence Engines */}
      <section className="flex flex-col gap-10">
        <h2 className="heading-lg uppercase flex items-center gap-3"><Cpu className="text-forest"/> {t('ABOUT.ENGINES_TITLE')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'XGBoost-GTWR', desc: t('ABOUT.ENGINE_XGBOOST') },
            { name: 'Synthetic DID', desc: t('ABOUT.ENGINE_SDID') },
            { name: 'DINOv2-PINN', desc: t('ABOUT.ENGINE_DINOV2') },
            { name: 'PARAAD DQSS', desc: t('ABOUT.ENGINE_DQSS') },
            { name: 'Bayesian BNN', desc: t('ABOUT.ENGINE_BNN') },
            { name: 'Deep iForest', desc: t('ABOUT.ENGINE_IFOREST') }
          ].map((engine, i) => (
            <div key={i} className="narrative-card group !p-6 border-forest/5 hover:border-forest/20">
              <h3 className="font-bold text-forest text-sm mb-2">{engine.name}</h3>
              <p className="text-[11px] text-text-dim leading-relaxed font-sans">{engine.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Pipeline */}
      <section className="bg-forest text-warm-cream rounded-[40px] p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight italic text-soft-green flex items-center gap-3"><Server/> {t('ABOUT.PIPELINE_TITLE')}</h2>
            <p className="text-warm-cream/70 text-sm leading-relaxed font-sans font-light">{t('ABOUT.PIPELINE_DESC')}</p>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">{t('ABOUT.PIPELINE_CYCLE')}</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">{t('ABOUT.PIPELINE_DEPLOY')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass-panel !bg-white/5 border-white/10"><p className="text-[10px] font-bold text-soft-green mb-1 uppercase">Firebase</p><p className="text-xs">CDN & Hosting</p></div>
            <div className="p-4 glass-panel !bg-white/5 border-white/10"><p className="text-[10px] font-bold text-soft-green mb-1 uppercase">Supabase</p><p className="text-xs">Edge Functions</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10 bg-sage/30 p-10 rounded-[40px] border border-soft-green/10">
        <div className="flex flex-col gap-2">
          <h2 className="heading-lg tracking-tight">{t('ABOUT.MISSION_TITLE')}</h2>
          <p className="text-sm text-text-dim font-sans">{t('ABOUT.MISSION_DESC')}</p>
        </div>
        <div className="flex gap-4">
          <a href={APP_CONFIG.GITHUB_URL} target="_blank" className="flex items-center gap-2 bg-earth-brown text-warm-cream px-6 py-3 rounded-2xl font-bold text-sm hover:bg-earth-brown/90 transition-all font-sans"><Github size={18} /> {t('ABOUT.SOURCE_CODE')}</a>
        </div>
      </section>
    </div>
  );
};

export default About;
