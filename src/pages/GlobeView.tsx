import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Globe from '../components/Globe';
import AirQualityMarkers from '../components/AirQualityMarkers';
import { Globe as GlobeIcon, Info, Layers, ShieldCheck, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const GlobeView = () => {
  return (
    <div className="h-screen w-full relative bg-[#000005] overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white/50 bg-[#000005]">Initializing Earth...</div>}>
        <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
          <color attach="background" args={['#000005']} />
          <Globe />
          <AirQualityMarkers />
        </Canvas>
      </Suspense>

      {/* Header Overlay - Adjusted for Navbar visibility */}
      <div className="absolute top-24 left-6 z-10 max-w-xs flex flex-col gap-4">
        <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-2 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Back to Story</span>
        </Link>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <GlobeIcon className="text-forest w-5 h-5" />
            <span className="font-sans font-bold text-soft-green uppercase tracking-[0.2em] text-[10px]">Global Flux v1.0</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight leading-tight">Atmospheric <br/><span className="italic text-soft-green">Intelligence</span></h1>
          
          <div className="mt-6 space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-forest/20 rounded-xl border border-forest/30 transition-all">
              <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase"><Layers size={14}/> AOD Layer</div>
              <div className="w-2 h-2 bg-soft-green rounded-full shadow-[0_0_8px_#81c784]"></div>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-50 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase"><ShieldCheck size={14}/> DQSS Overlay</div>
              <div className="w-2 h-2 bg-white/20 rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Stats Overlay - Bottom Left */}
      <div className="absolute bottom-10 left-6 z-10">
        <div className="glass-panel !bg-black/40 p-4 border-white/10">
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Live Fusion Nodes</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-soft-green"></div>
              <span className="text-white/80 text-[9px] font-bold font-sans uppercase">NASA Earthdata (MAIAC)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              <span className="text-white/80 text-[9px] font-bold font-sans uppercase">World Air Quality (WAQI)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Uncertainty Note - Bottom Right */}
      <div className="absolute bottom-10 right-6 z-10 max-w-[240px]">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-soft-green"/>
            <span className="text-[9px] font-bold uppercase tracking-widest">Confidence Interval</span>
          </div>
          <p className="text-[10px] text-white/50 leading-relaxed font-serif">오렌지색 링은 p10~p90 신뢰 구간이 임계치를 초과한 불확실성 지역을 나타냅니다.</p>
        </div>
      </div>
    </div>
  );
};

export default GlobeView;
