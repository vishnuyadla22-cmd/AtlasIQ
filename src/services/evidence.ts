import {
  GeocodeResult,
  WeatherData,
  AirQualityData,
  DomainIntelligence,
  DataClassification,
  WorldBankCountryData,
  HydrologyData,
  SeismicData,
} from '../types';
import { searchLocations } from './geocoding';
import { fetchWeatherData } from './weather';
import { fetchAirQualityData } from './airQuality';
import { fetchWorldBankData } from './worldBank';
import { fetchHydrologyData } from './hydrology';
import { fetchSeismicData } from './seismic';
import { buildDomainIntelligence } from './domains';

export interface EvidenceItem {
  id: string;
  domain: string;
  metric: string;
  value: string | number;
  unit: string;
  location: string;
  source: string;
  dataClassification: DataClassification;
  timestamp?: string;
  limitations?: string;
  geographicScope?: string;
}

export interface GroundedEvidenceContext {
  primaryLocation: GeocodeResult | null;
  secondaryLocation?: GeocodeResult | null;
  primaryWeather: WeatherData | null;
  secondaryWeather?: WeatherData | null;
  primaryAirQuality: AirQualityData | null;
  secondaryAirQuality?: AirQualityData | null;
  primaryWorldBank?: WorldBankCountryData | null;
  secondaryWorldBank?: WorldBankCountryData | null;
  primaryHydrology?: HydrologyData | null;
  secondaryHydrology?: HydrologyData | null;
  primarySeismic?: SeismicData | null;
  secondarySeismic?: SeismicData | null;
  primaryDomains: DomainIntelligence[];
  secondaryDomains?: DomainIntelligence[];
  evidenceItems: EvidenceItem[];
  unavailableDomains: { id: string; title: string; reason: string }[];
  retrievedAt: string;
}

/**
 * Builds grounded evidence context for a single location and its telemetry
 */
export function buildLocationEvidenceContext(
  location: GeocodeResult | null,
  weather: WeatherData | null,
  airQuality: AirQualityData | null,
  worldBank?: WorldBankCountryData | null,
  hydrology?: HydrologyData | null,
  seismic?: SeismicData | null
): GroundedEvidenceContext {
  const domains = buildDomainIntelligence(location, weather, airQuality, worldBank, hydrology, seismic);
  const evidenceItems: EvidenceItem[] = [];
  const unavailableDomains: { id: string; title: string; reason: string }[] = [];
  const locName = location?.name || 'Selected Location';

  for (const domain of domains) {
    if (domain.status === 'unavailable') {
      unavailableDomains.push({
        id: domain.domainId,
        title: domain.domainTitle,
        reason: domain.limitations,
      });
    }

    for (const metric of domain.metrics) {
      if (metric.value !== null && metric.value !== undefined) {
        evidenceItems.push({
          id: `${domain.domainId}-${metric.id}`,
          domain: domain.domainTitle,
          metric: metric.name,
          value: metric.value,
          unit: metric.unit,
          location: locName,
          source: metric.source,
          dataClassification: metric.classification,
          timestamp: metric.observationTime || metric.retrievedAt,
          limitations: metric.qualityNotes,
          geographicScope: metric.geographicScope,
        });
      }
    }
  }

  return {
    primaryLocation: location,
    primaryWeather: weather,
    primaryAirQuality: airQuality,
    primaryWorldBank: worldBank,
    primaryHydrology: hydrology,
    primarySeismic: seismic,
    primaryDomains: domains,
    evidenceItems,
    unavailableDomains,
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Fetches telemetry and builds grounded evidence context for two locations being compared
 */
export async function buildComparisonEvidence(
  locA: GeocodeResult,
  locB: GeocodeResult,
  signal?: AbortSignal
): Promise<GroundedEvidenceContext> {
  const [
    wResA,
    aqResA,
    wbResA,
    hydroResA,
    seismicResA,
    wResB,
    aqResB,
    wbResB,
    hydroResB,
    seismicResB,
  ] = await Promise.all([
    fetchWeatherData(locA.lat, locA.lng, signal),
    fetchAirQualityData(locA.lat, locA.lng, signal),
    fetchWorldBankData(locA.countryCode, locA.country, signal),
    fetchHydrologyData(locA.lat, locA.lng, signal),
    fetchSeismicData(locA.lat, locA.lng, signal),
    fetchWeatherData(locB.lat, locB.lng, signal),
    fetchAirQualityData(locB.lat, locB.lng, signal),
    fetchWorldBankData(locB.countryCode, locB.country, signal),
    fetchHydrologyData(locB.lat, locB.lng, signal),
    fetchSeismicData(locB.lat, locB.lng, signal),
  ]);

  const weatherA = wResA.data || null;
  const weatherB = wResB.data || null;
  const aqA = aqResA.data || null;
  const aqB = aqResB.data || null;
  const wbA = wbResA.data || null;
  const wbB = wbResB.data || null;
  const hydroA = hydroResA.data || null;
  const hydroB = hydroResB.data || null;
  const seismicA = seismicResA.data || null;
  const seismicB = seismicResB.data || null;

  const domainsA = buildDomainIntelligence(locA, weatherA, aqA, wbA, hydroA, seismicA);
  const domainsB = buildDomainIntelligence(locB, weatherB, aqB, wbB, hydroB, seismicB);

  const evidenceItems: EvidenceItem[] = [];
  const unavailableDomains: { id: string; title: string; reason: string }[] = [];

  for (const domain of domainsA) {
    if (domain.status === 'unavailable') {
      unavailableDomains.push({
        id: domain.domainId,
        title: domain.domainTitle,
        reason: domain.limitations,
      });
    }

    for (const metric of domain.metrics) {
      if (metric.value !== null && metric.value !== undefined) {
        evidenceItems.push({
          id: `${locA.name}-${metric.id}`,
          domain: domain.domainTitle,
          metric: metric.name,
          value: metric.value,
          unit: metric.unit,
          location: locA.name,
          source: metric.source,
          dataClassification: metric.classification,
          timestamp: metric.observationTime || metric.retrievedAt,
          limitations: metric.qualityNotes,
          geographicScope: metric.geographicScope,
        });
      }
    }
  }

  for (const domain of domainsB) {
    for (const metric of domain.metrics) {
      if (metric.value !== null && metric.value !== undefined) {
        evidenceItems.push({
          id: `${locB.name}-${metric.id}`,
          domain: domain.domainTitle,
          metric: metric.name,
          value: metric.value,
          unit: metric.unit,
          location: locB.name,
          source: metric.source,
          dataClassification: metric.classification,
          timestamp: metric.observationTime || metric.retrievedAt,
          limitations: metric.qualityNotes,
          geographicScope: metric.geographicScope,
        });
      }
    }
  }

  return {
    primaryLocation: locA,
    secondaryLocation: locB,
    primaryWeather: weatherA,
    secondaryWeather: weatherB,
    primaryAirQuality: aqA,
    secondaryAirQuality: aqB,
    primaryWorldBank: wbA,
    secondaryWorldBank: wbB,
    primaryHydrology: hydroA,
    secondaryHydrology: hydroB,
    primarySeismic: seismicA,
    secondarySeismic: seismicB,
    primaryDomains: domainsA,
    secondaryDomains: domainsB,
    evidenceItems,
    unavailableDomains,
    retrievedAt: new Date().toISOString(),
  };
}

export interface LocationResolutionResult {
  location: GeocodeResult | null;
  candidates?: GeocodeResult[];
  isAmbiguous?: boolean;
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  worldBank: WorldBankCountryData | null;
  hydrology: HydrologyData | null;
  seismic: SeismicData | null;
  error?: string | null;
}

/**
 * Resolves an external location query if user specifically asks about another city
 */
export async function resolveLocationForQuery(
  query: string,
  signal?: AbortSignal
): Promise<LocationResolutionResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      location: null,
      weather: null,
      airQuality: null,
      worldBank: null,
      hydrology: null,
      seismic: null,
      error: 'Empty location search query.',
    };
  }

  const { data, error } = await searchLocations(trimmed, signal);
  if (error || !data || data.length === 0) {
    return {
      location: null,
      weather: null,
      airQuality: null,
      worldBank: null,
      hydrology: null,
      seismic: null,
      error: error || `No geographical coordinates found matching "${trimmed}".`,
    };
  }

  // Detect genuine multi-city ambiguity (e.g., bare "Springfield" without state/country)
  const isBareSingleName = !trimmed.includes(',') && !/\b(?:in|of|near)\b/i.test(trimmed);
  if (isBareSingleName && data.length > 1) {
    const c1 = data[0];
    const c2 = data[1];
    const differentCountry = c1.country && c2.country && c1.country.toLowerCase() !== c2.country.toLowerCase();
    const differentState = c1.state && c2.state && c1.state.toLowerCase() !== c2.state.toLowerCase();
    const distLat = Math.abs(c1.lat - c2.lat);
    const distLng = Math.abs(c1.lng - c2.lng);

    if (differentCountry || (differentState && (distLat > 1.0 || distLng > 1.0))) {
      return {
        location: null,
        candidates: data.slice(0, 4),
        isAmbiguous: true,
        weather: null,
        airQuality: null,
        worldBank: null,
        hydrology: null,
        seismic: null,
        error: `Multiple distinct geographical locations match "${trimmed}".`,
      };
    }
  }

  const location = data[0];
  const [wRes, aqRes, wbRes, hydroRes, seismicRes] = await Promise.all([
    fetchWeatherData(location.lat, location.lng, signal).catch(() => ({ data: null, error: 'Weather unavailable' })),
    fetchAirQualityData(location.lat, location.lng, signal).catch(() => ({ data: null, error: 'Air quality unavailable' })),
    fetchWorldBankData(location.countryCode, location.country, signal).catch(() => ({ data: null, error: 'World Bank unavailable' })),
    fetchHydrologyData(location.lat, location.lng, signal).catch(() => ({ data: null, error: 'Hydrology unavailable' })),
    fetchSeismicData(location.lat, location.lng, signal).catch(() => ({ data: null, error: 'Seismic unavailable' })),
  ]);

  return {
    location,
    candidates: data,
    weather: wRes.data || null,
    airQuality: aqRes.data || null,
    worldBank: wbRes.data || null,
    hydrology: hydroRes.data || null,
    seismic: seismicRes.data || null,
  };
}
