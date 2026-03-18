// ── Global Types for AirLens ──

import type { MLDQSSResult } from './mlService';

export interface SatelliteEstimation {
  pm25: number;
  uncertainty: number;
  bias: number;
  source: string;       // "ML-AODtoPM25Model (xgb_lgb)" | "Physics-Fallback"
  p10?: number;
  p90?: number;
  confidence?: number;
  granule_id?: string;
}

export interface AirQualityData {
  pm25: number;
  aqi: number;
  city: string | { name: string };
  station: string;
  source: string;
  sources?: string[];
  lastUpdated: string;
  grade: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy';
  dqss?: number;
  iaqi?: any;
  satellite?: SatelliteEstimation;
  mlDqss?: MLDQSSResult;
}

export interface PolicyImpact {
  beforePeriod: {
    start: string;
    end: string;
    meanPM25: number;
    medianPM25: number;
    samples: number;
  };
  afterPeriod: {
    start: string;
    end: string;
    meanPM25: number;
    medianPM25: number;
    samples: number;
  };
  analysis: {
    deltaMean: number;
    percentChange: number;
    pValue: number;
    significant: boolean;
    effectSize: string;
  };
}

export interface TimelineEvent {
  date: string;
  event: string;
  pm25: number;
  syntheticPM25?: number; // SDID Synthetic Counterfactual
}

export interface Policy {
  id: string;
  name: string;
  implementationDate: string;
  type: string;
  url: string;
  description: string;
  targetPollutants: string[];
  measures: string[];
  impact: PolicyImpact;
  timeline: TimelineEvent[];
}

export interface CountryPolicy {
  country: string;
  countryCode: string;
  region: string;
  flag: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  policies: Policy[];
}

export interface PolicyIndexEntry {
  country: string;
  countryCode: string;
  region: string;
  flag: string;
  policyCount: number;
  lastUpdated: string;
}

export interface PolicyIndex {
  version: string;
  lastUpdated: string;
  description: string;
  countries: PolicyIndexEntry[];
}
