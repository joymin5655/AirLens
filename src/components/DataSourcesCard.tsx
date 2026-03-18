import { Radio, Satellite, ShieldCheck, Database, Cpu, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { MLDQSSResult } from '../logic/mlService';

interface DataSourcesCardProps {
  sources: string[];
  dqss: number;
  loading: boolean;
  mlDqss?: MLDQSSResult;
}

const DQSS_COMPONENTS: { key: keyof MLDQSSResult; label: string }[] = [
  { key: 'freshness',      label: 'Freshness'     },
  { key: 'completeness',   label: 'Completeness'  },
  { key: 'consistency',    label: 'Consistency'   },
  { key: 'stability',      label: 'Stability'     },
  { key: 'model_residual', label: 'Model Fit'     },
];

const badgeColorClass = (badge: string) => {
  switch (badge) {
    case 'Excellent': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Good':      return 'bg-primary/20 text-primary border-primary/30';
    case 'Fair':      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default:          return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
};

const DataSourcesCard = ({ sources, dqss, loading, mlDqss }: DataSourcesCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="narrative-card !p-8 shadow-2xl relative overflow-hidden group transition-colors duration-500"
    >
      <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
        <Network size={120} />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl shadow-glow">
            <ShieldCheck className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-label !text-text-dim">{t('LABELS.INTEGRITY_SCORE')}</p>
            <div className="flex items-center gap-2">
              <h3 className="heading-lg !text-2xl !text-text-main">DQSS: {loading ? '--' : dqss}</h3>
              {!loading && mlDqss && (
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeColorClass(mlDqss.badge)}`}>
                  {mlDqss.badge}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
           <span className="text-[8px] font-black uppercase tracking-widest text-primary mt-1">Active</span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* ML DQSS 5-component breakdown */}
        {!loading && mlDqss && (
          <div className="space-y-2 pb-4 border-b border-text-main/5">
            {DQSS_COMPONENTS.map(({ key, label }) => {
              const val = Math.round((mlDqss[key] as number) ?? 0);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-dim w-24 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-text-main/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <span className="text-[9px] font-black text-text-dim w-6 text-right">{val}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pb-3">
           <p className="text-label !text-text-dim">
            {t('LABELS.ACTIVE_PIPELINES')}
           </p>
           <span className="text-[9px] font-black text-primary uppercase">{sources.length} Nodes</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 items-center p-4 bg-text-main/5 rounded-2xl">
                <div className="w-10 h-10 bg-text-main/10 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 bg-text-main/10 rounded w-1/2"></div>
                  <div className="h-2 bg-text-main/10 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : (
            sources.map((source, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-4 bg-bg-base/50 rounded-[24px] border border-text-main/10 hover:border-primary/30 hover:bg-bg-base transition-all duration-500 shadow-sm group/item"
              >
                <div className="p-3 bg-text-main/5 rounded-xl group-hover/item:bg-primary/10 transition-colors shadow-inner">
                  {source.includes('NASA') || source.includes('MAIAC') || source.includes('ML') ? (
                    <Satellite size={20} className="text-primary" />
                  ) : (
                    <Radio size={20} className="text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-text-main truncate tracking-tight">{source}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Cpu size={10} className="text-text-dim/60" />
                    <p className="text-[9px] text-text-dim font-black uppercase tracking-widest">
                      {source.includes('NASA') ? 'Earthdata Fusion (1km)' : source.includes('ML') ? 'ML-AOD Fusion' : 'Ground Matrix (v4.0)'}
                    </p>
                  </div>
                </div>
                {(source.includes('NASA') || source.includes('ML')) && (
                  <div className="bg-primary/20 text-primary text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter border border-primary/20">
                    Live
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-text-main/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${dqss > 80 ? 'bg-primary shadow-glow' : 'bg-amber-400 shadow-amber-400/20'}`}></div>
          <span className="text-label !text-text-main">
            {mlDqss ? mlDqss.badge : dqss > 80 ? 'High Confidence' : 'Hybrid Estimating'}
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-40 text-text-dim">
           <Database size={12}/>
           <span className="text-label !tracking-tight">{mlDqss ? 'ML DQSS v2' : 'Edge Matrix v1.1'}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DataSourcesCard;
