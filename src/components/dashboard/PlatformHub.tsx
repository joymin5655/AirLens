import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Camera, Globe as GlobeIcon, ShieldCheck, Sparkles, Layout, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PlatformHub = () => {
  const { t } = useTranslation();

  const modules = [
    { to: '/globe', title: t('LABELS.GLOBAL_FLUX'), sub: '3D Matrix & AOD', icon: <GlobeIcon size={24}/>, color: 'text-primary' },
    { to: '/camera', title: 'Intelligence Lens', sub: 'Vision Sensing AI', icon: <Camera size={24}/>, color: 'text-emerald-500' },
    { to: '/policy', title: 'Impact Laboratory', sub: 'Causal SDID Analysis', icon: <Activity size={24}/>, color: 'text-orange-500' },
    { to: '/analytics', title: 'Atmospheric Stats', sub: 'Global Trends v1.1', icon: <BarChart3 size={24}/>, color: 'text-purple-500' }
  ];

  return (
    <section className="w-full min-h-screen lg:min-w-[100vw] lg:h-screen flex items-center justify-center snap-center px-6 sm:px-10 lg:px-24 py-28 lg:py-0 bg-bg-base/50 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10">
        <div className="space-y-16">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-primary"
            >
              <div className="p-2 bg-primary/10 rounded-xl">
                <Layout size={20} />
              </div>
              <span className="text-label !text-primary">Platform Intelligence Modules</span>
            </motion.div>
            <h2 className="heading-xl !text-4xl sm:!text-5xl md:!text-6xl lg:!text-8xl">
              Atmospheric <br/><span className="italic font-serif font-light text-primary">Ecosystem</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {modules.map((link, i) => (
              <Link 
                key={i} 
                to={link.to} 
                className="p-10 narrative-card !p-10 !rounded-[48px] hover:border-primary/40 transition-all group shadow-2xl hover:-translate-y-2 duration-700 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-text-main/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000`}></div>

                <div className={`w-14 h-14 bg-text-main/10 rounded-2xl flex items-center justify-center ${link.color} mb-8 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 shadow-inner`}>
                  {link.icon}
                </div>

                <div className="space-y-2 relative z-10">
                  <p className="heading-lg !text-2xl group-hover:text-primary transition-colors">{link.title}</p>
                  <p className="text-label !text-text-dim group-hover:!text-primary transition-colors">{link.sub}</p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                   Launch Chapter <ArrowRight size={12}/>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-text-main text-bg-base p-8 sm:p-12 lg:p-16 rounded-[40px] lg:rounded-[64px] shadow-deep relative overflow-hidden group perspective-1000"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
            <Activity size={240} />
          </div>

          <div className="space-y-10 relative z-10">
            <div className="flex items-center gap-4 text-primary text-label">
              <div className="p-2 bg-primary/20 rounded-lg">
                <ShieldCheck size={20} className="text-primary" /> 
              </div>
              {t('LABELS.SCIENTIFIC_INTEGRITY')}
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black !text-bg-base leading-snug">{t('LABELS.PURPOSE')}</h3>
              <p className="text-bg-base/85 leading-relaxed text-base pr-10">
                {t('LABELS.PURPOSE_DESC') || 'Empowering citizens and policymakers with ground-truth environmental intelligence through advanced physics-ML fusion.'}
              </p>
            </div>

            <div className="flex items-center gap-6 p-8 bg-bg-base/5 rounded-[40px] border border-bg-base/10 backdrop-blur-2xl shadow-inner group-hover:bg-bg-base/10 transition-colors">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-text-main shadow-glow">
                <Sparkles size={28} />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black font-sans uppercase tracking-[0.3em] block text-bg-base">Provenance Matrix Verified</span>
                <span className="text-[10px] text-bg-base/65 uppercase tracking-[0.2em] font-bold">DQSS Intelligence Certificate Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformHub;