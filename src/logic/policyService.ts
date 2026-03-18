import { supabase } from './supabase';
import type { PolicyIndexEntry, CountryPolicy } from './types';

const ML_BASE: string = (import.meta.env.VITE_ML_API_URL as string | undefined) ?? '/ml-api';
// NOTE: Do NOT add VITE_ML_API_KEY here — VITE_ prefix exposes secrets in the browser bundle.

/**
 * AirLens-models SDID 결과 조회.
 * ML API 실패 시 null 반환 → caller가 Supabase fallback 처리.
 */
export const fetchMLPolicyImpact = async (countryCode?: string): Promise<Record<string, unknown> | null> => {
  try {
    const url = countryCode
      ? `${ML_BASE}/api/policy-impact?country=${encodeURIComponent(countryCode)}`
      : `${ML_BASE}/api/policy-impact`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
};

/**
 * 모든 국가 리스트 가져오기 (Supabase countries 테이블 사용)
 */
export const fetchPolicyIndex = async (): Promise<PolicyIndexEntry[]> => {
  const { data, error } = await supabase
    .from('countries')
    .select(`
      country:name,
      countryCode:code,
      region,
      flag,
      updated_at
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching policy index:', error);
    throw error;
  }

  // 기존 PolicyIndexEntry 타입에 맞춰 데이터 가공
  return (data as unknown[]).map((item: any) => ({
    country: item.country,
    countryCode: item.countryCode,
    region: item.region,
    flag: item.flag,
    policyCount: 0,
    lastUpdated: item.updated_at
  })) as PolicyIndexEntry[];
};

/**
 * 특정 국가의 정책 데이터 가져오기 (Supabase countries + policies 조인)
 */
export const fetchCountryPolicy = async (countryCode: string): Promise<CountryPolicy> => {
  const { data, error } = await supabase
    .from('countries')
    .select(`
      country:name,
      countryCode:code,
      region,
      flag,
      coordinates,
      policies (*)
    `)
    .eq('code', countryCode.toUpperCase())
    .single();

  if (error) {
    console.error('Error fetching country policy:', error);
    throw error;
  }

  return data as unknown as CountryPolicy;
};
