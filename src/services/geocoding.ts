import { GeocodeResult } from '../types';

interface NominatimItem {
  place_id: number;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  importance?: number;
  boundingbox?: [string, string, string, string];
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface OpenMeteoGeoItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  country?: string;
}

// In-memory cache to prevent redundant requests and respect usage policies
const geocodeCache = new Map<string, GeocodeResult[]>();

// Request throttling tracker for Nominatim 1 req/sec policy
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000;

/**
 * Primary Geocoding with OpenStreetMap Nominatim, backed by Open-Meteo Geocoding fallback.
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<{ data: GeocodeResult[]; error: string | null }> {
  const trimmed = query.trim();

  if (!trimmed || trimmed.length < 2) {
    return { data: [], error: null };
  }

  const cacheKey = trimmed.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return { data: geocodeCache.get(cacheKey)!, error: null };
  }

  // 1. Try OSM Nominatim first
  try {
    // Throttle request if last request occurred within 1 second
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLast));
    }
    lastRequestTime = Date.now();

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('q', trimmed);
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '5');
    url.searchParams.set('email', 'atlas-intel@atlasiq.local');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });

    if (response.ok) {
      const items: NominatimItem[] = await response.json();

      if (items && items.length > 0) {
        const results: GeocodeResult[] = items.map((item) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);

          const city =
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.name ||
            '';

          const state = item.address?.state;
          const country = item.address?.country;

          let boundingBox: [number, number, number, number] | undefined;
          if (item.boundingbox && item.boundingbox.length === 4) {
            boundingBox = [
              parseFloat(item.boundingbox[0]),
              parseFloat(item.boundingbox[1]),
              parseFloat(item.boundingbox[2]),
              parseFloat(item.boundingbox[3]),
            ];
          }

          return {
            placeId: item.place_id,
            displayName: item.display_name,
            name: city || item.name || item.display_name.split(',')[0],
            lat,
            lng,
            type: item.type || item.osm_type || 'locality',
            importance: item.importance || 0,
            city,
            state,
            country,
            boundingBox,
          };
        });

        geocodeCache.set(cacheKey, results);
        return { data: results, error: null };
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: [], error: null };
    }
    // Continue to fallback
  }

  // 2. Fallback to Open-Meteo Geocoding API if Nominatim is rate-limited or blocked
  try {
    const fallbackUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    fallbackUrl.searchParams.set('name', trimmed);
    fallbackUrl.searchParams.set('count', '5');
    fallbackUrl.searchParams.set('language', 'en');
    fallbackUrl.searchParams.set('format', 'json');

    const fbRes = await fetch(fallbackUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
    });

    if (!fbRes.ok) {
      return {
        data: [],
        error: `Geocoding lookup returned HTTP ${fbRes.status}: ${fbRes.statusText}`,
      };
    }

    const fbData = await fbRes.json();
    const fbItems: OpenMeteoGeoItem[] = fbData.results || [];

    if (fbItems.length === 0) {
      return {
        data: [],
        error: `No geographic coordinates found matching "${trimmed}". Please refine your query.`,
      };
    }

    const results: GeocodeResult[] = fbItems.map((item) => {
      const parts = [item.name, item.admin1, item.country].filter(Boolean);
      return {
        placeId: item.id,
        displayName: parts.join(', '),
        name: item.name,
        lat: item.latitude,
        lng: item.longitude,
        type: item.feature_code || 'city',
        importance: 0.5,
        city: item.name,
        state: item.admin1,
        country: item.country,
      };
    });

    geocodeCache.set(cacheKey, results);
    return { data: results, error: null };
  } catch (fbErr: unknown) {
    if (fbErr instanceof DOMException && fbErr.name === 'AbortError') {
      return { data: [], error: null };
    }
    const message = fbErr instanceof Error ? fbErr.message : 'Connection to geocoding services failed';
    return {
      data: [],
      error: `Geocoding request failed: ${message}`,
    };
  }
}
