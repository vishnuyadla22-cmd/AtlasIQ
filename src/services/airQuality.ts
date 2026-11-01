import { AirQualityData } from '../types';

interface OpenMeteoAirQualityRaw {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    european_aqi?: number;
    us_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    nitrogen_dioxide?: number;
    ozone?: number;
  };
}

interface CacheEntry {
  data: AirQualityData;
  timestamp: number;
}

const aqCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function fetchAirQualityData(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<{ data: AirQualityData | null; error: string | null }> {
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = aqCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { data: cached.data, error: null };
  }

  try {
    const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set(
      'current',
      'european_aqi,us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone'
    );

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
    });

    if (!res.ok) {
      return {
        data: null,
        error: `Air quality service returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const json: OpenMeteoAirQualityRaw = await res.json();

    if (!json.current) {
      return {
        data: null,
        error: 'Response missing current air quality payload',
      };
    }

    const result: AirQualityData = {
      latitude: json.latitude,
      longitude: json.longitude,
      current: {
        time: json.current.time,
        europeanAqi: json.current.european_aqi,
        usAqi: json.current.us_aqi,
        pm2_5: json.current.pm2_5,
        pm10: json.current.pm10,
        nitrogenDioxide: json.current.nitrogen_dioxide,
        ozone: json.current.ozone,
      },
      provider: 'Copernicus CAMS via Open-Meteo Air Quality',
      retrievedAt: new Date().toISOString(),
      dataTier: 'model_analysis',
      dataSourceNotes: 'Atmospheric dispersion reanalysis & forecast models from Copernicus Atmosphere Monitoring Service (CAMS).',
    };

    aqCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return { data: result, error: null };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: null };
    }
    const message = err instanceof Error ? err.message : 'Air quality fetch failed';
    return {
      data: null,
      error: `Air quality service error: ${message}`,
    };
  }
}
