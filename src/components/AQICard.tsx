import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';
import type { SatelliteEstimation } from '../logic/types';

interface AQICardProps {
  pm25: number;
  grade: string;
  loading: boolean;
  confScore?: number;
  satellite?: SatelliteEstimation;
}

const getGradeColors = (grade: string) => {
  switch (grade) {
    case 'Good':
      return { primary: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    case 'Moderate':
      return { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    case 'Unhealthy':
      return { primary: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
    case 'Very Unhealthy':
      return { primary: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.1)' };
    default:
      return { primary: '#25e2f4', bg: 'rgba(37, 226, 244, 0.1)' };
  }
};

const AQICard = ({ pm25, grade, loading, confScore = 92, satellite }: AQICardProps) => {
  const { t } = useTranslation();
  const colors = getGradeColors(grade);

  const displayConfidence = satellite?.uncertainty != null
    ? Math.max(0, Math.round(100 - satellite.uncertainty * 3))
    : confScore;

  const sourceLabel = satellite?.source ?? 'NASA AOD Physics';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="narrative-card shadow-2xl !p-10 relative overflow-hidden group transition-colors duration-500"
    >
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 opacity-20 transition-all duration-1000 group-hover:scale-150"
        style={{ backgroundColor: colors.primary }}
      ></div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-text-main/5 border border-text-main/5">
           <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></div>
           <span className="text-label !text-text-dim">{t('AQI_CARD.LABEL')}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-center gap-3">
            <h3 className="heading-xl !text-[120px] !text-text-main">
              {loading ? '--' : pm25}
            </h3>
            <span className="text-2xl font-bold text-text-dim uppercase tracking-widest">µg/m³</span>
          </div>
          <p className="heading-lg !text-4xl italic !text-text-main leading-none">
            {loading ? t('AQI_CARD.ANALYZING') : grade}
          </p>
          {!loading && satellite?.p10 != null && satellite?.p90 != null && (
            <p className="text-[10px] font-black text-text-dim/50 uppercase tracking-widest mt-1">
              {satellite.p10.toFixed(1)} – {satellite.p90.toFixed(1)} µg/m³
            </p>
          )}
        </div>

        <div className="w-full space-y-4 pt-4 border-t border-text-main/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-label !text-text-dim">
              <ShieldCheck size={14} className="text-primary" /> Confidence
            </div>
            <span className="text-xs font-black text-text-main">{displayConfidence}%</span>
          </div>
          <div className="h-2 w-full bg-text-main/5 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayConfidence}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full shadow-glow"
              style={{ backgroundColor: colors.primary }}
            ></motion.div>
          </div>
          <div className="flex items-center gap-2 text-text-dim/40 group-hover:text-text-dim/60 transition-colors">
             <Info size={12}/>
             <span className="text-[9px] font-black uppercase tracking-widest leading-none truncate">{sourceLabel}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AQICard;
