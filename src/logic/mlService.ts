/**
 * AirLens ML Service
 * Wraps FastAPI (AirLens-models) endpoints.
 * Dev:  requests go to /ml-api/* → proxied to http://localhost:8000 by Vite
 * Prod: VITE_ML_API_URL sets the base URL directly
 */
import { supabase } from './supabase';

// When VITE_ML_API_URL is set (prod), use it directly.
// In dev, leave empty so requests go to /ml-api which Vite proxies to localhost:8000.
const ML_BASE: string = (import.meta.env.VITE_ML_API_URL as string | undefined) ?? '/ml-api';
// NOTE: Do NOT add VITE_ML_API_KEY here — VITE_ prefix exposes secrets in the browser bundle.
// If the ML API server requires authentication, proxy requests through a Supabase Edge Function.

function buildHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

// ── Response types ────────────────────────────────────────────────────────────

export interface MLPrediction {
  predicted_p10: number;
  predicted_p50: number;
  predicted_p90: number;
  uncertainty: number;
  epistemic_std: number;
  uncertainty_normalized: number;
  model_version: string;
  method: string;
}

export interface MLDQSSResult {
  station_id: string;
  freshness: number;
  completeness: number;
  consistency: number;
  stability: number;
  model_residual: number;
  final_score: number;
  badge: string;
  badge_color: string;
}

export interface MLCameraResult {
  predicted_class: number;
  class_name: string;
  pm25_estimate: number;
  probabilities: number[];
  pred_reg: number;
  model: string;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function getJson<T>(path: string, params: Record<string, string | number>): Promise<T | null> {
  try {
    const url = new URL(`${ML_BASE}${path}`, window.location.href);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
    const res = await fetch(url.toString(), {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function postFormData<T>(path: string, formData: FormData): Promise<T | null> {
  try {
    const res = await fetch(`${ML_BASE}${path}`, {
      method: 'POST',
      headers: {},
      body: formData,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Usage quota check ─────────────────────────────────────────────────────────

interface UsageCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  plan: string;
  message?: string;
}

/**
 * Calls the check-usage Edge Function to verify quota and increment counter.
 * Returns null if the user is not authenticated (skips quota enforcement).
 */
async function checkUsage(actionType: 'ml_calls' | 'camera_calls'): Promise<UsageCheckResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke<UsageCheckResult>('check-usage', {
      body: { action_type: actionType },
    });
    if (error) {
      // Non-blocking: if quota service is unreachable, allow the call
      console.warn('[mlService] check-usage error (non-blocking):', error);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * AOD + weather → PM2.5 prediction (p10/p50/p90 + uncertainty).
 * Returns null on API failure (caller should fallback to physics model).
 */
export async function predictPM25(
  lat: number,
  lon: number,
  aod: number,
  temperature = 20.0,
  humidity = 50.0,
  wind_speed = 3.0,
  pblh = 1000.0,
): Promise<MLPrediction | null> {
  return getJson<MLPrediction>('/api/predict-grid', {
    lat, lon, aod, temperature, humidity, wind_speed, pblh,
  });
}

/**
 * 5-component ML-based DQSS score.
 * Returns null on API failure (caller should fallback to rule-based DQSS).
 */
export async function getDQSS(
  station_id: string,
  readings_24h = 20,
  cross_source_delta?: number,
  rolling_std_48h?: number,
  mean_residual?: number,
): Promise<MLDQSSResult | null> {
  const params: Record<string, string | number> = { station_id, readings_24h };
  if (cross_source_delta != null) params.cross_source_delta = cross_source_delta;
  if (rolling_std_48h != null) params.rolling_std_48h = rolling_std_48h;
  if (mean_residual != null) params.mean_residual = mean_residual;
  return getJson<MLDQSSResult>('/api/data-quality', params);
}

/**
 * Camera AI prediction via DINOv2 ONNX backend.
 * Checks server-side monthly quota before calling.
 * Returns null on API failure (caller should fallback to pixel-based analysis).
 * Throws with a user-visible message if quota is exceeded.
 */
export async function analyzeCameraImage(
  file: File,
  lat?: number,
  lon?: number,
): Promise<MLCameraResult | null> {
  // Server-side quota check (fail-closed: service error also blocks the call)
  const usage = await checkUsage('camera_calls');
  if (!usage || !usage.allowed) {
    throw new Error(usage?.message ?? '이번 달 Camera AI 사용 한도를 초과했습니다.');
  }

  const fd = new FormData();
  fd.append('image', file);
  if (lat != null) fd.append('lat', String(lat));
  if (lon != null) fd.append('lon', String(lon));
  return postFormData<MLCameraResult>('/api/camera-predict', fd);
}
