import { MapPin, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface LocationCardProps {
  city: string;
  loading: boolean;
  error?: string | null;
}

const LocationCard = ({ city, loading, error }: LocationCardProps) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="narrative-card !p-6 !rounded-[32px] flex items-center gap-5 shadow-xl group transition-colors duration-500"
    >
      <div className="bg-primary p-4 rounded-2xl shadow-glow group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
        <MapPin className="text-text-main w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
           <Navigation size={10} className="text-primary animate-pulse" />
           <p className="text-label !text-text-dim">Active Node</p>
        </div>
        <p className="heading-lg !text-xl truncate !text-text-main">
          {loading ? t('LOCATION.DETECTING') : error ? t('LOCATION.DENIED') : city}
        </p>
        <div className="flex items-center gap-2 mt-1 opacity-60">
           <span className="w-1 h-1 rounded-full bg-soft-green"></span>
           <p className="text-text-dim text-label !tracking-tight">
            {error ? t('LOCATION.DEFAULT_FALLBACK') : t('LOCATION.MONITORING')}
           </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationCard;
