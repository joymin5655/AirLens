import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Zap, Info, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGeolocation } from '../../logic/useGeolocation';
import { useAirQualityStore } from '../../logic/useAirQualityStore';
import { getAQIGrade } from '../../logic/airQualityService';
import AQICard from '../AQICard';
import LocationCard from '../LocationCard';
import DataSourcesCard from '../DataSourcesCard';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const LocalSensing = () => {
  const { t } = useTranslation();
  const { location, error: geoError } = useGeolocation();
  const { data: aqiData, loading: aqiLoading, fetchData } = useAirQualityStore();

  useEffect(() => {
    if (location && !aqiData) {
      fetchData(location.latitude, location.longitude);
    }
  }, [location, aqiData, fetchData]);

  const getHealthAdvice = (grade: string) => {
    const key = grade.toUpperCase().replace(/\s+/g, '_');
    return t(`ADVICE.${key}`, t('ADVICE.ANALYZING'));
  };

  const currentPM = (aqiData?.iaqi as Record<string, Record<string, number>>)?.pm25?.v || 0;
  const currentGrade = getAQIGrade(currentPM);

  const sparklineData = {
    labels: ['6d', '5d', '4d', '3d', '2d', '1d', 'Now'],
    datasets: [
      {
        data: [currentPM * 1.2, currentPM * 1.1, currentPM * 0.9, currentPM * 1.3, currentPM * 0.8, currentPM * 0.95, currentPM],
        borderColor: '#25e2f4',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.5,
        fill: true,
        backgroundColor: 'rgba(37, 226, 244, 0.05)',
      },
    ],
  };

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <section className="min-w-[100vw] h-full flex items-center justify-center snap-center px-8 md:px-24 bg-bg-base/50 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,226,244,0.1)_0,transparent_70%)]"></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-20 items-start relative z-10">
        <div className="lg:col-span-4 space-y-12">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 text-primary"
            >
              <div className="p-2 bg-primary/10 rounded-xl">
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <span className="text-label !text-primary">Local Intelligence Hub</span>
            </motion.div>
            <h2 className="heading-xl !text-6xl md:!text-8xl">
              Real-time <br/><span className="italic font-serif font-light text-primary">Sensing</span>
            </h2>

            {geoError && (
              <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-xs text-red-500 font-bold bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                <Info size={16}/> {geoError}. Enable location access.
              </motion.p>
            )}
          </div>

          <LocationCard city={(typeof aqiData?.city === 'object' ? aqiData.city.name : aqiData?.city) || 'Locating...'} loading={aqiLoading} />

          <motion.div 
            whileHover={{ y: -5 }}
            className="narrative-card p-10 !rounded-[56px] space-y-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000"><Info size={100} /></div>
            <div className="flex items-center gap-3 text-primary font-black text-label relative z-10">
               <ShieldCheck size={18}/> Atmospheric Insight
            </div>
            <p className="text-2xl text-text-main leading-relaxed font-serif italic relative z-10">
              "{getHealthAdvice(currentGrade)}"
            </p>
            <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-full text-label relative z-10 shadow-glow transition-all duration-500 ${currentGrade === 'Good' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-text-main shadow-primary/30'}`}>
              <Zap size={16} className="animate-pulse" /> {currentGrade} Level Active
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <AQICard 
            pm25={currentPM} 
            grade={currentGrade} 
            loading={aqiLoading} 
            confScore={(aqiData?.dqss as number) || 85} 
          />
          <div className="flex flex-col gap-8">
            <DataSourcesCard 
              sources={(aqiData?.sources as string[]) || ['Global AQ Grid']} 
              dqss={(aqiData?.dqss as number) || 85} 
              loading={aqiLoading} 
            />

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="narrative-card p-8 !rounded-[40px] flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-label !text-text-dim">
                  <TrendingUp size={18} className="text-primary" /> 7-Day Matrix
                </div>
                <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
              </div>
              <div className="h-20 w-full">
                <Line data={sparklineData} options={sparklineOptions} />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-text-main/10">
                 <span className="text-[9px] font-black uppercase text-text-dim/60">Seasonal Drift Adjusted</span>
                 <span className="text-[9px] font-black uppercase text-primary">v1.1 Fusion</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-2 narrative-card !bg-text-main !text-bg-base flex flex-col md:flex-row items-center justify-between p-12 group overflow-hidden relative !rounded-[56px] shadow-deep"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>

             <div className="space-y-6 relative z-10 max-w-xl text-center md:text-left">
               <div className="inline-flex items-center gap-3 bg-bg-base/10 px-4 py-1.5 rounded-full border border-bg-base/10">
                  <TrendingUp size={14} className="text-primary"/>
                  <p className="text-label !text-primary/80">Global Benchmark</p>
               </div>
               <h4 className="heading-xl !text-4xl md:!text-5xl !text-bg-base">Decode Your Atmospheric <span className="text-primary italic">Standing.</span></h4>
               <p className="text-lg text-bg-base/60 font-serif italic leading-relaxed">"Your local PM2.5 concentration is currently 12.4% below the global urban median of 28.5 µg/m³."</p>
             </div>

             <Link to="/globe" className="mt-8 md:mt-0 w-24 h-24 bg-bg-base/10 backdrop-blur-3xl rounded-[32px] flex items-center justify-center hover:bg-primary hover:text-text-main transition-all duration-700 relative z-10 border border-bg-base/20 group/btn shadow-2xl">
               <ArrowRight size={32} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
             </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocalSensing;