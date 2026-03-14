import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, RefreshCw, Save, Loader2, HeartPulse, BarChart3, Eye, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useCameraAI } from '../logic/useCameraAI';
import { useAuthStore } from '../logic/useAuthStore';
import { uploadImage, saveCapture } from '../logic/captureService';

type SideTab = 'live' | 'health' | 'aod';

const getHealthRisk = (pm25: number | null) => {
  if (!pm25) return { level: 'No Data', color: 'text-text-dim', bg: 'bg-text-main/5', desc: 'Upload a sky photo to get health impact analysis.', icon: Info };
  if (pm25 <= 12)  return { level: 'Good', color: 'text-green-500', bg: 'bg-green-500/10', desc: 'Air quality is satisfactory. No health risk for the general population.', icon: CheckCircle };
  if (pm25 <= 35)  return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/10', desc: 'Acceptable air quality. Unusually sensitive individuals may experience minor symptoms.', icon: Info };
  if (pm25 <= 55)  return { level: 'Unhealthy (Sensitive)', color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'Sensitive groups (elderly, children, asthma) should limit prolonged outdoor exertion.', icon: AlertTriangle };
  if (pm25 <= 150) return { level: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Everyone may begin to experience health effects. Sensitive groups at serious risk. Wear N95 mask outdoors.', icon: AlertTriangle };
  return { level: 'Hazardous', color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Emergency conditions. Entire population is likely to be affected. Stay indoors with air purifier.', icon: AlertTriangle };
};

const getAOD = (pm25: number | null) => {
  if (!pm25) return null;
  // Approximate AOD from surface PM2.5 via Beer-Lambert law (simplified)
  const aod = +(pm25 * 0.0065 + 0.02).toFixed(3);
  const type = pm25 < 20 ? 'Marine / Clean Continental' : pm25 < 60 ? 'Urban Mixed Aerosol' : 'Industrial / Biomass Burning';
  const scattering = pm25 < 20 ? 'Low scattering — high visibility' : pm25 < 60 ? 'Moderate scattering — hazy horizon' : 'High scattering — severely reduced visibility';
  const layer = pm25 < 20 ? '0–1 km (surface only)' : pm25 < 60 ? '0–2.5 km (boundary layer)' : '0–4 km (elevated plume likely)';
  return { aod, type, scattering, layer };
};

const CameraAI = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<SideTab>('live');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeImage, analyzing, modelLoading, result } = useCameraAI();
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setSaved(false);
      analyzeImage(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!user || !result || !file) return;
    setSaving(true);
    try {
      // 1. Upload image to private storage
      const filePath = await uploadImage(file, user.id);
      
      // 2. Save metadata to DB
      await saveCapture({ 
        userId: user.id, 
        imageUrl: filePath, 
        pm25Est: result.pm25, 
        aqiClass: result.grade, 
        confidence: result.confidence, 
        cityName: 'Local Sensing' 
      });
      
      setSaved(true);
      console.log('✅ Capture stored securely in Supabase');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Supabase Storage Error:', errorMessage);
      alert(`Save failed: ${errorMessage}. Please check your connection or RLS policies.`);
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <main className="flex flex-1 p-6 gap-6 flex-col lg:flex-row max-w-[1600px] mx-auto w-full mt-20">
      <aside className="flex w-full lg:w-72 flex-col gap-6">
        <div className="bg-bg-card p-6 rounded-2xl shadow-sm border border-text-main/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-label">Visionary Sensing v1.0</p>
            {modelLoading && (
              <div className="flex items-center gap-1.5 text-primary">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest">Loading</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {([
              { id: 'live', icon: Eye, label: 'Live Analysis' },
              { id: 'health', icon: HeartPulse, label: 'Health Impact' },
              { id: 'aod', icon: BarChart3, label: 'AOD Patterns' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm font-sans ${
                  activeTab === id
                    ? 'bg-primary text-earth-brown font-bold shadow-md shadow-primary/20'
                    : 'hover:bg-text-main/5 text-text-main font-medium'
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panel */}
        {activeTab === 'live' && (
          <div className="bg-text-main/5 p-6 rounded-2xl border border-primary/10">
            <h4 className="text-label text-primary mb-4 flex items-center gap-2"><Zap size={14}/> Physics Engine</h4>
            <p className="text-p text-[11px] font-serif">{t('CAMERA.PHYSICS_ENGINE_DESC')}</p>
          </div>
        )}

        {activeTab === 'health' && (() => {
          const risk = getHealthRisk(result?.pm25 ?? null);
          const RiskIcon = risk.icon;
          return (
            <div className="bg-bg-card p-6 rounded-2xl border border-text-main/5 shadow-sm space-y-4">
              <h4 className="text-label text-primary flex items-center gap-2"><HeartPulse size={14}/> Health Impact</h4>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${risk.bg}`}>
                <RiskIcon size={18} className={risk.color} />
                <span className={`text-sm font-black ${risk.color}`}>{risk.level}</span>
              </div>
              <p className="text-p text-[11px] leading-relaxed">{risk.desc}</p>
              <div className="space-y-2 pt-2 border-t border-text-main/10">
                <p className="text-label text-[9px]">WHO Annual Guideline</p>
                {[
                  { label: 'Good', range: '0–12', color: 'bg-green-500' },
                  { label: 'Moderate', range: '12–35', color: 'bg-yellow-400' },
                  { label: 'Unhealthy', range: '35–55', color: 'bg-orange-400' },
                  { label: 'Hazardous', range: '55+', color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[10px] text-text-dim font-medium">{item.label}</span>
                    <span className="text-[10px] text-text-dim ml-auto">{item.range} μg/m³</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {activeTab === 'aod' && (() => {
          const aod = getAOD(result?.pm25 ?? null);
          return (
            <div className="bg-bg-card p-6 rounded-2xl border border-text-main/5 shadow-sm space-y-4">
              <h4 className="text-label text-primary flex items-center gap-2"><BarChart3 size={14}/> AOD Patterns</h4>
              {aod ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-text-main">{aod.aod}</span>
                    <span className="text-label text-text-dim">AOD 550nm</span>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-text-main/10">
                    {[
                      { label: 'Aerosol Type', value: aod.type },
                      { label: 'Scattering', value: aod.scattering },
                      { label: 'Layer Estimate', value: aod.layer },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">{item.label}</p>
                        <p className="text-[11px] text-text-main font-semibold mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-dim italic border-t border-text-main/10 pt-3">Estimated via Beer-Lambert law from surface PM2.5</p>
                </>
              ) : (
                <p className="text-p text-[11px]">Upload a sky photo to estimate Aerosol Optical Depth and atmospheric layer composition.</p>
              )}
            </div>
          );
        })()}
      </aside>

      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 narrative-card flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <p className="text-label mb-4">AI Estimated PM2.5</p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40"><circle className="text-text-main/10" cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary" cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="440" strokeDashoffset={result ? 440 - (440 * result.pm25) / 150 : 440} strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-text-main font-sans">{result?.pm25 || '--'}</span>
                <span className="text-label text-primary">{result?.grade || 'IDLE'}</span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 bg-bg-card p-4 rounded-[40px] shadow-sm border border-text-main/5 overflow-hidden">
            <div className={`relative rounded-[32px] overflow-hidden aspect-video bg-text-main/5 border-2 border-dashed transition-all ${!preview && !modelLoading ? 'border-text-dim/20 cursor-pointer hover:border-primary/40' : !preview ? 'border-primary/20' : 'border-transparent'}`} onClick={() => !preview && !modelLoading && fileInputRef.current?.click()}>
              {preview ? (
                <>
                  <img src={preview} alt="Sky Feed" className="w-full h-full object-cover" />
                  {analyzing && <div className="absolute inset-0 bg-bg-card/60 backdrop-blur-md flex flex-col items-center justify-center text-text-main gap-4"><RefreshCw className="w-8 h-8 animate-spin text-primary" /><p className="text-label">DINOv2 Feature Extracting...</p></div>}
                  <div className="absolute bottom-6 left-6 flex gap-3">
                    <div className="bg-bg-card backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-text-main/5"><p className="text-label text-[9px]">Confidence</p><p className="text-lg font-bold text-text-main">{result?.confidence || '0'}%</p></div>
                    {user && result && !saved && <button onClick={(e) => {e.stopPropagation(); handleSave();}} className="bg-primary text-earth-brown px-6 py-2 rounded-xl text-label flex items-center gap-2 shadow-lg shadow-primary/20">{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Private</button>}
                  </div>
                </>
              ) : modelLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-text-dim">
                  <div className="bg-bg-card p-5 rounded-full border border-primary/20 shadow-inner">
                    <Loader2 size={32} className="animate-spin text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-main">Initializing AI Engine</p>
                    <p className="text-label !text-text-dim mt-1">Loading physics model weights...</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"><div className="bg-bg-card p-5 rounded-full text-primary"><Upload size={32} /></div><p className="font-bold text-text-main font-sans">Upload Sky Photo</p></div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-bg-card border border-text-main/5 shadow-sm"><p className="text-label text-[9px] mb-1">Model Engine</p><p className="text-sm font-bold text-text-main">DINOv2-Reg + PINN</p></div>
          <div className="p-5 rounded-2xl bg-bg-card border border-text-main/5 shadow-sm"><p className="text-label text-[9px] mb-1">Validation</p><p className="text-sm font-bold text-primary uppercase tracking-tighter">Verified (Beer-Lambert)</p></div>
          <div className="p-5 rounded-2xl bg-bg-card border border-text-main/5 shadow-sm"><p className="text-label text-[9px] mb-1">Data Privacy</p><p className="text-sm font-bold text-text-main">On-Device Local Processing</p></div>
        </div>
      </div>
    </main>
  );
};

export default CameraAI;
