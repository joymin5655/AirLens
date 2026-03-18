import { supabase } from './supabase';

export interface CaptureData {
  userId: string;
  imageHash?: string;
  pm25Est: number;
  aqiClass: string;
  confidence: number;
  lat?: number;
  lon?: number;
  cityName?: string;
}

/**
 * Saves capture metadata (numeric results only) to the database.
 * Throws '이미 분석된 이미지입니다' on duplicate hash (UNIQUE violation).
 */
export const saveCapture = async (data: CaptureData) => {
  const { error } = await supabase.from('captures').insert({
    user_id: data.userId,
    image_hash: data.imageHash ?? null,
    pm25_est: data.pm25Est,
    aqi_class: data.aqiClass,
    confidence: data.confidence,
    location_lat: data.lat,
    location_lon: data.lon,
    city_name: data.cityName,
  });

  if (error) {
    if (error.code === '23505') throw new Error('이미 분석된 이미지입니다');
    throw error;
  }
  return true;
};

/**
 * Computes SHA-256 hash of a file using the Web Crypto API.
 * Returns a hex string.
 */
export const computeImageHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
