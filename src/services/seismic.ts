import { SeismicData, SeismicEvent } from '../types';

const seismicCache = new Map<string, { data: SeismicData; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

interface USGSEventFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
  };
  geometry: {
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
}

interface USGSGeoJsonResponse {
  features?: USGSEventFeature[];
  metadata?: {
    count: number;
  };
}

/**
 * Calculates approximate great-circle distance in kilometers using the Haversine formula
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Queries the authoritative USGS Earthquake Hazards API for seismic activity within a 250 km radius
 */
export async function fetchSeismicData(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<{ data: SeismicData | null; error: string | null }> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = seismicCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { data: cached.data, error: null };
  }

  // Look back 90 days for significant events >= M2.5 within 250 km
  const startTime = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const url = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lng.toString());
  url.searchParams.set('maxradiuskm', '250');
  url.searchParams.set('minmagnitude', '2.5');
  url.searchParams.set('starttime', startTime);
  url.searchParams.set('limit', '10');

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) {
      return { data: null, error: `USGS API returned status HTTP ${res.status}` };
    }

    const json: USGSGeoJsonResponse = await res.json();
    const features = json.features || [];

    let maxMag: number | undefined;
    let nearestEvent: SeismicEvent | undefined;
    const allEvents: SeismicEvent[] = [];

    if (features.length > 0) {
      const mags = features.map((f) => f.properties.mag).filter((m) => typeof m === 'number');
      if (mags.length > 0) {
        maxMag = Math.max(...mags);
      }

      // Map all events and find nearest event
      let shortestDist = Infinity;
      for (const feat of features) {
        const featLng = feat.geometry.coordinates[0];
        const featLat = feat.geometry.coordinates[1];
        const dist = calculateDistanceKm(lat, lng, featLat, featLng);
        const ev: SeismicEvent = {
          id: feat.id,
          magnitude: feat.properties.mag,
          place: feat.properties.place,
          time: new Date(feat.properties.time).toISOString(),
          distanceKm: dist,
        };
        allEvents.push(ev);

        if (dist < shortestDist) {
          shortestDist = dist;
          nearestEvent = ev;
        }
      }
    }

    const result: SeismicData = {
      latitude: lat,
      longitude: lng,
      recentEventCount: features.length,
      maxMagnitude: maxMag,
      nearestEvent,
      events: allEvents,
      retrievedAt: new Date().toISOString(),
      provider: 'USGS Earthquake Hazards Program',
      dataTier: 'observation',
      dataSourceNotes: 'Global Seismographic Network (GSN) direct physical observational telemetry within 250km radius',
    };

    seismicCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return { data: result, error: null };
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      return { data: null, error: null };
    }
    return { data: null, error: 'USGS seismic service query failed.' };
  }
}
