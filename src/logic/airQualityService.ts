import axios from 'axios';
import proj4 from 'proj4';
import { APP_CONFIG } from './config';
import { fetchMaiacAodFromEdge, estimatePM25WithML } from './satelliteService';
import { getDQSS } from './mlService';
import type { AirQualityData } from './types';

// TM128 projection definition (에어코리아 좌표계)
const WGS84 = 'EPSG:4326';
const TM128 = '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43';

function wgs84ToTm128(lat: number, lon: number): { tmX: number; tmY: number } {
  const [tmX, tmY] = proj4(WGS84, TM128, [lon, lat]);
  return { tmX, tmY };
}

const SUPABASE_BASE = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const AIRKOREA_PROXY_URL = SUPABASE_BASE + '/functions/v1/airkorea-proxy';
const WAQI_PROXY_URL = SUPABASE_BASE + '/functions/v1/waqi-proxy';

export interface AirKoreaReading {
  stationName: string;
  pm25: number;
  pm10: number | null;
  dataTime: string;  // "2026-03-17 14:00"
  sido: string;
  addr: string;
}

/**
 * 에어코리아 근접 측정소를 조회하고 최신 PM2.5 값을 반환합니다.
 * CORS 우회를 위해 Supabase Edge Function (airkorea-proxy)을 경유합니다.
 */
export async function fetchAirKoreaStation(
  lat: number,
  lon: number
): Promise<AirKoreaReading | null> {
  try {
    const { tmX, tmY } = wgs84ToTm128(lat, lon);
    const headers = { Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

    // 1단계: TM128 좌표 → 근접 측정소명 조회
    const nearbyRes = await fetch(
      `${AIRKOREA_PROXY_URL}?type=nearby&tmX=${tmX}&tmY=${tmY}`,
      { headers, signal: AbortSignal.timeout(5000) }
    );
    if (!nearbyRes.ok) return null;
    const nearbyData = await nearbyRes.json();
    const stationName: string | undefined =
      nearbyData?.response?.body?.items?.[0]?.stationName;
    if (!stationName) return null;

    // 2단계: 측정소명 → 실시간 PM2.5 조회
    const rtRes = await fetch(
      `${AIRKOREA_PROXY_URL}?type=realtime&stationName=${encodeURIComponent(stationName)}`,
      { headers, signal: AbortSignal.timeout(5000) }
    );
    if (!rtRes.ok) return null;
    const rtData = await rtRes.json();
    const latest = rtData?.response?.body?.items?.[0];
    if (!latest) return null;

    return {
      stationName,
      pm25: parseFloat(latest.pm25Value) || 0,
      pm10: latest.pm10Value ? parseFloat(latest.pm10Value) : null,
      dataTime: latest.dataTime ?? '',
      sido: latest.sidoName ?? '',
      addr: latest.addr ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * 공기질 등급(Grade)을 PM2.5 농도에 따라 반환합니다.
 * APP_CONFIG.AQI_THRESHOLDS 값을 기반으로 하며, 이 값은 Supabase에서 동적으로 업데이트될 수 있습니다.
 */
export const getAQIGrade = (pm25: number): AirQualityData['grade'] => {
  const { GOOD, MODERATE, UNHEALTHY } = APP_CONFIG.AQI_THRESHOLDS;
  if (pm25 <= GOOD) return 'Good';
  if (pm25 <= MODERATE) return 'Moderate';
  if (pm25 <= UNHEALTHY) return 'Unhealthy';
  return 'Very Unhealthy';
};

/**
 * PM2.5 농도에 따른 마커 색상을 반환합니다.
 */
export const getMarkerColor = (pm25: number) => {
  const { GOOD, MODERATE, UNHEALTHY } = APP_CONFIG.AQI_THRESHOLDS;
  if (pm25 <= GOOD) return '#10b981';
  if (pm25 <= MODERATE) return '#f59e0b';
  if (pm25 <= UNHEALTHY) return '#f97316';
  return '#ef4444';
};

/**
 * v1.0 DQSS (Data Quality Security Score)
 * Freshness, source count, variance를 기반으로 데이터 신뢰도를 평가합니다.
 */
export const calculateDQSS = (data: {
  lastUpdated: string;
  sourceCount: number;
  variance?: number;
}) => {
  const { BASE_SCORE, FRESHNESS_MAX, SOURCE_MULTIPLICITY_MAX, VARIANCE_PENALTY_MAX } = APP_CONFIG.DQSS;
  let score = BASE_SCORE;

  // 1. Freshness (Max +FRESHNESS_MAX)
  const ageInHours = (Date.now() - new Date(data.lastUpdated).getTime()) / 3600000;
  if (ageInHours <= 1) score += FRESHNESS_MAX;
  else if (ageInHours <= 6) score += FRESHNESS_MAX / 2;
  else if (ageInHours <= 24) score += FRESHNESS_MAX / 6;

  // 2. Source Multiplicity (Max +SOURCE_MULTIPLICITY_MAX)
  if (data.sourceCount >= 3) score += SOURCE_MULTIPLICITY_MAX;
  else if (data.sourceCount === 2) score += SOURCE_MULTIPLICITY_MAX / 2;

  // 3. Data Consistency (Penalty for high variance)
  if (data.variance && data.variance > 10) {
    score -= Math.min(VARIANCE_PENALTY_MAX, data.variance);
  }

  return Math.min(100, Math.max(0, score));
};


/**
 * OpenAQ API를 통해 주변 관측소 데이터를 실시간으로 가져옵니다.
 * 이는 위성 데이터와 융합하여 데이터 신뢰도(DQSS)를 높이는 데 사용됩니다.
 */
export const fetchNearbyOpenAQ = async (lat: number, lon: number, radius = 25000) => {
  try {
    const response = await axios.get('https://api.openaq.org/v2/measurements', {
      params: {
        coordinates: `${lat},${lon}`,
        radius: radius,
        parameter: 'pm25',
        limit: 10,
        order_by: 'datetime'
      }
    });
    return response.data.results;
  } catch (error) {
    console.warn('OpenAQ API Fetch Error:', error);
    return [];
  }
};

/**
 * 실시간 위성 AOD 및 지상 관측소 데이터를 융합한 통합 공기질 분석
 */
export const fetchIntegratedAirQuality = async (lat: number, lon: number) => {
  try {
    // 1. WAQI (기본 관측소 데이터) 가져오기
    const waqiData = await fetchAirQuality(lat, lon);

    // 2. OpenAQ (추가 관측소 데이터) 가져오기
    const openaqResults = await fetchNearbyOpenAQ(lat, lon);

    // 3. 데이터 소스 다양성 확인 (Source Multiplicity)
    const uniqueSources = new Set(openaqResults.map((r: Record<string, unknown>) => r.sourceName));
    uniqueSources.add('WAQI');

    // 3b. 한국 좌표 감지 → 에어코리아 직접 연동 (우선순위 높음)
    const isKorea = lat >= 33 && lat <= 38.5 && lon >= 124 && lon <= 130;
    let primaryPM25: number | null = null;
    let primarySource = 'WAQI';

    if (isKorea) {
      const akData = await fetchAirKoreaStation(lat, lon);
      if (akData && akData.pm25 > 0) {
        primaryPM25 = akData.pm25;
        primarySource = `AirKorea (${akData.stationName})`;
        uniqueSources.add(primarySource);
      }
    }
    
    // 4. NASA Satellite AOD Fetch (MCD19A2 High-Res via Edge Function)
    const nasaData = await fetchMaiacAodFromEdge(lat, lon);
    const stationPM = primaryPM25 ?? waqiData.iaqi.pm25?.v ?? 0;

    // ML PM2.5 estimation (falls back to physics model if API unavailable)
    const mlEstimation = await estimatePM25WithML(nasaData.aod, stationPM, lat, lon);
    const satEstimation = {
      ...mlEstimation,
      confidence: nasaData.confidence,
      granule_id: nasaData.granule_id,
    };

    if (nasaData.source) {
      uniqueSources.add(nasaData.source);
    }

    // 5. ML DQSS (5-component) — reuse result already fetched inside fetchAirQuality
    const mlDqss = waqiData.mlDqss ?? null;
    const finalDqss = mlDqss
      ? mlDqss.final_score
      : calculateDQSS({
          lastUpdated: waqiData.time.iso,
          sourceCount: uniqueSources.size,
          variance: openaqResults.length > 0 ? 5 : 15,
        });

    return {
      ...waqiData,
      satellite: satEstimation,
      sources: Array.from(uniqueSources),
      primarySource,
      dqss: finalDqss,
      mlDqss: mlDqss ?? undefined,
      isMultiSource: uniqueSources.size > 1
    };
  } catch (error) {
    console.error('Integrated AQI Error:', error);
    throw error;
  }
};

/**
 * Advanced Satellite PM2.5 Estimation
 * Fuses station data with AOD physics.
 */
export const estimateSatPM25 = (stationPM: number, aodValue: number | null = null) => {
  if (stationPM == null) return null;

  const baseValue = aodValue !== null ? aodValue * APP_CONFIG.SATELLITE.AOD_PM25_RATIO : stationPM;
  
  const season = new Date().getMonth() + 1;
  const humidity = APP_CONFIG.SATELLITE.DEFAULT_HUMIDITY;
  
  const correction = 1 + (season > 10 || season < 3 ? APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.WINTER_LATE : APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.SUMMER) - (humidity * 0.08);
  const finalPM = Math.max(1, Math.round(baseValue * correction * 10) / 10);
  
  return {
    pm25: finalPM,
    uncertainty: aodValue ? 8 : 15,
    bias: Math.round((finalPM - stationPM) * 10) / 10
  };
};

/**
 * WAQI forecast.daily.pm25 — 7일 PM2.5 스파크라인용 실제 데이터 반환.
 * 과거 4일 + 현재 + 예측 2일 (최대 7개) avg 값을 반환합니다.
 * 데이터 부족 시 빈 배열 반환.
 */
export const fetchWaqiForecast = async (stationUid: number): Promise<number[]> => {
  try {
    const res = await fetch(
      `${WAQI_PROXY_URL}?type=station&uid=${stationUid}`,
      { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok') return [];
    const daily: Array<{ avg: number }> = data.data?.forecast?.daily?.pm25 ?? [];
    if (daily.length === 0) return [];
    // Take up to 7 entries (past + present + near-future), use avg
    return daily.slice(-7).map((d: { avg: number }) => d.avg);
  } catch {
    return [];
  }
};

export const fetchAirQuality = async (lat: number, lon: number) => {
  try {
    const res = await fetch(
      `${WAQI_PROXY_URL}?type=geo&lat=${lat}&lon=${lon}`,
      { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error('WAQI proxy request failed');
    const response = await res.json();
    if (response.status === 'ok') {
      const d = response.data;
      const stationId = String(d.idx ?? `${lat.toFixed(2)},${lon.toFixed(2)}`);
      const mlDqss = await getDQSS(stationId, d.attributions?.length || 1);
      const dqss = mlDqss
        ? mlDqss.final_score
        : calculateDQSS({ lastUpdated: d.time.iso, sourceCount: d.attributions?.length || 1 });
      return { ...d, dqss, mlDqss: mlDqss ?? undefined };
    }
    throw new Error(response.data || 'Failed to fetch AQI');
  } catch (error) {
    console.error('AQI Fetch Error:', error);
    throw error;
  }
};
