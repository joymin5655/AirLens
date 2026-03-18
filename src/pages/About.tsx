import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Server, Cpu, Github, ArrowRight,
  BarChart2, GitMerge, Eye, ShieldCheck, Brain, Layers,
} from 'lucide-react';
import { APP_CONFIG } from '../logic/config';
import TypingAnimation from '../components/TypingAnimation';

const STATS = [
  { value: '12K+', label: 'Ground Stations' },
  { value: '68',   label: 'Countries Analyzed' },
  { value: '6',    label: 'ML / Physics Engines' },
  { value: '30m',  label: 'Update Cycle' },
];

const ENGINE_ICONS = [BarChart2, GitMerge, Eye, ShieldCheck, Brain, Layers];

const PIPELINE_STACK = [
  { label: 'Cloudflare',     sub: 'CDN & Edge Cache' },
  { label: 'Supabase',       sub: 'Edge Functions' },
  { label: 'GitHub Actions', sub: 'CI/CD Pipeline' },
  { label: 'NASA Earthdata', sub: 'MAIAC AOD' },
];

const TERMINAL_LINES = [
  { prompt: true,  text: 'airlens start --sources waqi,openaq,nasa-maiac' },
  { prompt: false, ok: true,  text: 'WAQI: 12,483 stations connected' },
  { prompt: false, ok: true,  text: 'OpenAQ: PM2.5 time-series loaded' },
  { prompt: false, ok: true,  text: 'NASA MAIAC: AOD fused (70 / 30 weighting)' },
  { prompt: false, ok: false, text: '──────────────────────────────────────────' },
  { prompt: true,  text: 'airlens analyze --dqss --confidence p10-p90' },
  { prompt: false, ok: null,  text: 'Running PARAAD DQSS scoring...' },
  { prompt: false, ok: true,  text: 'Quality Score: 0.89 | CI: [8.2, 12.4] μg/m³' },
  { prompt: false, ok: false, text: '──────────────────────────────────────────' },
  { prompt: true,  text: 'airlens policy --country KOR --year 2020 --sdid' },
  { prompt: false, ok: null,  text: 'Constructing Synthetic Control...' },
  { prompt: false, ok: true,  text: 'Policy Effect: -4.7 μg/m³  (p < 0.001)' },
] as const;


const About = () => {
  const { t } = useTranslation();
  const enginesRef = useRef<HTMLDivElement>(null);
  const enginesInView = useInView(enginesRef, { once: true, margin: '-80px' });

  const engines = [
    { name: 'XGBoost-GTWR', desc: t('ABOUT.ENGINE_XGBOOST') },
    { name: 'Synthetic DID', desc: t('ABOUT.ENGINE_SDID') },
    { name: 'DINOv2-PINN',  desc: t('ABOUT.ENGINE_DINOV2') },
    { name: 'PARAAD DQSS',  desc: t('ABOUT.ENGINE_DQSS') },
    { name: 'Bayesian BNN', desc: t('ABOUT.ENGINE_BNN') },
    { name: 'Deep iForest', desc: t('ABOUT.ENGINE_IFOREST') },
  ];

  return (
    <div className="flex flex-col">

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a1628]">

        {/* grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,226,244,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,226,244,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* atmospheric glows */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-soft-green/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl w-full mx-auto px-6 pt-32 pb-28 flex flex-col items-center text-center gap-8">

          {/* version badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#25e2f4]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
              v{APP_CONFIG.VERSION} · {t('ABOUT.TAG')}
            </span>
          </motion.div>

          {/* heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans font-black text-5xl sm:text-7xl md:text-8xl lg:text-[96px] tracking-tighter leading-[0.9] text-white"
          >
            {t('ABOUT.TITLE_A')}<br />
            <span className="text-primary italic font-serif font-light">{t('ABOUT.TITLE_B')}</span>
          </motion.h1>

          {/* terminal typing line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="font-mono text-sm sm:text-base text-primary/80 tracking-wide"
          >
            <TypingAnimation
              phrases={[
                'airlens analyze --location global --engine xgboost-gtwr',
                'airlens policy --country 68 --method synthetic-did',
                'airlens satellite --source NASA-MAIAC --fuse ground',
                'airlens camera --physics koschmieder --model dinov2',
              ]}
              typingSpeed={52}
              prefix="$"
              prefixClassName="text-white/25"
            />
          </motion.div>

          {/* quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed font-serif italic"
          >
            {t('ABOUT.QUOTE')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link to="/auth" className="btn-primary flex items-center gap-3 group">
              {t('LABELS.GET_STARTED')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#engines"
              className="flex items-center gap-3 text-white/70 hover:text-primary transition-colors font-black uppercase tracking-widest text-[10px] sm:text-xs px-8 py-5 rounded-[24px] border border-white/20 hover:border-primary/30 hover:bg-primary/5"
            >
              Explore Engines
            </a>
          </motion.div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.25em]">
          <span className="w-px h-10 bg-gradient-to-b from-transparent to-white/50" />
          scroll
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────────────────────── */}
      <section className="bg-bg-base border-b border-border-subtle py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="text-center"
            >
              <p className="font-black text-3xl sm:text-4xl text-primary text-glow">{s.value}</p>
              <p className="text-label mt-2 text-text-dim">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 flex flex-col gap-24 py-24">

        {/* === 6 ENGINES === */}
        <section id="engines" ref={enginesRef} className="flex flex-col gap-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="heading-lg uppercase flex items-center gap-3">
              <Cpu className="text-primary" />
              {t('ABOUT.ENGINES_TITLE')}
            </h2>
            <span className="text-label text-text-dim">Science-grade accuracy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engines.map((engine, i) => {
              const Icon = ENGINE_ICONS[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={enginesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                  className="narrative-card group !p-6 border-primary/5 hover:border-primary/25"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <span className="font-mono text-[10px] text-text-dim/30">0{i + 1}</span>
                  </div>
                  <h3 className="font-black text-primary text-sm mb-2 tracking-wide">{engine.name}</h3>
                  <p className="text-p text-[11px] leading-relaxed">{engine.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* === TERMINAL BLOCK === */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="narrative-card !bg-[#0a1628] !border-white/[0.08] !rounded-[32px] !p-0 overflow-hidden"
        >
          {/* title bar */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.08]">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 font-mono text-white/30 text-[11px] select-none">
              airlens-pipeline — zsh
            </span>
          </div>

          {/* terminal body */}
          <div className="px-6 sm:px-8 py-6 sm:py-8 font-mono text-xs sm:text-sm leading-[1.9] space-y-0.5">
            {TERMINAL_LINES.map((line, i) => {
              if (line.prompt) {
                return (
                  <p key={i}>
                    <span className="text-primary/40 select-none mr-2">$</span>
                    <span className="text-white/75">{line.text}</span>
                  </p>
                );
              }
              if (line.ok === false) {
                return <p key={i} className="text-white/15 select-none">{line.text}</p>;
              }
              if (line.ok === null) {
                return <p key={i} className="text-primary/70">⟳ {line.text}</p>;
              }
              return (
                <p key={i} className="text-green-400/80">
                  <span className="mr-2">✓</span>{line.text}
                </p>
              );
            })}
          </div>
        </motion.section>

        {/* === DATA PIPELINE === */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="bg-primary text-earth-brown rounded-[40px] p-8 md:p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tighter italic flex items-center gap-3">
                <Server /> {t('ABOUT.PIPELINE_TITLE')}
              </h2>
              <p className="text-earth-brown/70 text-sm font-light leading-relaxed">
                {t('ABOUT.PIPELINE_DESC')}
              </p>
              <div className="flex gap-4 flex-wrap">
                <span className="px-3 py-1 bg-earth-brown/10 rounded-full text-label !opacity-100">
                  {t('ABOUT.PIPELINE_CYCLE')}
                </span>
                <span className="px-3 py-1 bg-earth-brown/10 rounded-full text-label !opacity-100">
                  {t('ABOUT.PIPELINE_DEPLOY')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {PIPELINE_STACK.map((item, i) => (
                <div key={i} className="p-4 glass-panel !bg-white/5 border-white/10">
                  <p className="text-label text-earth-brown mb-1">{item.label}</p>
                  <p className="text-xs font-bold">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* === MISSION CTA === */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row items-center justify-between gap-10 bg-text-main/5 p-10 rounded-[40px] border border-primary/10"
        >
          <div className="flex flex-col gap-2">
            <h2 className="heading-lg tracking-tight">{t('ABOUT.MISSION_TITLE')}</h2>
            <p className="text-p text-sm">{t('ABOUT.MISSION_DESC')}</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link to="/auth" className="btn-primary flex items-center gap-3 group shrink-0">
              {t('LABELS.GET_STARTED')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={APP_CONFIG.GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-earth-brown text-warm-cream px-6 py-3 rounded-2xl font-bold text-sm hover:bg-earth-brown/90 transition-all font-sans shrink-0"
            >
              <Github size={18} /> {t('ABOUT.SOURCE_CODE')}
            </a>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default About;
