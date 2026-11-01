import { WorldBankCountryData, WorldBankIndicatorValue } from '../types';

// In-memory cache with 1-hour TTL
const worldBankCache = new Map<string, { data: WorldBankCountryData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Common ISO-2 mappings for geocoded countries
const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  india: 'IN',
  japan: 'JP',
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  germany: 'DE',
  france: 'FR',
  china: 'CN',
  canada: 'CA',
  australia: 'AU',
  brazil: 'BR',
  spain: 'ES',
  italy: 'IT',
  mexico: 'MX',
  indonesia: 'ID',
  pakistan: 'PK',
  nigeria: 'NG',
  'south africa': 'ZA',
  egypt: 'EG',
  turkey: 'TR',
  kenya: 'KE',
  argentina: 'AR',
  chile: 'CL',
  colombia: 'CO',
  singapore: 'SG',
  malaysia: 'MY',
  thailand: 'TH',
  vietnam: 'VN',
  'south korea': 'KR',
  korea: 'KR',
};

interface WBResponseRecord {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  date: string;
  value: number | null;
}

/**
 * Resolves ISO 3166-1 alpha-2 or alpha-3 country code
 */
export function resolveCountryCode(code?: string, countryName?: string): string | null {
  if (code && /^[a-zA-Z]{2,3}$/.test(code.trim())) {
    return code.trim().toUpperCase();
  }
  if (countryName) {
    const norm = countryName.toLowerCase().trim();
    if (COUNTRY_NAME_TO_ISO2[norm]) {
      return COUNTRY_NAME_TO_ISO2[norm];
    }
  }
  return null;
}

/**
 * Fetches a single World Bank indicator for a country
 */
async function fetchIndicator(
  countryCode: string,
  indicatorId: string,
  signal?: AbortSignal
): Promise<WorldBankIndicatorValue | undefined> {
  const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorId}?format=json&mrv=10&gapfill=Y`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) return undefined;

    const json = await res.json();
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
      return undefined;
    }

    const records: WBResponseRecord[] = json[1];
    // Find the newest non-null record
    const latest = records.find((r) => r.value !== null && r.value !== undefined);
    if (!latest || latest.value === null) return undefined;

    return {
      value: latest.value,
      year: latest.date,
      indicatorId,
      indicatorName: latest.indicator?.value || indicatorId,
    };
  } catch {
    return undefined;
  }
}

/**
 * Fetches national economic, health, and infrastructure indicators from the World Bank Open Data API
 */
export async function fetchWorldBankData(
  countryCodeOrName?: string,
  explicitCountryName?: string,
  signal?: AbortSignal
): Promise<{ data: WorldBankCountryData | null; error: string | null }> {
  const code = resolveCountryCode(countryCodeOrName, explicitCountryName);
  if (!code) {
    return { data: null, error: 'Valid national country code could not be resolved.' };
  }

  // Check cache
  const cached = worldBankCache.get(code);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { data: cached.data, error: null };
  }

  try {
    // Concurrently fetch the authoritative World Bank indicators
    const [
      gdpPerCapita,
      inflationRate,
      totalPopulation,
      urbanPopulationPercent,
      hospitalBeds,
      lifeExpectancy,
      electricityAccess,
      internetUsersPercent,
      physiciansPer1000,
      healthExpenditurePctGdp,
      renewableEnergyShare,
      laborForceParticipation,
      logisticsPerformanceIndex,
      fixedBroadband,
    ] = await Promise.all([
      fetchIndicator(code, 'NY.GDP.PCAP.CD', signal), // GDP per capita (current US$)
      fetchIndicator(code, 'FP.CPI.TOTL.ZG', signal), // Inflation, consumer prices (annual %)
      fetchIndicator(code, 'SP.POP.TOTL', signal), // Population, total
      fetchIndicator(code, 'SP.URB.TOTL.IN.ZS', signal), // Urban population (% of total)
      fetchIndicator(code, 'SH.MED.BEDS.ZS', signal), // Hospital beds (per 1,000 people)
      fetchIndicator(code, 'SP.DYN.LE00.IN', signal), // Life expectancy at birth (years)
      fetchIndicator(code, 'EG.ELC.ACCS.ZS', signal), // Access to electricity (% of population)
      fetchIndicator(code, 'IT.NET.USER.ZS', signal), // Individuals using the Internet (%)
      fetchIndicator(code, 'SH.MED.PHYS.ZS', signal), // Physicians (per 1,000 people)
      fetchIndicator(code, 'SH.XPD.CHEX.GD.ZS', signal), // Current health expenditure (% of GDP)
      fetchIndicator(code, 'EG.FEC.RNEW.ZS', signal), // Renewable energy consumption (% of total)
      fetchIndicator(code, 'SL.TLF.CACT.ZS', signal), // Labor force participation rate (%)
      fetchIndicator(code, 'LP.LPI.OVRL.XQ', signal), // Logistics performance index (1-5)
      fetchIndicator(code, 'IT.NET.BBND.P2', signal), // Fixed broadband subscriptions (per 100 people)
    ]);

    const result: WorldBankCountryData = {
      countryCode: code,
      countryName: explicitCountryName || code,
      gdpPerCapita,
      inflationRate,
      totalPopulation,
      urbanPopulationPercent,
      hospitalBeds,
      lifeExpectancy,
      electricityAccess,
      internetUsersPercent,
      physiciansPer1000,
      healthExpenditurePctGdp,
      renewableEnergyShare,
      laborForceParticipation,
      logisticsPerformanceIndex,
      fixedBroadband,
      retrievedAt: new Date().toISOString(),
      source: 'World Bank Open Data API / World Development Indicators',
    };

    worldBankCache.set(code, { data: result, timestamp: Date.now() });
    return { data: result, error: null };
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      return { data: null, error: null };
    }
    return { data: null, error: 'Failed to retrieve World Bank indicators.' };
  }
}
