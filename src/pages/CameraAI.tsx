import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, RefreshCw, Save, Loader2, HeartPulse, BarChart3, Eye, Zap } from 'lucide-react';
import { useCameraAI } from '../logic/useCameraAI';
import { useAuthStore } from '../logic/useAuthStore';
import { uploadImage, saveCapture } from '../logic/captureService';

const CameraAI = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeImage, analyzing, result } = useCameraAI();
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
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4 font-sans">Visionary Sensing v1.0</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-forest text-warm-cream shadow-md shadow-forest/20">
              <Eye size={18} /> <p className="text-sm font-bold font-sans">Live Analysis</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sage/20 transition-colors text-text-main">
              <HeartPulse size={18} /> <p className="text-sm font-medium font-sans">Health Impact</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sage/20 transition-colors text-text-main">
              <BarChart3 size={18} /> <p className="text-sm font-medium font-sans">AOD Patterns</p>
            </div>
          </div>
        </div>
        <div className="bg-sage/30 p-6 rounded-2xl border border-soft-green/20">
          <h4 className="font-bold text-xs font-sans uppercase mb-4 text-forest flex items-center gap-2"><Zap size={14}/> Physics Engine</h4>
          <p className="text-[11px] text-text-dim leading-relaxed font-serif">{t('CAMERA.PHYSICS_ENGINE_DESC')}</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 narrative-card flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <p className="text-text-dim font-bold uppercase tracking-widest text-[10px] mb-4 font-sans">AI Estimated PM2.5</p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40"><circle className="text-sage/30" cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-forest" cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="440" strokeDashoffset={result ? 440 - (440 * result.pm25) / 150 : 440} strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-text-main font-sans">{result?.pm25 || '--'}</span>
                <span className="text-[10px] font-bold text-forest uppercase font-sans tracking-widest">{result?.grade || 'IDLE'}</span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 bg-bg-card p-4 rounded-[40px] shadow-sm border border-text-main/5 overflow-hidden">
            <div className={`relative rounded-[32px] overflow-hidden aspect-video bg-sage/10 border-2 border-dashed transition-all ${!preview ? 'border-text-dim/20 cursor-pointer hover:border-forest/40' : 'border-transparent'}`} onClick={() => !preview && fileInputRef.current?.click()}>
              {preview ? (
                <>
                  <img src={preview} alt="Sky Feed" className="w-full h-full object-cover" />
                  {analyzing && <div className="absolute inset-0 bg-bg-card/60 backdrop-blur-md flex flex-col items-center justify-center text-text-main gap-4"><RefreshCw className="w-8 h-8 animate-spin text-forest" /><p className="font-bold tracking-widest text-[10px] uppercase font-sans">DINOv2 Feature Extracting...</p></div>}
                  <div className="absolute bottom-6 left-6 flex gap-3">
                    <div className="bg-bg-card backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-text-main/5"><p className="text-[9px] text-text-dim font-bold uppercase">Confidence</p><p className="text-lg font-bold text-text-main">{result?.confidence || '0'}%</p></div>
                    {user && result && !saved && <button onClick={(e) => {e.stopPropagation(); handleSave();}} className="bg-forest text-warm-cream px-6 py-2 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 shadow-lg shadow-forest/20">{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Private</button>}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"><div className="bg-sage p-5 rounded-full text-forest"><Upload size={32} /></div><p className="font-bold text-text-main font-sans">Upload Sky Photo</p></div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-bg-card border border-text-main/5 shadow-sm"><p className="text-text-dim text-[10px] font-bold uppercase mb-1 font-sans">Model Engine</p><p className="text-sm font-bold text-text-main">DINOv2-Reg + PINN</p></div>
          <div className="p-5 rounded-2xl bg-bg-card border border-text-main/5 shadow-sm"><p className="text-text-dim text-[10px] font-bold uppercase mb-1 font-sans">Validation</p><p className="text-sm font-bold text-forest uppercase tracking-tighter">Verified (Beer-Lambert)</p></div>
          <div className="p-5 rounded-2xl bg-bg-card border border-text-main/5 shadow-sm"><p className="text-text-dim text-[10px] font-bold uppercase mb-1 font-sans">Data Privacy</p><p className="text-sm font-bold text-text-main">On-Device Local Processing</p></div>
        </div>
      </div>
    </main>
  );
};

export default CameraAI;
