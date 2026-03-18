import { useState, useCallback, useEffect } from 'react';
import { APP_CONFIG } from './config';
import { getAQIGrade } from './airQualityService';
import { useAuthStore } from './useAuthStore';
import { analyzeCameraImage } from './mlService';

interface AnalysisResult {
  pm25: number;
  confidence: number;
  grade: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy';
  metrics: {
    hazeDensity: number;
    visibilityRange: number;
    aodEstimate: number;
  }
}

// Simulated rate limit cache for Free tier
const getDailyUsage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const data = localStorage.getItem('camera-ai-usage');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.date === today) return parsed.count;
    } catch {
      localStorage.removeItem('camera-ai-usage');
    }
  }
  return 0;
};

const incrementDailyUsage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const count = getDailyUsage() + 1;
  localStorage.setItem('camera-ai-usage', JSON.stringify({ date: today, count }));
};

export const useCameraAI = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { profile } = useAuthStore();
  const plan = profile?.plan ?? 'Free';

  // Inference runs server-side via ML API — no client-side ONNX loading needed
  useEffect(() => {
    setModelLoading(false);
    console.log(`✅ ${APP_CONFIG.APP_NAME} Camera AI ready (server-side DINOv2 ONNX)`);
  }, []);

  const analyzeImage = useCallback(async (file: File) => {
    setError(null);
    if (modelLoading) return;

    if (plan === 'Free') {
      const usage = getDailyUsage();
      if (usage >= 3) {
        setError('오늘의 무료 측정 3회를 모두 사용했어요. Plus 플랜으로 업그레이드하면 무제한으로 사용할 수 있어요.');
        return;
      }
    }

    setAnalyzing(true);
    setResult(null);

    // ── Attempt ML API (DINOv2 ONNX) ─────────────────────────────────────────
    let mlResult;
    try {
      mlResult = await analyzeCameraImage(file);
    } catch (err) {
      // Quota exceeded or other hard error — surface to the user
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
      setAnalyzing(false);
      return;
    }
    if (mlResult) {
      const pm25 = Math.max(2, Math.round(mlResult.pm25_estimate * 10) / 10);
      // Koschmieder's Law: Lv [km] = 3.912 / σ_ext, σ_ext ≈ 0.00096 × PM2.5^0.8
      const visibilityRange = pm25 > 0
        ? Math.max(1, Math.round(3912 / (0.96 * Math.pow(pm25, 0.8))))
        : 50;
      const aodEstimate = (mlResult as unknown as Record<string, unknown>).aod_estimate != null
        ? +((mlResult as unknown as Record<string, unknown>).aod_estimate as number).toFixed(3)
        : +(pm25 / 120).toFixed(3);
      const hazeDensity = (mlResult as unknown as Record<string, unknown>).haze_density != null
        ? +((mlResult as unknown as Record<string, unknown>).haze_density as number).toFixed(3)
        : +(Math.min(1, pm25 / 150)).toFixed(3);
      setResult({
        pm25,
        confidence: Math.round(Math.max(...mlResult.probabilities) * 100),
        grade: getAQIGrade(pm25),
        metrics: { hazeDensity, visibilityRange, aodEstimate },
      });
      if (plan === 'Free') incrementDailyUsage();
      setAnalyzing(false);
      return;
    }

    // ── Fallback: pixel-based physics analysis ────────────────────────────────
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { setAnalyzing(false); return; }

    const THUMB_SIZE = 224;
    canvas.width = THUMB_SIZE;
    canvas.height = THUMB_SIZE;
    ctx.drawImage(img, 0, 0, THUMB_SIZE, THUMB_SIZE);

    const imageData = ctx.getImageData(0, 0, THUMB_SIZE, THUMB_SIZE).data;
    let sumBright = 0, sumContrast = 0, blueShift = 0;

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2];
      const bright = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      sumBright += bright;
      sumContrast += (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
      blueShift += (b - (r + g) / 2) / 255;
    }

    const avgBright = sumBright / (THUMB_SIZE * THUMB_SIZE);
    const avgContrast = sumContrast / (THUMB_SIZE * THUMB_SIZE);
    const avgBlue = blueShift / (THUMB_SIZE * THUMB_SIZE);

    const hazeDensity = Math.max(0, (avgBright * (1 - avgContrast)) + (1 - Math.max(0, avgBlue)));
    const aodEstimate = +(hazeDensity * 0.8).toFixed(3);
    const pm25ForVis = Math.max(2, hazeDensity * APP_CONFIG.SATELLITE.AOD_PM25_RATIO * 1.1);
    // Koschmieder's Law: Lv [km] = 3.912 / σ_ext, σ_ext ≈ 0.00096 × PM2.5^0.8
    const visibilityRange = Math.max(1, Math.round(3912 / (0.96 * Math.pow(pm25ForVis, 0.8))));

    const pm25 = Math.max(2, Math.round(hazeDensity * APP_CONFIG.SATELLITE.AOD_PM25_RATIO * 1.1 * 10) / 10);
    const confidence = Math.min(99, 65 + (avgContrast * 35));

    await new Promise(r => setTimeout(r, 800));

    setResult({
      pm25,
      confidence: Math.round(confidence),
      grade: getAQIGrade(pm25),
      metrics: {
        hazeDensity: +(hazeDensity).toFixed(3),
        visibilityRange,
        aodEstimate,
      },
    });

    if (plan === 'Free') incrementDailyUsage();

    setAnalyzing(false);
    URL.revokeObjectURL(objectUrl);
  }, [modelLoading, plan]);

  return { analyzeImage, analyzing, modelLoading, result, error };
};