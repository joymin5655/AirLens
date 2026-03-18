import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Globe from '../components/Globe';
import AirQualityMarkers from '../components/AirQualityMarkers';
import CityMarkers from '../components/CityMarkers';
import { Globe as GlobeIcon, Info, Layers, ShieldCheck, ChevronLeft, MapPin, Sparkles, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GlobeView = () => {
  const { t } = useTranslation();
  const [showStations, setShowStations] = useState(true);
  const [showCities, setShowCities] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(6); // 0 to 6 representing past 7 days
  const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Day -1', 'Today'];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeIndex((prev) => (prev + 1) % 7);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-screen w-full relative bg-[#01080a] overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary/40 bg-[#01080a] gap-4">
          <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">{t('GLOBE.INITIALIZING')}</p>
        </div>
      }>
        <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
          <color attach="background" args={['#01080a']} />
          <Globe />
          {showStations && <AirQualityMarkers />}
          {showCities && <CityMarkers />}
        </Canvas>
      </Suspense>

      {/* Header Overlay */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-28 left-8 z-10 max-w-xs flex flex-col gap-6"
      >
        <Link to="/" className="inline-flex items-center gap-3 text-white/40 hover:text-primary transition-all group w-fit">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ChevronLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest font-sans">Return to Story</span>
        </Link>
        
        <div className="narrative-card !bg-black/40 !backdrop-blur-3xl !border-white/10 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] !rounded-[48px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-xl">
              <GlobeIcon className="text-primary w-5 h-5 animate-pulse" />
            </div>
            <span className="font-sans font-black text-primary uppercase tracking-[0.3em] text-[10px]">Flux Matrix v1.6</span>
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">
            Global <br/>
            <span className="italic font-serif font-light text-primary underline decoration-primary/20 underline-offset-4">Intelligence</span>
          </h1>
          
          <div className="mt-8 space-y-4">
            <button 
              onClick={() => setShowStations(!showStations)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 group ${showStations ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-60'}`}
            >
              <div className="flex items-center gap-3 text-white/80 text-[10px] font-black uppercase tracking-widest">
                <Layers size={16} className={showStations ? 'text-primary' : ''}/> {t('GLOBE.AOD_LAYER')}
              </div>
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${showStations ? 'bg-primary shadow-[0_0_12px_#25e2f4]' : 'bg-white/20'}`}></div>
            </button>
            
            <button 
              onClick={() => setShowCities(!showCities)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 group ${showCities ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-60'}`}
            >
              <div className="flex items-center gap-3 text-white/80 text-[10px] font-black uppercase tracking-widest">
                <MapPin size={16} className={showCities ? 'text-soft-green' : ''}/> Major Cities
              </div>
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${showCities ? 'bg-soft-green shadow-[0_0_12px_#10b981]' : 'bg-white/20'}`}></div>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50 cursor-not-allowed group">
              <div className="flex items-center gap-3 text-white/80 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={16}/> {t('GLOBE.DQSS_OVERLAY')}
                <span className="text-[8px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                  Coming Soon
                </span>
              </div>
              <div className="w-2.5 h-2.5 bg-white/10 rounded-full"></div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Legend & Stats Overlay - Bottom Left */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12 left-8 z-10"
      >
        <div className="glass-panel !bg-black/60 !backdrop-blur-2xl p-6 border-white/10 rounded-[32px] shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
             <Sparkles size={14} className="text-primary"/>
             <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Active Fusion Nodes</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 group">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#25e2f4]"></div>
              <span className="text-white/80 text-[10px] font-black font-sans uppercase tracking-wider group-hover:text-white transition-colors">NASA MAIAC (High-Res)</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-2 h-2 rounded-full bg-soft-green shadow-[0_0_8px_#10b981]"></div>
              <span className="text-white/80 text-[10px] font-black font-sans uppercase tracking-wider group-hover:text-white transition-colors">Global AQ Grid (WAQI)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Time-Series Playhead - Bottom Center */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4"
      >
        <div className="glass-panel !bg-black/60 !backdrop-blur-3xl border-white/10 p-5 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col gap-4">
          <div className="flex items-center justify-between text-white/60 text-[10px] font-black uppercase tracking-widest px-2">
            <span>{days[0]}</span>
            <span className="text-primary">{days[timeIndex]}</span>
            <span>{days[6]}</span>
          </div>
          
          <div className="relative h-2 bg-white/10 rounded-full w-full">
             <motion.div 
               className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-[0_0_12px_#25e2f4]"
               animate={{ width: `${(timeIndex / 6) * 100}%` }}
               transition={{ duration: 0.5, ease: 'easeInOut' }}
             />
          </div>

          <div className="flex items-center justify-center gap-6 text-white pt-2">
            <button 
              onClick={() => setTimeIndex((prev) => Math.max(0, prev - 1))}
              className="p-2 hover:text-primary transition-colors disabled:opacity-30"
              disabled={timeIndex === 0}
            >
              <SkipBack size={18} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-primary rounded-full text-black flex items-center justify-center shadow-[0_0_16px_#25e2f4] hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={() => setTimeIndex((prev) => Math.min(6, prev + 1))}
              className="p-2 hover:text-primary transition-colors disabled:opacity-30"
              disabled={timeIndex === 6}
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Uncertainty Note - Bottom Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-12 right-8 z-10 max-w-[280px]"
      >
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Info size={16} className="text-primary"/>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Causal Integrity</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed font-serif italic">{t('GLOBE.CONFIDENCE_NOTE')}</p>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Engine: PINN v2.1</span>
             <div className="w-1 h-1 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GlobeView;
