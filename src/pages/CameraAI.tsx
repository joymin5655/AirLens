import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Upload, RefreshCw, Save, Loader2, HeartPulse, History, Eye, Zap, AlertTriangle, CheckCircle, Info, MapPin, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCameraAI } from '../logic/useCameraAI';
import { useAuthStore } from '../logic/useAuthStore';
import { supabase } from '../logic/supabase';
import { saveCapture, computeImageHash } from '../logic/captureService';
import AdBanner from '../components/AdBanner';

type SideTab = 'live' | 'history' | 'health';

const getHealthRisk = (pm25: number | null) => {
  if (!pm25) return { level: 'No Data', color: 'text-text-dim', bg: 'bg-text-main/5', desc: 'Perform a live analysis to see health impacts.', icon: Info };
  if (pm25 <= 12)  return { level: 'Good', color: 'text-green-500', bg: 'bg-green-500/10', desc: 'Air quality is satisfactory. No health risk for the general population.', icon: CheckCircle };
  if (pm25 <= 35)  return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/10', desc: 'Acceptable air quality. Sensitive individuals may experience minor symptoms.', icon: Info };
  if (pm25 <= 55)  return { level: 'Unhealthy (Sensitive)', color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'Sensitive groups should limit outdoor exertion.', icon: AlertTriangle };
  return { level: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Everyone may begin to experience health effects.', icon: AlertTriangle };
};

const CameraAI = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<SideTab>('live');
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { analyzeImage, analyzing, modelLoading, result, error } = useCameraAI();
  const { user } = useAuthStore();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('captures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setHistory(data || []);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchHistory();
    }
  }, [activeTab, user, fetchHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error(t('CAMERA.INVALID_FILE_TYPE'));
      e.target.value = '';
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error(t('CAMERA.FILE_TOO_LARGE'));
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setSaved(false);
    analyzeImage(selectedFile);
  };

  const handleSave = async () => {
    if (!user || !result || !file) return;
    setSaving(true);
    try {
      const imageHash = await computeImageHash(file);
      await saveCapture({
        userId: user.id,
        imageHash,
        pm25Est: result.pm25,
        aqiClass: result.grade,
        confidence: result.confidence,
        cityName: 'Web Upload'
      });
      setSaved(true);
      if (activeTab === 'history') fetchHistory();
    } catch (err: any) {
      if (err.message === '이미 분석된 이미지입니다') {
        toast.info(t('CAMERA.DUPLICATE_IMAGE'));
      } else {
        toast.error(`Save failed: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex flex-1 p-4 sm:p-6 gap-6 flex-col lg:flex-row max-w-[1600px] mx-auto w-full mt-16 sm:mt-20">
      {/* Sidebar Navigation */}
      <aside className="flex w-full lg:w-72 flex-col gap-6">
        <div className="bg-bg-card p-6 rounded-2xl shadow-sm border border-text-main/5">
          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-4">Sensing Module</p>
          <div className="flex flex-col gap-2">
            {([
              { id: 'live', icon: Eye, label: 'Live Analysis' },
              { id: 'history', icon: History, label: 'Sensing History' },
              { id: 'health', icon: HeartPulse, label: 'Health Impact' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm font-bold ${
                  activeTab === id
                    ? 'bg-primary text-bg-base shadow-lg shadow-primary/20'
                    : 'hover:bg-text-main/5 text-text-dim hover:text-text-main'
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Context Panel */}
        <div className="min-h-[140px]">
          <AnimatePresence mode="wait">
            {activeTab === 'health' && (
              <motion.div 
                key="health-panel"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="bg-bg-card p-6 rounded-2xl border border-text-main/5 shadow-sm space-y-4"
              >
                <h4 className="text-xs font-black text-primary uppercase tracking-widest">Medical Insights</h4>
                {(() => {
                  const risk = getHealthRisk(result?.pm25 ?? null);
                  const RiskIcon = risk.icon;
                  return (
                    <>
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${risk.bg}`}>
                        <RiskIcon size={18} className={risk.color} />
                        <span className={`text-xs font-black uppercase ${risk.color}`}>{risk.level}</span>
                      </div>
                      <p className="text-[11px] text-text-dim leading-relaxed font-medium">{risk.desc}</p>
                    </>
                  );
                })()}
              </motion.div>
            )}
            
            {activeTab === 'live' && (
               <motion.div 
                 key="live-panel"
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 className="bg-primary/5 p-6 rounded-2xl border border-primary/10"
               >
                 <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Zap size={14}/> Engine Status
                 </h4>
                 <p className="text-[11px] text-text-dim leading-relaxed">
                   Using DINOv2-Reg for feature extraction. Visual parameters are mapped via a PINN architecture.
                 </p>
               </motion.div>
            )}

            {activeTab === 'history' && (
               <motion.div 
                 key="history-panel"
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 className="bg-secondary/5 p-6 rounded-2xl border border-secondary/10"
               >
                 <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
                   <History size={14}/> Sync Status
                 </h4>
                 <p className="text-[11px] text-text-dim leading-relaxed">
                   Records are synchronized with your private Supabase vault. Mobile uploads appear here instantly.
                 </p>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {activeTab === 'history' ? (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {historyLoading ? (
                <div className="col-span-full py-20 flex flex-col items-center text-text-dim">
                  <Loader2 size={32} className="animate-spin text-primary mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Retrieving Cloud Sync...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center text-text-dim border-2 border-dashed border-text-main/10 rounded-[40px]">
                  <History size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold">No mobile sensing records found.</p>
                  <p className="text-[10px] uppercase tracking-widest mt-2">Records from the mobile app will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="narrative-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <HeartPulse size={18} />
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-lg">
                        {item.aqi_class}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">PM2.5 Estimate</p>
                      <p className="text-3xl font-black text-text-main tracking-tighter mt-0.5">
                        {item.pm25_est} <span className="text-[10px] text-text-dim font-bold">μg/m³</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-text-main/5">
                      <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">
                        신뢰도 <span className="text-text-main">{item.confidence}%</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-text-dim">
                      <div className="flex items-center gap-1">
                        <MapPin size={10} />
                        <span className="text-[10px] font-bold">{item.city_name || 'Global'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span className="text-[10px] font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="live-view"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 narrative-card flex flex-col items-center justify-center text-center p-8">
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-6">Live AI Metrics</p>
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle className="text-text-main/5" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" />
                      <circle className="text-primary transition-all duration-1000 ease-out" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="502.4" strokeDashoffset={result ? 502.4 - (502.4 * Math.min(result.pm25, 150)) / 150 : 502.4} strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col items-center justify-center z-10">
                      <span className="text-6xl font-black text-text-main tracking-tighter">{result?.pm25 || '--'}</span>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{result?.grade || 'STANDBY'}</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-text-main/5 w-full flex justify-between">
                    <div><p className="text-[9px] font-bold text-text-dim uppercase">Confidence</p><p className="text-sm font-black text-text-main">{result?.confidence || 0}%</p></div>
                    <div className="text-right"><p className="text-[9px] font-bold text-text-dim uppercase">Status</p><p className="text-sm font-black text-green-500 uppercase tracking-tighter">{analyzing ? 'Processing' : 'Ready'}</p></div>
                  </div>
                </div>

                <div className="xl:col-span-8 bg-bg-card p-4 rounded-[40px] shadow-sm border border-text-main/5 relative">
                  <div 
                    className={`relative rounded-[32px] overflow-hidden aspect-video bg-text-main/5 border-2 border-dashed transition-all flex flex-col items-center justify-center ${!preview ? 'border-primary/20 cursor-pointer hover:bg-primary/5' : 'border-transparent'}`}
                    onClick={() => !preview && !modelLoading && document.getElementById('sky-upload')?.click()}
                  >
                    {preview ? (
                      <>
                        <img src={preview} alt="Sky Feed" className="w-full h-full object-cover" />
                        {analyzing && <div className="absolute inset-0 bg-bg-card/60 backdrop-blur-md flex flex-col items-center justify-center text-text-main gap-4"><RefreshCw className="w-8 h-8 animate-spin text-primary" /><p className="text-xs font-black uppercase tracking-widest">DINOv2 Analyzing...</p></div>}
                        <div className="absolute bottom-6 right-6 flex gap-3">
                          {user && result && !saved && (
                            <button onClick={(e) => {e.stopPropagation(); handleSave();}} className="btn-main !py-2.5 !px-6 shadow-xl shadow-primary/30 flex items-center gap-2">
                              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                              Sync to Cloud
                            </button>
                          )}
                          {saved && (
                            <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                              <CheckCircle size={14} /> Synced
                            </div>
                          )}
                          <button onClick={(e) => {e.stopPropagation(); setPreview(null); setFile(null);}} className="bg-bg-base/80 backdrop-blur text-text-main px-4 py-2 rounded-xl text-xs font-black border border-white/10 hover:bg-white/10">
                            Reset
                          </button>
                        </div>
                      </>
                    ) : modelLoading ? (
                      <div className="flex flex-col items-center gap-4 text-text-dim">
                        <Loader2 size={40} className="animate-spin text-primary" />
                        <p className="text-xs font-black uppercase tracking-widest">Initializing Vision Engine...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Upload size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-text-main">Upload Sky Perspective</p>
                          <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">Haze & Extinction analysis enabled</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input id="sky-upload" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                  {error && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{error}</span>
                      {(error.includes('한도') || error.includes('limit') || error.includes('quota')) && (
                        <button
                          onClick={() => navigate('/pricing')}
                          className="ml-auto text-primary underline whitespace-nowrap font-bold"
                        >
                          {t('CAMERA.UPGRADE_PLAN')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 narrative-card flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary"><Zap size={20} /></div>
                  <div><p className="text-[10px] font-black text-text-dim uppercase">Inference</p><p className="text-sm font-bold text-text-main">Edge Runtime (DINOv2)</p></div>
                </div>
                <div className="p-6 narrative-card flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><Shield size={20} /></div>
                  <div><p className="text-[10px] font-black text-text-dim uppercase">Security</p><p className="text-sm font-bold text-text-main">Private Vault Enforced</p></div>
                </div>
                <div className="p-6 narrative-card flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Info size={20} /></div>
                  <div><p className="text-[10px] font-black text-text-dim uppercase">Protocol</p><p className="text-sm font-bold text-text-main">Beer-Lambert Validated</p></div>
                </div>
              </div>

              <AdBanner position="bottom" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default CameraAI;
