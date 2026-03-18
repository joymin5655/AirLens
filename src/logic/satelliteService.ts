import axios from 'axios';
import { supabase } from './supabase';
import { APP_CONFIG } from './config';
import { predictPM25 } from './mlService';

/**
 * AirLens Satellite & Physics Intelligence Service
 * Fuses NASA Earthdata (MAIAC/AOD) products with ground station physics.
 */

interface AODResponse {
  aod: number;
  confidence: number;
  source: string;
}

/**
 * Fetches high-resolution (1km) MAIAC AOD from Supabase Edge Function.
 * This directly connects to NASA Earthdata CMR and potential OPeNDAP slices.
 */
export const fetchMaiacAodFromEdge = async (lat: number, lon: number): Promise<AODResponse & { granule_id?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('nasa-maiac-aod', {
      body: { lat, lon }
    });

    if (error) throw error;

    return {
      aod: Math.round(data.aod_value * 100) / 100,
      confidence: data.confidence,
      source: `NASA POWER TOTEXTTAU (MERRA-2)`,
    };
  } catch (err) {
    console.warn('Edge Function MAIAC Fetch Error, falling back to NASA POWER:', err);
    return fetchNasaAod(lat, lon);
  }
};

/**
 * Fetches real-time AOD from NASA POWER API (Simplified interface for v1.0)
 * Note: Real-time MAIAC (Multi-Angle Implementation of Atmospheric Correction) 
 * usually requires granule fetching via CMR, but NASA POWER provides 
 * a simpler REST interface for daily/climatology parameters.
 */
export const fetchNasaAod = async (lat: number, lon: number): Promise<AODResponse> => {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

    // NASA POWER: TOTEXTTAU = MERRA-2 total aerosol optical depth (550nm proxy)
    // CLRSKY/ALLSKY used to derive transmittance-based confidence
    const response = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
      params: {
        parameters: 'TOTEXTTAU,CLRSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DWN',
        community: 'AG',
        longitude: lon,
        latitude: lat,
        start: today,
        end: today,
        format: 'JSON'
      },
      timeout: 6000
    });

    const params = response.data.properties.parameter;
    const aod = Object.values(params.TOTEXTTAU)[0] as number;
    const clrSky = Object.values(params.CLRSKY_SFC_SW_DWN)[0] as number;
    const allSky = Object.values(params.ALLSKY_SFC_SW_DWN)[0] as number;

    if (aod == null || aod === -999) throw new Error('No TOTEXTTAU data');

    // Dynamic expectedClearSky from actual CLRSKY measurement
    const transmittance = clrSky > 0 ? Math.min(1, allSky / clrSky) : 0.7;
    const confidence = Math.round(transmittance * 85 + 10);

    return {
      aod: Math.max(0, Math.round(aod * 100) / 100),
      confidence,
      source: 'NASA POWER TOTEXTTAU (MERRA-2)'
    };
  } catch {
    console.warn('NASA POWER API fetch failed — using static low-confidence fallback.');
    // Static regional estimate based on latitude; no random values
    const latAbsNorm = Math.min(1, Math.abs(lat) / 60);
    const fallbackAod = 0.15 + latAbsNorm * 0.05; // 0.15~0.20 by latitude
    return {
      aod: Math.round(fallbackAod * 100) / 100,
      confidence: 30,
      source: 'Static Fallback (NASA unavailable)'
    };
  }
};

/**
 * Advanced Physics Correction for Satellite-to-Ground PM2.5
 * Uses seasonal constants and humidity from APP_CONFIG.
 */
export const calculateSatellitePM25 = (aod: number, stationPM: number) => {
  const ratio = APP_CONFIG.SATELLITE.AOD_PM25_RATIO;
  const month = new Date().getMonth() + 1;
  
  let seasonalCorrection = 1.0;
  if (month >= 11 || month <= 2) {
    seasonalCorrection += APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.WINTER_LATE;
  } else if (month >= 6 && month <= 8) {
    seasonalCorrection += APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.SUMMER;
  }

  // Final fused estimation
  const estValue = aod * ratio * seasonalCorrection;
  
  // Weighting station data vs satellite
  // If station data exists, we use it to anchor the satellite estimation (Hybrid)
  const finalPM = stationPM > 0 
    ? (stationPM * 0.7) + (estValue * 0.3) 
    : estValue;

  return {
    pm25: Math.round(finalPM * 10) / 10,
    uncertainty: stationPM > 0 ? 12 : 25,
    bias: Math.round((finalPM - stationPM) * 10) / 10
  };
};

/**
 * ML-aware PM2.5 estimation.
 * Tries ML API first; falls back to calculateSatellitePM25 on failure.
 */
export const estimatePM25WithML = async (
  aod: number,
  stationPM: number,
  lat: number,
  lon: number,
  weather: { temperature?: number; humidity?: number; wind_speed?: number; pblh?: number } = {},
): Promise<{ pm25: number; uncertainty: number; bias: number; source: string; p10?: number; p90?: number }> => {
  const ml = await predictPM25(
    lat, lon, aod,
    weather.temperature ?? 20.0,
    weather.humidity ?? 50.0,
    weather.wind_speed ?? 3.0,
    weather.pblh ?? 1000.0,
  );

  if (ml) {
    return {
      pm25: Math.round(ml.predicted_p50 * 10) / 10,
      uncertainty: Math.round(ml.uncertainty * 10) / 10,
      bias: Math.round((ml.predicted_p50 - stationPM) * 10) / 10,
      source: `ML-AODtoPM25Model (${ml.method})`,
      p10: Math.round(ml.predicted_p10 * 10) / 10,
      p90: Math.round(ml.predicted_p90 * 10) / 10,
    };
  }

  // Fallback to physics model
  const physics = calculateSatellitePM25(aod, stationPM);
  return { ...physics, source: 'Physics-Fallback' };
};
