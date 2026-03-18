/**
 * AirLens Global Configuration
 * Centralized source of truth for constants, thresholds, and theme values.
 */
const getEnv = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    console.warn(`⚠️ Missing environment variable: ${key}. Check .env file.`);
    return '';
  }
  return value || fallback || '';
};

// Initial static configuration
export const APP_CONFIG = {
  APP_NAME: 'AirLens',
  VERSION: '1.8.1',
  GITHUB_URL: 'https://github.com/joymin5655/AirLens',
  
  // API Configuration
  // WAQI_TOKEN は waqi-proxy Edge Function 経由でサーバー側に隔離済み
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),

  // Polar (payments) — product IDs are public; API token lives server-side only
  POLAR: {
    PRODUCT_ID_PLUS: getEnv('VITE_POLAR_PRODUCT_ID_PLUS'),
    PRODUCT_ID_PRO:  getEnv('VITE_POLAR_PRODUCT_ID_PRO'),
  },
  
  // Assets & Data
  BASE_DATA_URL: `${import.meta.env.BASE_URL}data`,
  PLACEHOLDER_HERO_IMAGE: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1024',
  
  // Air Quality Thresholds (PM2.5 µg/m³) - Fallbacks
  AQI_THRESHOLDS: {
    GOOD: 12,
    MODERATE: 35,
    UNHEALTHY: 75,
  },
  
  // DQSS Scoring Parameters - Fallbacks
  DQSS: {
    BASE_SCORE: 40,
    FRESHNESS_MAX: 30,
    SOURCE_MULTIPLICITY_MAX: 20,
    VARIANCE_PENALTY_MAX: 20,
  },
  
  // Satellite Estimation Constants - Fallbacks
  SATELLITE: {
    AOD_PM25_RATIO: 120,
    DEFAULT_HUMIDITY: 0.65,
    SEASONAL_CORRECTION: {
      WINTER_LATE: 0.12, // Nov-Feb
      SUMMER: -0.05,
    }
  },
  
  // Visual Theme (Three.js / Globe) - Fallbacks
  GLOBE_THEME: {
    EARTH_COLOR: '#1a3a5a',
    EMISSIVE_COLOR: '#001122',
    ATMOSPHERE_COLOR: '#25e2f4',
    CLOUDS_COLOR: '#ffffff',
    UNITS_MARKER_COLOR: '#81c784',
    WAQI_MARKER_COLOR: '#60a5fa',
  }
};

/**
 * Loads remote configuration from Supabase and merges into APP_CONFIG.
 * This should be called early in the app lifecycle.
 */
export const loadRemoteConfig = async () => {
  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value');

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ app_settings table not initialized or empty. Using defaults.');
        return;
      }
      throw error;
    }

    if (data) {
      data.forEach((setting: { key: string; value: Record<string, unknown> }) => {
        if (setting.key in APP_CONFIG) {
          const configKey = setting.key as keyof typeof APP_CONFIG;
          const currentValue = APP_CONFIG[configKey];
          
          if (typeof currentValue === 'object' && currentValue !== null) {
            (APP_CONFIG as Record<string, unknown>)[configKey] = {
              ...currentValue,
              ...setting.value
            };
            console.log(`✅ Remote config applied for: ${setting.key}`);
          }
        }
      });
    }
  } catch (err) {
    console.warn('⚠️ Failed to load remote config from Supabase. Using local fallbacks.', err);
  }
};
