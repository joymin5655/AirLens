import { useTranslation } from 'react-i18next';
import { Wind, ShieldCheck, Activity, TrendingUp, ChevronRight, Binary, Cpu, Network } from 'lucide-react';
import { motion } from 'framer-motion';

const IntelligenceEngines = () => {
  const { t } = useTranslation();

  const engines = [
    { title: 'AOD Correction', desc: t('DASHBOARD.ENGINE_AOD_DESC'), icon: <Wind className="text-primary" size={32} />, color: 'from-primary/20 to-transparent', label: 'Atmospheric Physics' },
    { title: 'SDID Laboratory', desc: t('DASHBOARD.ENGINE_SDID_DESC'), icon: <Activity className="text-primary" size={32} />, color: 'from-emerald-500/20 to-transparent', label: 'Causal Inference' },
    { title: 'DQSS Scoring', desc: t('DASHBOARD.ENGINE_DQSS_DESC'), icon: <ShieldCheck className="text-primary" size={32} />, color: 'from-blue-500/20 to-transparent', label: 'Security & Trust' },
    { title: 'PINN Model', desc: 'Physics-Informed Neural Networks that simulate pollutant dispersion across ungauged regions.', icon: <Binary className="text-primary" size={32} />, color: 'from-purple-500/20 to-transparent', label: 'Deep Learning' },
    { title: 'Edge Analytics', desc: 'Real-time satellite granule processing via Supabase Edge Functions for 1km resolution.', icon: <Cpu className="text-primary" size={32} />, color: 'from-orange-500/20 to-transparent', label: 'High-Res Fusion' },
    { title: 'Sensing Mesh', desc: 'A decentralized network of virtual nodes fusing ground-truth and satellite climatology.', icon: <Network className="text-primary" size={32} />, color: 'from-pink-500/20 to-transparent', label: 'Global Network' }
  ];

  return (
    <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-24 bg-bg-base/30 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[200px]"></div>
      </div>

      <div className="max-w-7xl w-full relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-16 gap-12">
          <div className="space-y-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-4 bg-bg-card backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/20 shadow-xl"
            >
              <TrendingUp size={16} className="text-primary" />
              <span className="text-label !text-text-main">{t('LABELS.SCIENTIFIC_INTEGRITY')}</span>
            </motion.div>
            <h2 className="heading-xl !text-6xl md:!text-8xl">
              Glass-box <span className="italic font-serif font-light text-primary">Intelligence</span>
            </h2>
          </div>
          <div className="max-w-md space-y-4">
             <p className="text-text-dim font-serif italic text-xl leading-relaxed">
              "Our proprietary intelligence pipeline fuses high-resolution satellite imagery with global sensor grids to decipher the invisible flux of our planet."
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {engines.map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="narrative-card group cursor-pointer overflow-hidden relative"
            >
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${item.color} rounded-full -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-2xl`}></div>

              <div className="mb-10 relative z-10 p-4 bg-text-main/5 rounded-2xl w-fit shadow-inner group-hover:bg-primary/20 transition-colors duration-500">
                {item.icon}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-label !text-primary !opacity-80 group-hover:!opacity-100 transition-opacity">{item.label}</span>
                  <h3 className="heading-lg !text-3xl group-hover:text-primary transition-colors duration-500">{item.title}</h3>
                </div>
                <p className="text-p leading-relaxed font-serif italic pr-4 !text-text-main/70 group-hover:!text-text-main transition-opacity">{item.desc}</p>
              </div>

              <div className="pt-10 flex items-center justify-between relative z-10 group-hover:translate-x-2 transition-transform duration-700">
                <div className="flex items-center gap-2 text-label !text-text-main">
                  Decoding <span className="text-primary italic">Process</span> <ChevronRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary shadow-glow transition-all"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntelligenceEngines;