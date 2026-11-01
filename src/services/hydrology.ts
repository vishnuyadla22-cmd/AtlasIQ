import { HydrologyData } from '../types';

const hydrologyCache = new Map<string, { data: HydrologyData; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

interface GlofasResponse {
  latitude: number;
  longitude: number;
  daily?: {
    time: string[];
    river_discharge?: (number | null)[];
  };
}

interface SoilMoistureResponse {
  latitude: number;
  longitude: number;
  hourly?: {
    time: string[];
    soil_moisture_0_to_7cm?: (number | null)[];
    soil_moisture_7_to_28cm?: (number | null)[];
    soil_moisture_28_to_100cm?: (number | null)[];
  };
}

/**
 * Fetches verified hydrological model indicators:
 * 1. Daily River Discharge from Copernicus GloFAS via Open-Meteo Flood API.
 * 2. Volumetric Soil Moisture (root-zone) from ECMWF Land Surface Model.
 */
export async function fetchHydrologyData(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<{ data: HydrologyData | null; error: string | null }> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = hydrologyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { data: cached.data, error: null };
  }

  const floodUrl = new URL('https://flood-api.open-meteo.com/v1/flood');
  floodUrl.searchParams.set('latitude', lat.toString());
  floodUrl.searchParams.set('longitude', lng.toString());
  floodUrl.searchParams.set('daily', 'river_discharge');
  floodUrl.searchParams.set('forecast_days', '1');

  const soilUrl = new URL('https://api.open-meteo.com/v1/forecast');
  soilUrl.searchParams.set('latitude', lat.toString());
  soilUrl.searchParams.set('longitude', lng.toString());
  soilUrl.searchParams.set('hourly', 'soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_moisture_28_to_100cm');
  soilUrl.searchParams.set('forecast_days', '1');

  try {
    const [floodRes, soilRes] = await Promise.all([
      fetch(floodUrl.toString(), { method: 'GET', headers: { Accept: 'application/json' }, signal }),
      fetch(soilUrl.toString(), { method: 'GET', headers: { Accept: 'application/json' }, signal }),
    ]);

    let riverDischarge: number | undefined;
    let soilMoisture0to7cm: number | undefined;
    let soilMoisture7to28cm: number | undefined;
    let soilMoisture28to100cm: number | undefined;
    let observationTime: string | undefined;

    if (floodRes.ok) {
      const floodJson: GlofasResponse = await floodRes.json();
      if (floodJson.daily?.river_discharge && floodJson.daily.river_discharge.length > 0) {
        const val = floodJson.daily.river_discharge[0];
        if (typeof val === 'number') {
          riverDischarge = val;
        }
      }
    }

    if (soilRes.ok) {
      const soilJson: SoilMoistureResponse = await soilRes.json();
      if (soilJson.hourly?.time && soilJson.hourly.time.length > 0) {
        observationTime = soilJson.hourly.time[0];
        const sm0 = soilJson.hourly.soil_moisture_0_to_7cm?.[0];
        const sm7 = soilJson.hourly.soil_moisture_7_to_28cm?.[0];
        const sm28 = soilJson.hourly.soil_moisture_28_to_100cm?.[0];

        if (typeof sm0 === 'number') soilMoisture0to7cm = sm0;
        if (typeof sm7 === 'number') soilMoisture7to28cm = sm7;
        if (typeof sm28 === 'number') soilMoisture28to100cm = sm28;
      }
    }

    const data: HydrologyData = {
      latitude: lat,
      longitude: lng,
      riverDischarge,
      soilMoisture0to7cm,
      soilMoisture7to28cm,
      soilMoisture28to100cm,
      time: observationTime || new Date().toISOString(),
      provider: 'Copernicus GloFAS & ECMWF Land Hydrology via Open-Meteo',
      dataTier: 'model_analysis',
      dataSourceNotes: 'Global Flood Awareness System (0.05° grid) & ECMWF IFS Land Hydrological Model (0.1° grid)',
      retrievedAt: new Date().toISOString(),
    };

    hydrologyCache.set(cacheKey, { data, timestamp: Date.now() });
    return { data, error: null };
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      return { data: null, error: null };
    }
    return { data: null, error: 'Hydrological model service query failed.' };
  }
}
