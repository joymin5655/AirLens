import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { APP_CONFIG } from '../logic/config';

const ComingSoon = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
    <Helmet>
      <title>AirLens — Coming Soon</title>
    </Helmet>

    {/* Background glows */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />

    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 text-center max-w-2xl space-y-12"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center gap-4"
      >
        <div className="w-14 h-14 bg-earth-brown rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden relative animate-float">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
          <span className="material-symbols-outlined text-primary text-3xl relative z-10">eco</span>
        </div>
        <span className="heading-xl !text-5xl">
          {APP_CONFIG.APP_NAME}<span className="text-primary">.</span>
        </span>
      </motion.div>

      {/* Main message */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="space-y-6"
      >
        <p className="text-label text-primary">Global Air Quality Intelligence Platform</p>
        <h1 className="heading-xl !text-6xl sm:!text-7xl leading-none">
          곧<br />
          <span className="text-primary italic font-serif font-light">찾아오겠습니다</span>
        </h1>
        <p className="text-p text-lg max-w-md mx-auto font-serif italic">
          "Real-time PM2.5 visualization, policy impact analysis, and satellite-based estimation — across 66 countries."
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {[
          { icon: 'public', label: '3D Globe' },
          { icon: 'policy', label: 'Policy Lab' },
          { icon: 'satellite_alt', label: 'Satellite AI' },
          { icon: 'camera', label: 'Camera AI' },
          { icon: 'bar_chart', label: 'Analytics' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-white/10 rounded-full text-label text-text-dim shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-base">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </motion.div>

      {/* GitHub link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
      >
        <a
          href={APP_CONFIG.GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-alt inline-flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          View on GitHub
        </a>
      </motion.div>
    </motion.div>

    {/* Bottom tag */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="absolute bottom-10 text-[9px] font-black text-text-dim/30 uppercase tracking-[0.3em]"
    >
      Atmospheric Decoded · v{APP_CONFIG.VERSION}
    </motion.p>
  </div>
);

export default ComingSoon;
