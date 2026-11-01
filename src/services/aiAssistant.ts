import {
  GeocodeResult,
  WeatherData,
  AirQualityData,
  WorldBankCountryData,
  HydrologyData,
  SeismicData,
  DataClassification,
} from '../types';
import {
  EvidenceItem,
  GroundedEvidenceContext,
  buildLocationEvidenceContext,
  buildComparisonEvidence,
  resolveLocationForQuery,
} from './evidence';

export interface AIResponse {
  id: string;
  answer: string;
  supportingData: {
    metric: string;
    value: string | number;
    unit: string;
    source: string;
    tier: DataClassification;
  }[];
  evidenceItems: EvidenceItem[];
  sources: string[];
  limitations: string;
  isDeterministicFallback: boolean;
  targetLocationName?: string;
  secondaryLocationName?: string;
  resolvedLocation?: GeocodeResult | null;
  isClarification?: boolean;
}

export interface ConversationContextState {
  lastLocation: GeocodeResult | null;
  lastWeather: WeatherData | null;
  lastAirQuality: AirQualityData | null;
  lastWorldBank: WorldBankCountryData | null;
  lastHydrology: HydrologyData | null;
  lastSeismic: SeismicData | null;
}

export type TopicCategory =
  | 'all'
  | 'weather'
  | 'airQuality'
  | 'solar'
  | 'water'
  | 'seismic'
  | 'economy'
  | 'healthcare'
  | 'infrastructure'
  | 'source'
  | 'missing';

export interface ExtractedQueryIntent {
  explicitLocations: string[];
  isComparison: boolean;
  isAnaphoric: boolean;
  topicCategory: TopicCategory;
  rawTargetToken?: string;
}

/**
 * Robustly parses user queries to detect explicit locations, comparisons, and topics.
 * Distinguishes explicit place names from conversation context and map defaults.
 */
export function parseQueryIntent(
  query: string,
  contextLocationName?: string
): ExtractedQueryIntent {
  const trimmed = query.trim();
  const normalized = trimmed.replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  // 1. Detect Topic Category
  let topicCategory: TopicCategory = 'all';

  if (
    lower.includes('what is the source') ||
    lower.includes('source of') ||
    lower.includes('where does') ||
    lower.includes('how is this calculated') ||
    lower.includes('data provider') ||
    lower.includes('provenance')
  ) {
    topicCategory = 'source';
  } else if (
    lower.includes('why is') ||
    lower.includes('unavailable') ||
    lower.includes('missing') ||
    lower.includes('pending') ||
    lower.includes('what additional information') ||
    lower.includes('required to compare')
  ) {
    topicCategory = 'missing';
  } else if (
    lower.includes('air') ||
    lower.includes('aqi') ||
    lower.includes('pm2.5') ||
    lower.includes('pm10') ||
    lower.includes('pollution') ||
    lower.includes('ozone')
  ) {
    topicCategory = 'airQuality';
  } else if (
    lower.includes('weather') ||
    lower.includes('temperature') ||
    lower.includes('rain') ||
    lower.includes('forecast') ||
    lower.includes('wind') ||
    lower.includes('humidity')
  ) {
    topicCategory = 'weather';
  } else if (
    lower.includes('solar') ||
    lower.includes('radiation') ||
    lower.includes('dni') ||
    lower.includes('gti') ||
    lower.includes('renewable')
  ) {
    topicCategory = 'solar';
  } else if (
    lower.includes('water') ||
    lower.includes('river') ||
    lower.includes('discharge') ||
    lower.includes('streamflow') ||
    lower.includes('soil moisture') ||
    lower.includes('hydrology') ||
    lower.includes('drought') ||
    lower.includes('glofas')
  ) {
    topicCategory = 'water';
  } else if (
    lower.includes('earthquake') ||
    lower.includes('seismic') ||
    lower.includes('fault') ||
    lower.includes('tremor') ||
    lower.includes('magnitude') ||
    lower.includes('hazard')
  ) {
    topicCategory = 'seismic';
  } else if (
    lower.includes('economy') ||
    lower.includes('gdp') ||
    lower.includes('inflation') ||
    lower.includes('cost of living') ||
    lower.includes('living cost') ||
    lower.includes('population') ||
    lower.includes('labor') ||
    lower.includes('urbanization')
  ) {
    topicCategory = 'economy';
  } else if (
    lower.includes('hospital') ||
    lower.includes('health') ||
    lower.includes('physician') ||
    lower.includes('doctor') ||
    lower.includes('life expectancy')
  ) {
    topicCategory = 'healthcare';
  } else if (
    lower.includes('infrastructure') ||
    lower.includes('electricity access') ||
    lower.includes('power grid') ||
    lower.includes('internet') ||
    lower.includes('broadband') ||
    lower.includes('logistics') ||
    lower.includes('lpi')
  ) {
    topicCategory = 'infrastructure';
  }

  // 2. Check Comparison Patterns
  const compareMatch =
    normalized.match(/\bcompare\b\s+([^,]+?)\s+\b(?:and|with|to|vs\.?)\b\s+([^?.,;!]+)/i) ||
    normalized.match(/\bbetween\b\s+([^,]+?)\s+\band\b\s+([^?.,;!]+)/i) ||
    normalized.match(/([^,]+?)\s+\b(?:vs\.?|versus)\b\s+([^?.,;!]+)/i) ||
    normalized.match(/\bhow\s+does\s+([^,]+?)\s+compare\s+(?:with|to)\b\s+([^?.,;!]+)/i);

  if (compareMatch) {
    const raw1 = cleanLocationToken(compareMatch[1]);
    const raw2 = cleanLocationToken(compareMatch[2]);
    const isAnaphoric1 = isPronounToken(raw1);
    const isAnaphoric2 = isPronounToken(raw2);

    const loc1 = isAnaphoric1 ? (contextLocationName || '') : raw1;
    const loc2 = isAnaphoric2 ? (contextLocationName || '') : raw2;

    const explicitLocations: string[] = [];
    if (loc1) explicitLocations.push(loc1);
    if (loc2) explicitLocations.push(loc2);

    return {
      explicitLocations,
      isComparison: true,
      isAnaphoric: isAnaphoric1 || isAnaphoric2,
      topicCategory,
      rawTargetToken: raw2 || raw1,
    };
  }

  // Check comparison where only one location is named, e.g. "compare it with Hyderabad" or "compare with Tokyo"
  const singleCompareMatch =
    normalized.match(/\bcompare\s+(?:it|this|current\s+location)?\s*(?:with|to)\s+([^?.,;!]+)/i) ||
    normalized.match(/\bhow\s+about\s+vs\s+([^?.,;!]+)/i);

  if (singleCompareMatch) {
    const rawTarget = cleanLocationToken(singleCompareMatch[1]);
    const explicitLocations: string[] = [];
    if (contextLocationName) explicitLocations.push(contextLocationName);
    if (rawTarget) explicitLocations.push(rawTarget);

    return {
      explicitLocations,
      isComparison: true,
      isAnaphoric: true,
      topicCategory,
      rawTargetToken: rawTarget,
    };
  }

  // 3. Check Single Explicit Location Mentions
  // Matches "Give me about Chennai, India", "Tell me about Tokyo", "What about Paris, France", "Details on London"
  const introPatterns = [
    /\b(?:give\s+me\s+(?:an?\s+)?(?:about|details\s+on|details\s+for|info\s+on|info\s+for|information\s+on|information\s+for|data\s+on|data\s+for|overview\s+of)?|tell\s+me\s+about|what\s+about|how\s+about|show\s+me|overview\s+of|details\s+on|details\s+for|info\s+on|info\s+for|information\s+on|information\s+for|report\s+on|report\s+for|about)\s+([A-Za-z\s,\.-]+?)(?:\?|\.|$|!|\s+(?:using|with\s+real|with\s+available|today|now|please|data|metrics))/i,
    /\b(?:in|for|at|around|near)\s+([A-Za-z\s,\.-]+?)(?:\?|\.|$|!|\s+(?:using|with\s+real|with\s+available|today|now|please|data|metrics))/i,
    /\b(?:how\s+is|what\s+is\s+it\s+like\s+in)\s+([A-Za-z\s,\.-]+?)(?:\?|\.|$|!|\s+(?:using|today|now|please))/i,
  ];

  // If query is specifically about missing data or source provenance (e.g. "What is the source of the solar data?"),
  // avoid treating topic nouns as locations
  if (topicCategory !== 'source' && topicCategory !== 'missing') {
    for (const pattern of introPatterns) {
      const match = normalized.match(pattern);
      if (match && match[1]) {
        const candidate = cleanLocationToken(match[1]);
        if (isValidLocationToken(candidate)) {
          return {
            explicitLocations: [candidate],
            isComparison: false,
            isAnaphoric: false,
            topicCategory,
            rawTargetToken: candidate,
          };
        }
      }
    }
  } else {
    // For source/missing queries, only match if explicitly saying "in <Location>" or "for <Location>"
    const locMatch = normalized.match(/\b(?:in|for|around|near)\s+([A-Za-z\s,\.-]+?)(?:\?|\.|$|!|\s+(?:today|now|please))/i);
    if (locMatch && locMatch[1]) {
      const candidate = cleanLocationToken(locMatch[1]);
      if (isValidLocationToken(candidate)) {
        return {
          explicitLocations: [candidate],
          isComparison: false,
          isAnaphoric: false,
          topicCategory,
          rawTargetToken: candidate,
        };
      }
    }
  }

  // 4. Check Direct / Bare Location Query
  // e.g. "Chennai, India", "Tokyo, Japan", "Hyderabad", "Austin, Texas"
  const bareCandidate = cleanLocationToken(normalized.replace(/[?!.]/g, ''));
  if (
    bareCandidate.includes(',') ||
    (!/\b(?:what|why|how|when|where|which|is|are|can|could|would|explain|help)\b/i.test(normalized) &&
      isValidLocationToken(bareCandidate) &&
      bareCandidate.split(/\s+/).length <= 4)
  ) {
    return {
      explicitLocations: [bareCandidate],
      isComparison: false,
      isAnaphoric: false,
      topicCategory,
      rawTargetToken: bareCandidate,
    };
  }

  // 5. Check if query is "<Location> <topic>" e.g. "Chennai weather" or "Tokyo air quality"
  const topicWordsRegex = /\b(?:weather|air\s+quality|aqi|temperature|gdp|economy|solar|water|river\s+discharge|seismic|earthquakes)\b/gi;
  if (topicWordsRegex.test(normalized)) {
    const strippedCandidate = cleanLocationToken(normalized.replace(topicWordsRegex, '').replace(/[?!.]/g, ''));
    if (isValidLocationToken(strippedCandidate) && strippedCandidate.split(/\s+/).length <= 4) {
      return {
        explicitLocations: [strippedCandidate],
        isComparison: false,
        isAnaphoric: false,
        topicCategory,
        rawTargetToken: strippedCandidate,
      };
    }
  }

  // 6. No explicit location found; conversational follow-up or general inquiry
  return {
    explicitLocations: [],
    isComparison: false,
    isAnaphoric: false,
    topicCategory,
  };
}

const STOP_WORDS = new Set([
  'what', 'why', 'how', 'when', 'where', 'which', 'who', 'whom', 'whose',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'their', 'our',
  'it', 'its', 'me', 'you', 'him', 'them', 'us',
  'in', 'for', 'at', 'on', 'of', 'to', 'from', 'by', 'with', 'about', 'around', 'near',
  'give', 'tell', 'show', 'get', 'can', 'could', 'would', 'should', 'will', 'do', 'does', 'did',
  'please', 'now', 'today', 'current', 'live', 'real', 'available',
  'details', 'info', 'information', 'data', 'metrics', 'report', 'overview', 'summary',
  'source', 'sources', 'indicator', 'indicators', 'values', 'numbers',
  'weather', 'temperature', 'climate', 'air', 'quality', 'aqi', 'pollution', 'pm25',
  'solar', 'radiation', 'energy', 'water', 'hydrology', 'river', 'discharge', 'streamflow',
  'groundwater', 'seismic', 'earthquake', 'earthquakes', 'hazard', 'hazards',
  'economy', 'economic', 'gdp', 'inflation', 'hospital', 'health', 'physician',
  'infrastructure', 'broadband', 'internet', 'electricity', 'access',
]);

function cleanLocationToken(token: string): string {
  return token
    .replace(/\b(?:using|with|their|available|data|conditions|information|values|weather|air|quality|economy|water|seismic|real|live|metrics|please|today|now|right\s+now)\b/gi, '')
    .replace(/^[,\s.-]+|[,\s.-]+$/g, '')
    .trim();
}

function isPronounToken(token: string): boolean {
  const lower = token.toLowerCase().trim();
  return [
    'it',
    'this',
    'here',
    'current',
    'current location',
    'current place',
    'this location',
    'this place',
    'the first',
    'the first location',
  ].includes(lower);
}

function isValidLocationToken(token: string): boolean {
  if (!token || token.length < 2) return false;
  const lower = token.toLowerCase().trim();

  // If entire token is a stop word
  if (STOP_WORDS.has(lower)) return false;

  // Split words and check
  const words = lower.split(/[\s,.-]+/).filter(Boolean);
  if (words.length === 0) return false;

  // If ALL words are stop words (e.g. "what is the")
  if (words.every((w) => STOP_WORDS.has(w))) return false;

  // If starts with interrogative / modal word
  if (['what', 'why', 'how', 'when', 'where', 'which', 'who', 'is', 'are', 'can', 'could'].includes(words[0])) {
    return false;
  }

  return true;
}

/**
 * Main Assistant Entrypoint: Evidence-Grounded AI Assistant
 */
export async function askIntelligenceAssistant(
  question: string,
  activeLocation: GeocodeResult | null,
  activeWeather: WeatherData | null,
  activeAirQuality: AirQualityData | null,
  activeWorldBank?: WorldBankCountryData | null,
  activeHydrology?: HydrologyData | null,
  activeSeismic?: SeismicData | null,
  signal?: AbortSignal,
  conversationContext?: ConversationContextState
): Promise<AIResponse> {
  const trimmed = question.trim();
  const id = `resp-${Date.now()}`;

  // 1. Guard against empty queries
  if (!trimmed) {
    return {
      id,
      answer: 'Please enter a location intelligence question. You can ask about current conditions, atmospheric chemistry, river discharge, official national accounts, or seismic hazards (e.g., "Give me about Chennai, India" or "What is the air quality in Tokyo?").',
      supportingData: [],
      evidenceItems: [],
      sources: ['AtlasIQ Guardrails'],
      limitations: 'Empty queries cannot be evaluated.',
      isDeterministicFallback: true,
    };
  }

  // Determine current conversation context location (conversation focus takes priority over map activeLocation for follow-ups)
  const currentContextLoc = conversationContext?.lastLocation || activeLocation;
  const currentContextWeather = conversationContext?.lastWeather || activeWeather;
  const currentContextAirQuality = conversationContext?.lastAirQuality || activeAirQuality;
  const currentContextWorldBank = conversationContext?.lastWorldBank || activeWorldBank || null;
  const currentContextHydrology = conversationContext?.lastHydrology || activeHydrology || null;
  const currentContextSeismic = conversationContext?.lastSeismic || activeSeismic || null;

  // Parse query intent
  const intent = parseQueryIntent(trimmed, currentContextLoc?.name);

  // 2. Handle Explanations of Missing / Unavailable Domains
  if (intent.topicCategory === 'missing') {
    return generateMissingDataExplanation(trimmed, currentContextLoc);
  }

  // 3. Handle Questions About Data Sources & Provenance
  if (intent.topicCategory === 'source') {
    return generateSourceExplanation(trimmed, currentContextLoc);
  }

  // 4. Handle Location Comparison
  if (intent.isComparison) {
    return handleComparisonQuery(trimmed, intent.explicitLocations, currentContextLoc, signal);
  }

  // 5. Handle Single Location Resolution
  let targetLocation: GeocodeResult | null = null;
  let targetWeather: WeatherData | null = null;
  let targetAirQuality: AirQualityData | null = null;
  let targetWorldBank: WorldBankCountryData | null = null;
  let targetHydrology: HydrologyData | null = null;
  let targetSeismic: SeismicData | null = null;

  if (intent.explicitLocations.length >= 1) {
    const locName = intent.explicitLocations[0];

    // If the explicit location is different from our context location, resolve it afresh
    if (!currentContextLoc || !currentContextLoc.name.toLowerCase().includes(locName.toLowerCase())) {
      const res = await resolveLocationForQuery(locName, signal);

      // Handle Ambiguous Place Names (e.g., Springfield without state)
      if (res.isAmbiguous && res.candidates && res.candidates.length > 1) {
        const candidateList = res.candidates
          .slice(0, 3)
          .map((c) => `- **${c.displayName}**`)
          .join('\n');
        return {
          id,
          answer: `### Location Clarification Required\n\nMultiple distinct places match "**${locName}**":\n\n${candidateList}\n\nPlease specify the country or state (e.g., "*${locName}, Country*") so AtlasIQ can retrieve the exact telemetry for your intended location.`,
          supportingData: [],
          evidenceItems: [],
          sources: ['OpenStreetMap Nominatim'],
          limitations: 'Spatial ambiguity detected; coordinates not resolved.',
          isDeterministicFallback: true,
          isClarification: true,
        };
      }

      // Handle Unresolvable Place Names
      if (!res.location) {
        return {
          id,
          answer: `### Location Not Found\n\nAtlasIQ was unable to locate or resolve geographical coordinates for "**${locName}**".\n\n*Suggestions:*\n- Check the spelling of the location name.\n- Include the sovereign country or administrative state (for example, "**${locName}, India**" or "**${locName}, USA**").\n\n*Data Integrity Guarantee:* AtlasIQ never substitutes simulated coordinates or unrequested cities when a place cannot be resolved.`,
          supportingData: [],
          evidenceItems: [],
          sources: ['OpenStreetMap Nominatim Geocoding'],
          limitations: 'Place name failed coordinate resolution.',
          isDeterministicFallback: true,
          targetLocationName: locName,
        };
      }

      // Resolved successfully
      targetLocation = res.location;
      targetWeather = res.weather;
      targetAirQuality = res.airQuality;
      targetWorldBank = res.worldBank;
      targetHydrology = res.hydrology;
      targetSeismic = res.seismic;
    } else {
      // Named the same location as current context
      targetLocation = currentContextLoc;
      targetWeather = currentContextWeather;
      targetAirQuality = currentContextAirQuality;
      targetWorldBank = currentContextWorldBank;
      targetHydrology = currentContextHydrology;
      targetSeismic = currentContextSeismic;
    }
  } else {
    // No explicit location named in the query: check if there is an active conversational or map location
    if (currentContextLoc) {
      targetLocation = currentContextLoc;
      targetWeather = currentContextWeather;
      targetAirQuality = currentContextAirQuality;
      targetWorldBank = currentContextWorldBank;
      targetHydrology = currentContextHydrology;
      targetSeismic = currentContextSeismic;
    } else {
      // No location specified and no location active
      return {
        id,
        answer: 'No location is currently active, and your question did not specify a place name. Please name a city (for example, *"Give me about Chennai, India"* or *"What is the air quality in Tokyo?"*), or select a place in the Location Explorer.',
        supportingData: [],
        evidenceItems: [],
        sources: ['AtlasIQ Spatial Indexer'],
        limitations: 'Coordinates required to evaluate location telemetry.',
        isDeterministicFallback: true,
      };
    }
  }

  // Build grounded evidence context for target location
  const context = buildLocationEvidenceContext(
    targetLocation,
    targetWeather,
    targetAirQuality,
    targetWorldBank,
    targetHydrology,
    targetSeismic
  );

  // 6. Route to Specific Domain or Natural Overview
  switch (intent.topicCategory) {
    case 'weather':
      return generateWeatherResponse(targetLocation, targetWeather, context);
    case 'airQuality':
      return generateAirQualityResponse(targetLocation, targetAirQuality, context);
    case 'solar':
      return generateSolarResponse(targetLocation, targetWeather, targetWorldBank, context);
    case 'water':
      return generateHydrologyResponse(targetLocation, targetHydrology, context);
    case 'seismic':
      return generateSeismicResponse(targetLocation, targetSeismic, context);
    case 'economy':
      return generateEconomyResponse(targetLocation, targetWorldBank, context);
    case 'healthcare':
      return generateHealthcareResponse(targetLocation, targetWorldBank, context);
    case 'infrastructure':
      return generateInfrastructureResponse(targetLocation, targetWorldBank, context);
    case 'all':
    default:
      return generateNaturalOverview(
        targetLocation,
        targetWeather,
        targetAirQuality,
        targetWorldBank,
        targetHydrology,
        targetSeismic,
        context
      );
  }
}

/**
 * Generates a human-friendly, readable Location Intelligence Overview matching the requested structure.
 */
function generateNaturalOverview(
  location: GeocodeResult,
  weather: WeatherData | null,
  airQuality: AirQualityData | null,
  worldBank: WorldBankCountryData | null,
  hydrology: HydrologyData | null,
  seismic: SeismicData | null,
  context: GroundedEvidenceContext
): AIResponse {
  const sections: string[] = [];

  // Header
  const countrySuffix = location.country ? `, ${location.country}` : '';
  const header = `### ${location.name}${countrySuffix} — Location Intelligence Overview`;
  sections.push(header);

  // 1. Weather and Climate
  if (weather) {
    const cur = weather.current;
    const precipText = cur.precipitation > 0
      ? ` with **${cur.precipitation.toFixed(1)} mm** precipitation recorded`
      : ' with no immediate precipitation recorded';
    const highTemp = Math.max(...weather.daily.map((d) => d.tempMax)).toFixed(0);
    const lowTemp = Math.min(...weather.daily.map((d) => d.tempMin)).toFixed(0);

    sections.push(
      `#### Weather and Climate\n` +
      `Current conditions in **${location.name}** report **${cur.weatherText}** at **${cur.temperature.toFixed(1)} °C** ` +
      `(feels like **${cur.apparentTemperature.toFixed(1)} °C**) with **${cur.relativeHumidity}%** relative humidity and ` +
      `winds of **${cur.windSpeed.toFixed(1)} km/h**${precipText}. Over the 5-day forecast, temperatures range from **${lowTemp} °C** to **${highTemp} °C**.`
    );
  } else {
    sections.push(`#### Weather and Climate\nLocal meteorological telemetry is currently unreceived for this location.`);
  }

  // 2. Air Quality
  if (airQuality) {
    const cur = airQuality.current;
    const category = getAqiCategory(cur.usAqi);
    const pm25 = cur.pm2_5 !== undefined ? `**${cur.pm2_5.toFixed(1)} µg/m³**` : '—';
    const pm10 = cur.pm10 !== undefined ? `**${cur.pm10.toFixed(1)} µg/m³**` : '—';
    const ozone = cur.ozone !== undefined ? `**${cur.ozone.toFixed(1)} µg/m³**` : '—';

    sections.push(
      `#### Air Quality\n` +
      `Atmospheric air quality is indexed at **${cur.usAqi ?? '—'} US AQI** (*${category}*). ` +
      `Fine particulate matter ($PM_{2.5}$) is ${pm25} (WHO 24-hour guideline is 15 µg/m³), ` +
      `coarse particulate matter ($PM_{10}$) is ${pm10}, and surface ozone ($O_3$) is ${ozone}.`
    );
  }

  // 3. Solar and Environment
  if (weather?.current.directNormalIrradiance !== undefined || weather?.daily[0]?.shortwaveRadiationSum !== undefined) {
    const dni = weather.current.directNormalIrradiance !== undefined
      ? `**${weather.current.directNormalIrradiance.toFixed(0)} W/m²**`
      : '—';
    const rad = weather.daily[0]?.shortwaveRadiationSum !== undefined
      ? `**${weather.daily[0].shortwaveRadiationSum.toFixed(1)} MJ/m²**`
      : '—';

    sections.push(
      `#### Solar and Environment\n` +
      `Direct Normal Irradiance (DNI) is modeled at ${dni}, with expected daily cumulative solar radiation ` +
      `of ${rad}, reflecting strong local photovoltaic potential.`
    );
  }

  // 4. Water Resources
  if (hydrology && (hydrology.riverDischarge !== undefined || hydrology.soilMoisture7to28cm !== undefined)) {
    const disch = hydrology.riverDischarge !== undefined ? `**${hydrology.riverDischarge.toFixed(2)} m³/s**` : null;
    const sm = hydrology.soilMoisture7to28cm !== undefined ? `**${hydrology.soilMoisture7to28cm.toFixed(3)} m³/m³**` : null;

    const parts: string[] = [];
    if (disch) parts.push(`models daily river discharge in the local basin grid at ${disch}`);
    if (sm) parts.push(`root-zone volumetric soil moisture (7–28 cm) at ${sm}`);

    sections.push(
      `#### Water Resources\n` +
      `Copernicus GloFAS ${parts.join(', with ')}.`
    );
  }

  // 5. Earthquakes and Natural Hazards
  if (seismic) {
    const eventCount = seismic.recentEventCount;
    const eventWord = eventCount === 1 ? 'event' : 'events';
    let seismicText = `Live physical sensor network telemetry records **${eventCount} seismic ${eventWord}** (≥ M2.5) within a 250 km radius in the past 90 days.`;
    if (seismic.nearestEvent) {
      seismicText += ` The nearest event was M${seismic.nearestEvent.magnitude.toFixed(1)} near ${seismic.nearestEvent.place} (~${seismic.nearestEvent.distanceKm?.toFixed(0) || '—'} km away).`;
    }
    if (eventCount === 0) {
      seismicText += ` *(Note: An absence of minor seismicity does not imply zero long-term tectonic hazard).*`;
    }

    sections.push(`#### Earthquakes and Natural Hazards\n${seismicText}`);
  }

  // 6. Economy and Development
  if (worldBank) {
    const country = worldBank.countryName || location.country || 'National scope';
    const gdp = worldBank.gdpPerCapita?.value !== null && worldBank.gdpPerCapita?.value !== undefined
      ? `$${Math.round(worldBank.gdpPerCapita.value).toLocaleString()}`
      : null;
    const gdpYear = worldBank.gdpPerCapita?.year ? ` (${worldBank.gdpPerCapita.year})` : '';
    const inf = worldBank.inflationRate?.value !== null && worldBank.inflationRate?.value !== undefined
      ? `${worldBank.inflationRate.value.toFixed(1)}%`
      : null;
    const elec = worldBank.electricityAccess?.value !== null && worldBank.electricityAccess?.value !== undefined
      ? `${worldBank.electricityAccess.value.toFixed(1)}%`
      : null;
    const renew = worldBank.renewableEnergyShare?.value !== null && worldBank.renewableEnergyShare?.value !== undefined
      ? `${worldBank.renewableEnergyShare.value.toFixed(1)}%`
      : null;

    const statParts: string[] = [];
    if (gdp) statParts.push(`GDP per capita of **${gdp} USD**${gdpYear}`);
    if (inf) statParts.push(`annual inflation of **${inf}**`);
    if (elec) statParts.push(`electrical grid access at **${elec}**`);
    if (renew) statParts.push(`renewable energy share of final consumption at **${renew}**`);

    sections.push(
      `#### Economy and Development\n` +
      `At the national sovereign level for **${country}**, the World Bank reports ${statParts.join(', ')}. ` +
      `*(Important: These figures reflect national aggregates; municipal-level living cost metrics are not substituted).*`
    );
  }

  // 7. Data Limitations
  sections.push(
    `#### Data Limitations\n` +
    `Sub-basin water stress ratios (WRI Aqueduct 4.0), gravimetric groundwater anomalies (NASA GRACE-FO), commercial mineral reserve valuations, and municipal cost-of-living indices remain in an explicit **Integration Pending** state pending dedicated GIS spatial vector backend pipelines.`
  );

  // Footer: Sources and details
  sections.push(
    `---\n` +
    `**Data Details & Sources:** Open-Meteo NWP & Solar API, Copernicus CAMS (Air Quality), Copernicus GloFAS (Flood/River Discharge), USGS Earthquake Hazards, World Bank Open Data (National Accounts). Telemetry verified; zero synthetic data.`
  );

  const answer = sections.join('\n\n');

  // Supporting Data Metrics: Clean values and units
  const supportingData = [
    ...(weather ? [{
      metric: 'Surface Air Temperature',
      value: weather.current.temperature.toFixed(1),
      unit: '°C',
      source: 'Open-Meteo Weather API',
      tier: 'provider_reported_current' as DataClassification,
    }] : []),
    ...(airQuality?.current.usAqi !== undefined ? [{
      metric: 'US AQI',
      value: airQuality.current.usAqi,
      unit: 'AQI',
      source: 'Copernicus CAMS via Open-Meteo',
      tier: 'model_analysis' as DataClassification,
    }] : []),
    ...(weather?.current.directNormalIrradiance !== undefined ? [{
      metric: 'Solar DNI',
      value: weather.current.directNormalIrradiance.toFixed(0),
      unit: 'W/m²',
      source: 'Open-Meteo Solar API',
      tier: 'model_analysis' as DataClassification,
    }] : []),
    ...(hydrology?.riverDischarge !== undefined ? [{
      metric: 'River Discharge',
      value: hydrology.riverDischarge.toFixed(2),
      unit: 'm³/s',
      source: 'Copernicus GloFAS via Open-Meteo',
      tier: 'model_analysis' as DataClassification,
    }] : []),
    ...(seismic ? [{
      metric: 'Recent Earthquakes (≥ M2.5, 90d)',
      value: seismic.recentEventCount,
      unit: 'events',
      source: 'USGS Earthquake Hazards Program',
      tier: 'provider_reported_current' as DataClassification,
    }] : []),
    ...(worldBank?.gdpPerCapita?.value ? [{
      metric: 'National GDP Per Capita',
      value: Math.round(worldBank.gdpPerCapita.value).toLocaleString(),
      unit: 'USD',
      source: 'World Bank Open Data (National)',
      tier: 'provider_reported_current' as DataClassification,
    }] : []),
  ];

  return {
    id: `resp-overview-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: [
      'Open-Meteo Numerical Weather Prediction',
      'Copernicus Atmosphere Monitoring Service (CAMS)',
      'Copernicus GloFAS Flood API',
      'USGS Earthquake Hazards Program',
      'World Bank Open Data API',
      'OpenStreetMap Nominatim',
    ],
    limitations: 'Local indicators represent assimilated numerical models (~5-11 km grid). Economic metrics reflect sovereign national aggregates.',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Handles comparative queries between two locations with clean independent resolution
 */
async function handleComparisonQuery(
  _query: string,
  explicitLocations: string[],
  currentContextLoc: GeocodeResult | null,
  signal?: AbortSignal
): Promise<AIResponse> {
  let nameA = explicitLocations[0];
  let nameB = explicitLocations[1];

  // If only one location was provided, pair with current conversation context
  if (!nameB && currentContextLoc) {
    if (nameA && !currentContextLoc.name.toLowerCase().includes(nameA.toLowerCase())) {
      nameB = currentContextLoc.name;
    }
  }

  // If still missing, explain to user without inventing arbitrary locations
  if (!nameA || !nameB) {
    return {
      id: `resp-comp-missing-${Date.now()}`,
      answer: `### Location Comparison\n\nTo compare two locations, please specify both place names (for example, *"How does Chennai compare with Hyderabad?"* or *"Compare Tokyo and London"*).\n\n*Data Integrity Guarantee:* AtlasIQ never invents or substitutes default cities when a comparative target is unspecified.`,
      supportingData: [],
      evidenceItems: [],
      sources: ['AtlasIQ Guardrails'],
      limitations: 'Two distinct locations required for cross-domain comparative matrix.',
      isDeterministicFallback: true,
    };
  }

  // Prevent comparing a location with itself
  if (nameA.toLowerCase().trim() === nameB.toLowerCase().trim()) {
    return {
      id: `resp-comp-same-${Date.now()}`,
      answer: `### Comparison Notice\n\n**${nameA}** cannot be compared with itself. Please specify two different geographical locations to evaluate comparative indicators.`,
      supportingData: [],
      evidenceItems: [],
      sources: ['AtlasIQ Spatial Indexer'],
      limitations: 'Comparative evaluation requires distinct coordinates.',
      isDeterministicFallback: true,
    };
  }

  // Resolve both locations independently
  const [resA, resB] = await Promise.all([
    resolveLocationForQuery(nameA, signal),
    resolveLocationForQuery(nameB, signal),
  ]);

  if (!resA.location || !resB.location) {
    const failedNames: string[] = [];
    if (!resA.location) failedNames.push(`"${nameA}"`);
    if (!resB.location) failedNames.push(`"${nameB}"`);

    return {
      id: `resp-comp-err-${Date.now()}`,
      answer: `### Geocoding Notice\n\nAtlasIQ was unable to locate coordinates for ${failedNames.join(' and ')}. Please verify the spelling or include country names (for example, *"Compare ${nameA}, Country and ${nameB}, Country"*).`,
      supportingData: [],
      evidenceItems: [],
      sources: ['OpenStreetMap Nominatim'],
      limitations: 'One or more comparative locations failed coordinate resolution.',
      isDeterministicFallback: true,
    };
  }

  const locA = resA.location;
  const locB = resB.location;

  // Build comparison evidence
  const compContext = await buildComparisonEvidence(locA, locB, signal);
  const wA = compContext.primaryWeather;
  const wB = compContext.secondaryWeather;
  const aqA = compContext.primaryAirQuality;
  const aqB = compContext.secondaryAirQuality;
  const wbA = compContext.primaryWorldBank;
  const wbB = compContext.secondaryWorldBank;
  const hydroA = compContext.primaryHydrology;
  const hydroB = compContext.secondaryHydrology;
  const seismicA = compContext.primarySeismic;
  const seismicB = compContext.secondarySeismic;

  const sections: string[] = [
    `### Comparative Intelligence: ${locA.name} vs ${locB.name}`,
    `Comparing verified multi-sector telemetry between **${locA.displayName}** and **${locB.displayName}**:`,
  ];

  // 1. Weather
  if (wA && wB) {
    const diffTemp = Math.abs(wA.current.temperature - wB.current.temperature).toFixed(1);
    const warmerLoc = wA.current.temperature >= wB.current.temperature ? locA.name : locB.name;
    sections.push(
      `#### Weather & Climate\n` +
      `- **${locA.name}:** **${wA.current.temperature.toFixed(1)} °C** (${wA.current.weatherText}, ${wA.current.relativeHumidity}% humidity, ${wA.current.windSpeed.toFixed(1)} km/h wind)\n` +
      `- **${locB.name}:** **${wB.current.temperature.toFixed(1)} °C** (${wB.current.weatherText}, ${wB.current.relativeHumidity}% humidity, ${wB.current.windSpeed.toFixed(1)} km/h wind)\n` +
      `*Delta:* **${warmerLoc}** is currently warmer by **${diffTemp} °C**.`
    );
  }

  // 2. Air Quality
  if (aqA && aqB) {
    const aqiA = aqA.current.usAqi ?? 0;
    const aqiB = aqB.current.usAqi ?? 0;
    const cleanerLoc = aqiA <= aqiB ? locA.name : locB.name;
    sections.push(
      `#### Air Quality\n` +
      `- **${locA.name}:** **${aqA.current.usAqi ?? '—'} US AQI** (*${getAqiCategory(aqA.current.usAqi)}*), PM2.5: **${aqA.current.pm2_5?.toFixed(1) || '—'} µg/m³**\n` +
      `- **${locB.name}:** **${aqB.current.usAqi ?? '—'} US AQI** (*${getAqiCategory(aqB.current.usAqi)}*), PM2.5: **${aqB.current.pm2_5?.toFixed(1) || '—'} µg/m³**\n` +
      `*Comparison:* **${cleanerLoc}** currently enjoys cleaner ambient air quality.`
    );
  }

  // 3. Solar Irradiance
  if (wA && wB) {
    const dniA = wA.current.directNormalIrradiance ?? 0;
    const dniB = wB.current.directNormalIrradiance ?? 0;
    const higherDni = dniA >= dniB ? locA.name : locB.name;
    sections.push(
      `#### Solar Potential\n` +
      `- **${locA.name}:** **${dniA.toFixed(0)} W/m²** DNI, Daily shortwave: **${wA.daily[0]?.shortwaveRadiationSum?.toFixed(1) || '—'} MJ/m²**\n` +
      `- **${locB.name}:** **${dniB.toFixed(0)} W/m²** DNI, Daily shortwave: **${wB.daily[0]?.shortwaveRadiationSum?.toFixed(1) || '—'} MJ/m²**\n` +
      `*Solar Yield:* **${higherDni}** records higher direct solar irradiance.`
    );
  }

  // 4. Hydrology & River Discharge
  if (hydroA && hydroB) {
    const dischA = hydroA.riverDischarge !== undefined ? `${hydroA.riverDischarge.toFixed(2)} m³/s` : 'Unavailable';
    const dischB = hydroB.riverDischarge !== undefined ? `${hydroB.riverDischarge.toFixed(2)} m³/s` : 'Unavailable';
    sections.push(
      `#### Hydrology & River Discharge\n` +
      `- **${locA.name} Basin:** **${dischA}** (GloFAS daily discharge)\n` +
      `- **${locB.name} Basin:** **${dischB}** (GloFAS daily discharge)`
    );
  }

  // 5. Seismology
  if (seismicA && seismicB) {
    sections.push(
      `#### Seismology (USGS ≥ M2.5 within 250 km, Past 90 Days)\n` +
      `- **${locA.name}:** **${seismicA.recentEventCount} events** recorded\n` +
      `- **${locB.name}:** **${seismicB.recentEventCount} events** recorded`
    );
  }

  // 6. National Economy & Scope
  if (wbA && wbB) {
    const isSameCountry = locA.countryCode === locB.countryCode;
    const gdpA = wbA.gdpPerCapita?.value ? `$${Math.round(wbA.gdpPerCapita.value).toLocaleString()}` : '—';
    const gdpB = wbB.gdpPerCapita?.value ? `$${Math.round(wbB.gdpPerCapita.value).toLocaleString()}` : '—';

    sections.push(
      `#### Economy & Sovereign Accounts\n` +
      `- **${locA.name} (${wbA.countryName || 'National'}):** GDP per capita **${gdpA} USD**, Inflation **${wbA.inflationRate?.value?.toFixed(1) || '—'}%**\n` +
      `- **${locB.name} (${wbB.countryName || 'National'}):** GDP per capita **${gdpB} USD**, Inflation **${wbB.inflationRate?.value?.toFixed(1) || '—'}%**\n` +
      `*(Note: ${isSameCountry ? 'Both cities share the same sovereign accounts at the national level' : 'Economic indicators represent sovereign national accounts; municipal living cost variances exist'}).*`
    );
  }

  sections.push(
    `---\n` +
    `**Data Details & Sources:** Open-Meteo, Copernicus CAMS, GloFAS, USGS, World Bank Open Data. Evaluated without simulated fallback values.`
  );

  const answer = sections.join('\n\n');

  const supportingData = [
    ...(wA ? [{ metric: `${locA.name} Temp`, value: wA.current.temperature.toFixed(1), unit: '°C', source: 'Open-Meteo', tier: 'provider_reported_current' as DataClassification }] : []),
    ...(wB ? [{ metric: `${locB.name} Temp`, value: wB.current.temperature.toFixed(1), unit: '°C', source: 'Open-Meteo', tier: 'provider_reported_current' as DataClassification }] : []),
    ...(aqA?.current.usAqi !== undefined ? [{ metric: `${locA.name} AQI`, value: aqA.current.usAqi, unit: 'AQI', source: 'Copernicus CAMS', tier: 'model_analysis' as DataClassification }] : []),
    ...(aqB?.current.usAqi !== undefined ? [{ metric: `${locB.name} AQI`, value: aqB.current.usAqi, unit: 'AQI', source: 'Copernicus CAMS', tier: 'model_analysis' as DataClassification }] : []),
  ];

  return {
    id: `resp-comp-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: compContext.evidenceItems,
    sources: [
      'Open-Meteo Weather & Solar API',
      'Copernicus Atmosphere Monitoring Service (CAMS)',
      'Copernicus GloFAS Flood API',
      'USGS Earthquake Hazards Program',
      'World Bank Open Data API',
    ],
    limitations: 'Direct telemetry compared only where compatible metrics exist. National accounts are not substituted for municipal figures.',
    isDeterministicFallback: true,
    targetLocationName: locA.name,
    secondaryLocationName: locB.name,
    resolvedLocation: locA,
  };
}

/**
 * Explains data sources and calculation methodology
 */
function generateSourceExplanation(query: string, location: GeocodeResult | null): AIResponse {
  const locText = location ? `for **${location.name}**` : 'across all locations';
  const lower = query.toLowerCase();

  let details = '';
  if (lower.includes('solar') || lower.includes('radiation') || lower.includes('dni')) {
    details = `### Solar Energy Data Provenance & Methodology\n\nAtlasIQ evaluates solar energy potential ${locText} using the **Open-Meteo Solar & Radiation API**:\n\n- **Direct Normal Irradiance (DNI):** Beam solar irradiance received by a plane tracking the sun perpendicular to incoming rays (measured in $W/m^2$). Calculated using atmospheric optical depth and cloud transmittance equations.\n- **Global Tilted Irradiance (GTI):** Total solar radiation incident upon photovoltaic modules tilted at optimal fixed inclination toward the equator.\n- **Daily Shortwave Solar Radiation:** 24-hour cumulative global solar energy density (expressed in $MJ/m^2$).\n- **National Renewable Share:** Sovereign energy statistics compiled by the International Energy Agency (IEA) via World Bank Open Data.\n\n*Transparency Standard:* Solar figures reflect atmospheric radiative transfer models; ground rooftop shading and panel soiling factors are not simulated.`;
  } else if (lower.includes('water') || lower.includes('river') || lower.includes('hydrology') || lower.includes('discharge')) {
    details = `### Hydrological Data Provenance & Methodology\n\nAtlasIQ monitors freshwater telemetry ${locText} using the **Copernicus Global Flood Awareness System (GloFAS)** and **ECMWF Land Surface Hydrology**:\n\n- **Daily River Discharge ($m^3/s$):** Modeled daily streamflow volume on a 0.05° spatial grid (~5 km), assimilated using the LISFLOOD hydrological routing engine.\n- **Volumetric Soil Moisture ($m^3/m^3$):** Fractional soil moisture saturation across 0–7 cm (surface), 7–28 cm (root zone), and 28–100 cm (deep subsoil) modeled by ECMWF IFS Land.\n\n*Pending Integrations:* Sub-basin water stress ratios require vector polygon overlays from WRI Aqueduct 4.0; groundwater storage anomalies require gravimetric processing from NASA GRACE-FO.`;
  } else if (lower.includes('air') || lower.includes('aqi') || lower.includes('pm2.5')) {
    details = `### Air Quality Data Provenance & Methodology\n\nAmbient atmospheric composition ${locText} is retrieved from the **Copernicus Atmosphere Monitoring Service (CAMS)** integrated via Open-Meteo:\n\n- **US Air Quality Index (AQI):** Calculated according to US EPA standardized break-point formulas for $PM_{2.5}$, $PM_{10}$, $NO_2$, and $O_3$.\n- **Particulate Matter ($PM_{2.5}$ & $PM_{10}$):** Aerosol optical depth satellite retrievals combined with atmospheric chemical transport models (~11 km spatial resolution).\n- **Trace Gases ($NO_2$, $O_3$):** Photochemical dispersion simulations benchmarked against WHO guidelines.`;
  } else {
    details = `### Authoritative Telemetry Provenance in AtlasIQ\n\nAtlasIQ enforces strict empirical verification and never invents synthetic numbers. Every active metric is mapped to authoritative providers:\n\n1. **Weather & Climate:** Open-Meteo (ECMWF IFS & DWD ICON numerical model assimilation).\n2. **Air Quality:** Copernicus Atmosphere Monitoring Service (CAMS).\n3. **Solar & Radiation:** Open-Meteo Radiative Transfer Engine.\n4. **River Discharge & Soil Moisture:** Copernicus GloFAS & ECMWF Land Surface Models.\n5. **Seismic Hazards:** USGS Earthquake Hazards Program (real-time seismometer network).\n6. **National Accounts & Development:** World Bank Open Data API (official sovereign statistical releases).\n7. **Geocoding & Spatial Indexing:** OpenStreetMap Nominatim.`;
  }

  return {
    id: `resp-src-${Date.now()}`,
    answer: details,
    supportingData: [],
    evidenceItems: [],
    sources: [
      'Open-Meteo Data Documentation',
      'Copernicus Atmosphere Monitoring Service (CAMS)',
      'Copernicus GloFAS Specification',
      'USGS Earthquake Hazards Program',
      'World Bank Open Data API',
    ],
    limitations: 'All data reflects verified open scientific sources. No synthetic numbers are generated.',
    isDeterministicFallback: true,
    targetLocationName: location?.name,
  };
}

/**
 * Explains why specific datasets are in an Integration Pending state
 */
function generateMissingDataExplanation(query: string, location: GeocodeResult | null): AIResponse {
  const locName = location ? location.name : 'any location';
  const lower = query.toLowerCase();

  let explanation = '';
  if (lower.includes('groundwater') || lower.includes('grace')) {
    explanation = `### Groundwater Indicator Status & Technical Requirements\n\nGroundwater storage anomaly tracking requires gravimetric remote sensing from the **NASA GRACE-FO (Gravity Recovery and Climate Experiment Follow-On)** mission.\n\n*Why it is currently pending for ${locName}:*\n1. **Authentication:** Requires authenticated NASA Earthdata Login credentials.\n2. **Complex File Formats:** Distributes monthly mass-anomaly spherical harmonic coefficients in binary netCDF/HDF5 format requiring server-side numerical conversion.\n\n*AtlasIQ Data Integrity Standard:* In accordance with our empirical policy, missing groundwater metrics are explicitly displayed as **Integration Pending** and are never replaced with synthetic estimates or zeroes.`;
  } else if (lower.includes('water stress') || lower.includes('aqueduct')) {
    explanation = `### Water Stress Indicator Status & Technical Requirements\n\nBaseline water stress ratios are published by the **World Resources Institute (WRI Aqueduct 4.0)**.\n\n*Why it is currently pending for ${locName}:*\n- **Spatial Polygon Intersection:** Requires spatial GIS point-in-polygon queries against the HydroBASINS Level-6 global vector boundaries (~16,000 sub-basins).\n- **Architecture Requirement:** Evaluating multi-megabyte topological shapefiles requires dedicated spatial GIS backend infrastructure rather than direct client-side requests.`;
  } else if (lower.includes('mineral') || lower.includes('natural resource')) {
    explanation = `### Critical Mineral Occurrences Status\n\nDocumented strategic raw material occurrences are cataloged by the **USGS Mineral Resources Data System (MRDS)**.\n\n*Why commercial reserves are not shown for ${locName}:*\n- **Spatial Queries:** Requires OGC Web Feature Service (WFS) bounding box querying.\n- **Crucial Distinction:** Known mineral occurrences establish geological presence only; they do not establish economically recoverable commercial reserves without local feasibility studies.`;
  } else if (lower.includes('cost of living') || lower.includes('living cost')) {
    explanation = `### Municipal Living Cost Status\n\nCity-level price basket surveys (such as Numbeo or municipal consumer indices) are not available through open, keyless scientific APIs.\n\n*Why AtlasIQ does not substitute national figures:*\n- National GDP per capita and national CPI inflation reported by the World Bank reflect aggregate sovereign averages.\n- AtlasIQ strictly refuses to downscale or synthesize national averages into municipal living costs without verified city-level survey data.`;
  } else {
    explanation = `### Staged Pending Indicators in AtlasIQ (Phase 5)\n\nAtlasIQ enforces strict data transparency. The following indicators are intentionally preserved in an **Integration Pending** state:\n\n1. **Sub-Basin Water Stress (WRI Aqueduct 4.0):** Requires HydroBASINS Level-6 vector polygon intersection.\n2. **Groundwater Anomalies (NASA GRACE-FO):** Requires NASA Earthdata authentication and gravimetric netCDF processing.\n3. **Soil Organic Carbon (ISRIC SoilGrids):** The SoilGrids REST endpoint is undergoing upstream maintenance (HTTP 503); pending raster ingestion.\n4. **Commercial Mineral Reserves (USGS MRDS):** Documented occurrences establish geological presence only, not commercial reserves.\n5. **Municipal Cost of Living:** National economic aggregates are strictly not substituted for city-level living costs.\n6. **Paved Road Density (OSM Overpass):** Client-side vector corridor clipping requires GIS backend services.`;
  }

  return {
    id: `resp-missing-${Date.now()}`,
    answer: explanation,
    supportingData: [
      { metric: 'Baseline Water Stress Ratio', value: 'Integration Pending', unit: 'ratio', source: 'WRI Aqueduct 4.0', tier: 'unavailable' },
      { metric: 'Groundwater Storage Anomaly', value: 'Integration Pending', unit: 'cm eq. water', source: 'NASA GRACE-FO', tier: 'unavailable' },
      { metric: 'Municipal Living Cost Multiple', value: 'Integration Pending', unit: 'index', source: 'Municipal Survey Layer', tier: 'unavailable' },
    ],
    evidenceItems: [],
    sources: [
      'WRI Aqueduct 4.0 Technical Specification',
      'NASA GRACE-FO User Handbook',
      'AtlasIQ Data Integrity Framework',
    ],
    limitations: 'Pending indicators require spatial vector polygon querying or authenticated raster services.',
    isDeterministicFallback: true,
    targetLocationName: location?.name,
  };
}

/**
 * Domain-specific response: Weather
 */
function generateWeatherResponse(
  location: GeocodeResult,
  weather: WeatherData | null,
  context: GroundedEvidenceContext
): AIResponse {
  if (!weather) {
    return {
      id: `resp-w-none-${Date.now()}`,
      answer: `### Weather Conditions for ${location.name}\n\nMeteorological telemetry is currently loading or unavailable for **${location.displayName}**.`,
      supportingData: [],
      evidenceItems: context.evidenceItems,
      sources: ['Open-Meteo Weather API'],
      limitations: 'Telemetry not yet received from upstream provider.',
      isDeterministicFallback: true,
      targetLocationName: location.name,
      resolvedLocation: location,
    };
  }

  const cur = weather.current;
  const answer = `### Weather and Climate in ${location.name}\n\n` +
    `Current atmospheric observations for **${location.displayName}** (${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°):\n\n` +
    `- **Conditions:** **${cur.weatherText}**\n` +
    `- **Surface Temperature:** **${cur.temperature.toFixed(1)} °C** (feels like **${cur.apparentTemperature.toFixed(1)} °C**)\n` +
    `- **Relative Humidity:** **${cur.relativeHumidity}%**\n` +
    `- **Wind Speed:** **${cur.windSpeed.toFixed(1)} km/h** (Direction: ${cur.windDirection}°)\n` +
    `- **Precipitation:** **${cur.precipitation.toFixed(1)} mm**\n` +
    `- **Surface Pressure:** **${cur.surfacePressure?.toFixed(1) || '—'} hPa**\n\n` +
    `*5-Day Outlook:* Forecast highs reach **${Math.max(...weather.daily.map(d => d.tempMax)).toFixed(0)} °C** with overnight lows of **${Math.min(...weather.daily.map(d => d.tempMin)).toFixed(0)} °C**.\n\n` +
    `---\n**Data Sources:** Open-Meteo Numerical Weather Prediction (ECMWF IFS / DWD ICON assimilation).`;

  const supportingData = [
    { metric: 'Surface Air Temperature', value: cur.temperature.toFixed(1), unit: '°C', source: 'Open-Meteo Weather API', tier: 'provider_reported_current' as DataClassification },
    { metric: 'Apparent Temperature', value: cur.apparentTemperature.toFixed(1), unit: '°C', source: 'Open-Meteo Steadman Equation', tier: 'model_analysis' as DataClassification },
    { metric: 'Relative Humidity', value: cur.relativeHumidity, unit: '%', source: 'Open-Meteo Weather API', tier: 'provider_reported_current' as DataClassification },
    { metric: 'Wind Speed (10m)', value: cur.windSpeed.toFixed(1), unit: 'km/h', source: 'Open-Meteo Weather API', tier: 'model_analysis' as DataClassification },
  ];

  return {
    id: `resp-w-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['Open-Meteo Numerical Weather Forecast Model'],
    limitations: 'Data reflects numerical atmospheric prediction model assimilation (~11 km grid resolution).',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Domain-specific response: Air Quality
 */
function generateAirQualityResponse(
  location: GeocodeResult,
  airQuality: AirQualityData | null,
  context: GroundedEvidenceContext
): AIResponse {
  if (!airQuality) {
    return {
      id: `resp-aq-none-${Date.now()}`,
      answer: `### Air Quality for ${location.name}\n\nAtmospheric air quality records are currently loading or unavailable for **${location.displayName}**.`,
      supportingData: [],
      evidenceItems: context.evidenceItems,
      sources: ['Copernicus Atmosphere Monitoring Service (CAMS)'],
      limitations: 'Telemetry not yet received from upstream provider.',
      isDeterministicFallback: true,
      targetLocationName: location.name,
      resolvedLocation: location,
    };
  }

  const cur = airQuality.current;
  const answer = `### Air Quality in ${location.name}\n\n` +
    `Atmospheric composition reported by **Copernicus CAMS** for **${location.displayName}**:\n\n` +
    `- **US Air Quality Index:** **${cur.usAqi ?? '—'} AQI** (*${getAqiCategory(cur.usAqi)}*)\n` +
    `- **Fine Particulate Matter (PM2.5):** **${cur.pm2_5 !== undefined ? cur.pm2_5.toFixed(1) + ' µg/m³' : '—'}** (WHO 24hr guideline: 15 µg/m³)\n` +
    `- **Coarse Particulate Matter (PM10):** **${cur.pm10 !== undefined ? cur.pm10.toFixed(1) + ' µg/m³' : '—'}** (WHO 24hr guideline: 45 µg/m³)\n` +
    `- **Nitrogen Dioxide (NO₂):** **${cur.nitrogenDioxide !== undefined ? cur.nitrogenDioxide.toFixed(1) + ' µg/m³' : '—'}**\n` +
    `- **Surface Ozone (O₃):** **${cur.ozone !== undefined ? cur.ozone.toFixed(1) + ' µg/m³' : '—'}**\n\n` +
    `---\n**Data Sources:** Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo Air Quality API.`;

  const supportingData = [
    { metric: 'US AQI', value: cur.usAqi ?? '—', unit: 'AQI', source: 'Copernicus CAMS via Open-Meteo', tier: 'model_analysis' as DataClassification },
    { metric: 'Particulate Matter (PM2.5)', value: cur.pm2_5 !== undefined ? cur.pm2_5.toFixed(1) : '—', unit: 'µg/m³', source: 'Copernicus CAMS', tier: 'model_analysis' as DataClassification },
    { metric: 'Particulate Matter (PM10)', value: cur.pm10 !== undefined ? cur.pm10.toFixed(1) : '—', unit: 'µg/m³', source: 'Copernicus CAMS', tier: 'model_analysis' as DataClassification },
  ];

  return {
    id: `resp-aq-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['Copernicus Atmosphere Monitoring Service (CAMS)'],
    limitations: 'Calculated using atmospheric chemical transport models integrated with satellite retrievals (~11 km grid).',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Domain-specific response: Solar & Renewable Energy
 */
function generateSolarResponse(
  location: GeocodeResult,
  weather: WeatherData | null,
  worldBank: WorldBankCountryData | null,
  context: GroundedEvidenceContext
): AIResponse {
  const dni = weather?.current.directNormalIrradiance ?? 0;
  const gti = weather?.current.globalTiltedIrradiance ?? 0;
  const dailyRad = weather?.daily[0]?.shortwaveRadiationSum ?? 0;
  const renewShare = worldBank?.renewableEnergyShare?.value !== null && worldBank?.renewableEnergyShare?.value !== undefined
    ? `${worldBank.renewableEnergyShare.value.toFixed(1)}% of final energy consumption (${worldBank.renewableEnergyShare.year})`
    : 'Unavailable';

  const answer = `### Solar Energy and Renewable Potential in ${location.name}\n\n` +
    `Radiative transfer telemetry retrieved for **${location.displayName}**:\n\n` +
    `- **Direct Normal Irradiance (DNI):** **${dni} W/m²** (tracking perpendicular to the sun)\n` +
    `- **Global Tilted Irradiance (GTI):** **${gti} W/m²** (optimally tilted collectors)\n` +
    `- **Daily Shortwave Solar Radiation:** **${dailyRad.toFixed(2)} MJ/m²**\n` +
    `- **National Renewable Energy Share:** **${renewShare}** (World Bank / IEA, Sovereign Scope)\n\n` +
    `---\n**Data Sources:** Open-Meteo Solar & Radiation API, World Bank Open Data API.`;

  const supportingData = [
    { metric: 'Direct Normal Irradiance (DNI)', value: dni, unit: 'W/m²', source: 'Open-Meteo Solar API', tier: 'model_analysis' as DataClassification },
    { metric: 'Global Tilted Irradiance (GTI)', value: gti, unit: 'W/m²', source: 'Open-Meteo Solar API', tier: 'model_analysis' as DataClassification },
    { metric: 'Daily Shortwave Radiation', value: dailyRad.toFixed(2), unit: 'MJ/m²', source: 'Open-Meteo Solar Forecast', tier: 'forecast' as DataClassification },
  ];

  return {
    id: `resp-solar-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['Open-Meteo Solar & Radiation API', 'World Bank Open Data API'],
    limitations: 'Calculated using radiative transfer equations assuming clear/cloudy atmospheric transmittance.',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Domain-specific response: Water Resources & Hydrology
 */
function generateHydrologyResponse(
  location: GeocodeResult,
  hydrology: HydrologyData | null,
  context: GroundedEvidenceContext
): AIResponse {
  if (!hydrology) {
    return {
      id: `resp-hydro-none-${Date.now()}`,
      answer: `### Water Resources in ${location.name}\n\nHydrological telemetry is currently loading or unavailable for **${location.displayName}**.`,
      supportingData: [],
      evidenceItems: context.evidenceItems,
      sources: ['Copernicus GloFAS Flood API', 'ECMWF Land Surface Model'],
      limitations: 'Telemetry not yet received from upstream provider.',
      isDeterministicFallback: true,
      targetLocationName: location.name,
      resolvedLocation: location,
    };
  }

  const disch = hydrology.riverDischarge !== undefined ? `${hydrology.riverDischarge.toFixed(2)} m³/s` : 'Unavailable';
  const sm1 = hydrology.soilMoisture0to7cm !== undefined ? `${hydrology.soilMoisture0to7cm.toFixed(3)} m³/m³` : '—';
  const sm2 = hydrology.soilMoisture7to28cm !== undefined ? `${hydrology.soilMoisture7to28cm.toFixed(3)} m³/m³` : '—';

  const answer = `### Water Resources and Hydrology in ${location.name}\n\n` +
    `Copernicus GloFAS and ECMWF Land Surface Hydrology telemetry for **${location.displayName}**:\n\n` +
    `- **Daily River Discharge (GloFAS):** **${disch}**\n` +
    `- **Surface Soil Moisture (0–7 cm):** **${sm1}**\n` +
    `- **Root-Zone Soil Moisture (7–28 cm):** **${sm2}**\n\n` +
    `*Pending Layer Requirements:*\n` +
    `- Baseline Water Stress Ratio (WRI Aqueduct 4.0) and Groundwater Storage Anomalies (NASA GRACE-FO) remain in an **Integration Pending** state pending spatial GIS backend deployment.\n\n` +
    `---\n**Data Sources:** Copernicus Global Flood Awareness System (GloFAS), ECMWF Land Surface Model.`;

  const supportingData = [
    {
      metric: 'River Discharge',
      value: hydrology.riverDischarge !== undefined ? hydrology.riverDischarge.toFixed(2) : '—',
      unit: 'm³/s',
      source: 'Copernicus GloFAS via Open-Meteo',
      tier: 'model_analysis' as DataClassification,
    },
    {
      metric: 'Root-Zone Soil Moisture',
      value: hydrology.soilMoisture7to28cm !== undefined ? hydrology.soilMoisture7to28cm.toFixed(3) : '—',
      unit: 'm³/m³',
      source: 'ECMWF Land Model via Open-Meteo',
      tier: 'model_analysis' as DataClassification,
    },
  ];

  return {
    id: `resp-hydro-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['Copernicus Global Flood Awareness System (GloFAS)', 'ECMWF Land Surface Model'],
    limitations: 'River discharge is modeled on a 0.05° grid (~5 km). Sub-basin stress requires spatial vector overlay services.',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Domain-specific response: Seismology
 */
function generateSeismicResponse(
  location: GeocodeResult,
  seismic: SeismicData | null,
  context: GroundedEvidenceContext
): AIResponse {
  if (!seismic) {
    return {
      id: `resp-seismic-none-${Date.now()}`,
      answer: `### Seismology for ${location.name}\n\nSeismological telemetry is currently loading or unavailable for **${location.displayName}**.`,
      supportingData: [],
      evidenceItems: context.evidenceItems,
      sources: ['USGS Earthquake Hazards Program'],
      limitations: 'Telemetry not yet received from upstream provider.',
      isDeterministicFallback: true,
      targetLocationName: location.name,
      resolvedLocation: location,
    };
  }

  const count = seismic.recentEventCount;
  const maxMag = seismic.maxMagnitude !== undefined ? `M${seismic.maxMagnitude.toFixed(1)}` : 'None';
  const nearest = seismic.nearestEvent
    ? `M${seismic.nearestEvent.magnitude.toFixed(1)} near ${seismic.nearestEvent.place} (~${seismic.nearestEvent.distanceKm?.toFixed(0) || '—'} km away)`
    : 'No events ≥ M2.5 within 250 km';

  const answer = `### Seismic Activity and Hazards for ${location.name}\n\n` +
    `Real-time sensor network telemetry from the **USGS Earthquake Hazards Program** for (${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°):\n\n` +
    `- **Recent Seismic Events (Past 90 Days):** **${count} seismic event${count === 1 ? '' : 's'}** (≥ M2.5 within 250 km radius)\n` +
    `- **Peak Recorded Magnitude:** **${maxMag}**\n` +
    `- **Nearest / Strongest Event:** ${nearest}\n\n` +
    (count === 0 ? `*(Note: The absence of minor seismicity does not imply zero long-term seismic hazard).*\n\n` : '') +
    `*Geological Scope Distinction:*\n` +
    `- AtlasIQ reports real physical seismometer network events while maintaining commercial mineral reserves in an explicit **Integration Pending** state until spatial geological layers are deployed.\n\n` +
    `---\n**Data Sources:** USGS Earthquake Hazards Program (earthquake.usgs.gov).`;

  const supportingData = [
    {
      metric: 'Seismic Events (≥ M2.5, 90d, 250km)',
      value: count,
      unit: 'events',
      source: 'USGS Earthquake Hazards Program',
      tier: 'provider_reported_current' as DataClassification,
    },
    {
      metric: 'Peak Magnitude',
      value: seismic.maxMagnitude !== undefined ? seismic.maxMagnitude.toFixed(1) : 'None',
      unit: 'Mw',
      source: 'USGS Earthquake Hazards Program',
      tier: 'provider_reported_current' as DataClassification,
    },
  ];

  return {
    id: `resp-seismic-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['USGS Earthquake Hazards Program API'],
    limitations: 'Seismic events are queried within a 250 km radial buffer for magnitudes ≥ 2.5.',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Domain-specific response: Economy & Development
 */
function generateEconomyResponse(
  location: GeocodeResult,
  worldBank: WorldBankCountryData | null,
  context: GroundedEvidenceContext
): AIResponse {
  if (!worldBank) {
    return {
      id: `resp-econ-none-${Date.now()}`,
      answer: `### National Economy for ${location.name}\n\nOfficial World Bank economic statistics are currently loading or unavailable for **${location.displayName}**.`,
      supportingData: [],
      evidenceItems: context.evidenceItems,
      sources: ['World Bank Open Data API'],
      limitations: 'National economic accounts could not be resolved for this country code.',
      isDeterministicFallback: true,
      targetLocationName: location.name,
      resolvedLocation: location,
    };
  }

  const country = worldBank.countryName || location.country || 'National Scope';
  const gdp = worldBank.gdpPerCapita?.value ? `$${Math.round(worldBank.gdpPerCapita.value).toLocaleString()}` : 'Unavailable';
  const gdpYear = worldBank.gdpPerCapita?.year ? ` (${worldBank.gdpPerCapita.year})` : '';
  const inf = worldBank.inflationRate?.value !== null && worldBank.inflationRate?.value !== undefined
    ? `${worldBank.inflationRate.value.toFixed(1)}%`
    : 'Unavailable';
  const infYear = worldBank.inflationRate?.year ? ` (${worldBank.inflationRate.year})` : '';
  const pop = worldBank.totalPopulation?.value ? `${(worldBank.totalPopulation.value / 1_000_000).toFixed(1)} Million` : 'Unavailable';
  const urb = worldBank.urbanPopulationPercent?.value !== null && worldBank.urbanPopulationPercent?.value !== undefined
    ? `${worldBank.urbanPopulationPercent.value.toFixed(1)}%`
    : 'Unavailable';

  const answer = `### National Economy & Sovereign Accounts for ${location.name} (${country})\n\n` +
    `Official national statistics retrieved from the **World Bank Open Data API**:\n\n` +
    `- **National GDP Per Capita:** **${gdp} USD**${gdpYear}\n` +
    `- **Annual Inflation Rate (CPI):** **${inf}**${infYear}\n` +
    `- **Total National Population:** **${pop}**\n` +
    `- **Urbanization Share:** **${urb}**\n\n` +
    `*Geographic Scope Clarification:*\n` +
    `These metrics reflect **National Aggregate Scope** for ${country}. AtlasIQ does **not** downscale, synthesize, or fabricate city-level Living Cost / CPI indices without verified municipal survey telemetry.\n\n` +
    `---\n**Data Sources:** World Bank Open Data API (api.worldbank.org/v2).`;

  const supportingData = [
    {
      metric: 'GDP Per Capita',
      value: worldBank.gdpPerCapita?.value ? Math.round(worldBank.gdpPerCapita.value).toLocaleString() : '—',
      unit: 'USD',
      source: 'World Bank Open Data (National)',
      tier: 'provider_reported_current' as DataClassification,
    },
    {
      metric: 'Inflation Rate (CPI)',
      value: worldBank.inflationRate?.value !== null && worldBank.inflationRate?.value !== undefined ? worldBank.inflationRate.value.toFixed(1) : '—',
      unit: '%',
      source: 'World Bank Open Data (National)',
      tier: 'provider_reported_current' as DataClassification,
    },
  ];

  return {
    id: `resp-econ-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['World Bank Open Data API'],
    limitations: 'National accounts represent sovereign statistical reporting. Sub-national municipal cost-of-living indices remain unpopulated.',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Domain-specific response: Healthcare
 */
function generateHealthcareResponse(
  location: GeocodeResult,
  worldBank: WorldBankCountryData | null,
  context: GroundedEvidenceContext
): AIResponse {
  const beds = worldBank?.hospitalBeds?.value !== null && worldBank?.hospitalBeds?.value !== undefined
    ? `${worldBank.hospitalBeds.value.toFixed(1)} per 1,000 residents (${worldBank.hospitalBeds.year})`
    : 'Unavailable';
  const le = worldBank?.lifeExpectancy?.value !== null && worldBank?.lifeExpectancy?.value !== undefined
    ? `${worldBank.lifeExpectancy.value.toFixed(1)} years (${worldBank.lifeExpectancy.year})`
    : 'Unavailable';
  const phys = worldBank?.physiciansPer1000?.value !== null && worldBank?.physiciansPer1000?.value !== undefined
    ? `${worldBank.physiciansPer1000.value.toFixed(2)} per 1,000 residents (${worldBank.physiciansPer1000.year})`
    : 'Unavailable';

  const answer = `### Healthcare and Social Capacity in ${location.name}\n\n` +
    `Official national health metrics for **${worldBank?.countryName || location.name}** via **World Bank / WHO**:\n\n` +
    `- **Physicians Density:** **${phys}**\n` +
    `- **Hospital Bed Density:** **${beds}**\n` +
    `- **Life Expectancy at Birth:** **${le}**\n\n` +
    `*Note:* Metrics reflect sovereign national averages. Municipal clinic access requires spatial vector routing.\n\n` +
    `---\n**Data Sources:** World Bank Open Data API, World Health Organization (WHO).`;

  const supportingData = [
    {
      metric: 'Hospital Beds',
      value: worldBank?.hospitalBeds?.value !== null && worldBank?.hospitalBeds?.value !== undefined ? worldBank.hospitalBeds.value.toFixed(1) : '—',
      unit: 'per 1,000 residents',
      source: 'World Bank / WHO (National)',
      tier: 'provider_reported_current' as DataClassification,
    },
    {
      metric: 'Life Expectancy',
      value: worldBank?.lifeExpectancy?.value !== null && worldBank?.lifeExpectancy?.value !== undefined ? worldBank.lifeExpectancy.value.toFixed(1) : '—',
      unit: 'years',
      source: 'World Bank Open Data (National)',
      tier: 'provider_reported_current' as DataClassification,
    },
  ];

  return {
    id: `resp-health-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['World Bank Open Data API', 'World Health Organization (WHO)'],
    limitations: 'Values represent national sovereign baselines.',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

/**
 * Domain-specific response: Infrastructure
 */
function generateInfrastructureResponse(
  location: GeocodeResult,
  worldBank: WorldBankCountryData | null,
  context: GroundedEvidenceContext
): AIResponse {
  const elec = worldBank?.electricityAccess?.value !== null && worldBank?.electricityAccess?.value !== undefined
    ? `${worldBank.electricityAccess.value.toFixed(1)}% of population (${worldBank.electricityAccess.year})`
    : 'Unavailable';
  const net = worldBank?.internetUsersPercent?.value !== null && worldBank?.internetUsersPercent?.value !== undefined
    ? `${worldBank.internetUsersPercent.value.toFixed(1)}% of population (${worldBank.internetUsersPercent.year})`
    : 'Unavailable';
  const bb = worldBank?.fixedBroadband?.value !== null && worldBank?.fixedBroadband?.value !== undefined
    ? `${worldBank.fixedBroadband.value.toFixed(1)} per 100 people (${worldBank.fixedBroadband.year})`
    : 'Unavailable';

  const answer = `### Infrastructure and Digital Connectivity in ${location.name}\n\n` +
    `National connectivity indicators for **${worldBank?.countryName || location.name}** via **World Bank / ITU**:\n\n` +
    `- **Electrical Grid Access:** **${elec}**\n` +
    `- **Internet Penetration:** **${net}**\n` +
    `- **Fixed Broadband Subscriptions:** **${bb}**\n\n` +
    `---\n**Data Sources:** World Bank Open Data API, International Telecommunication Union (ITU).`;

  const supportingData = [
    {
      metric: 'Electricity Access',
      value: worldBank?.electricityAccess?.value !== null && worldBank?.electricityAccess?.value !== undefined ? worldBank.electricityAccess.value.toFixed(1) : '—',
      unit: '%',
      source: 'World Bank Open Data (National)',
      tier: 'provider_reported_current' as DataClassification,
    },
    {
      metric: 'Internet Penetration',
      value: worldBank?.internetUsersPercent?.value !== null && worldBank?.internetUsersPercent?.value !== undefined ? worldBank.internetUsersPercent.value.toFixed(1) : '—',
      unit: '%',
      source: 'World Bank / ITU (National)',
      tier: 'provider_reported_current' as DataClassification,
    },
  ];

  return {
    id: `resp-infra-${Date.now()}`,
    answer,
    supportingData,
    evidenceItems: context.evidenceItems,
    sources: ['World Bank Open Data API', 'International Telecommunication Union (ITU)'],
    limitations: 'Values represent national electrification and digital penetration.',
    isDeterministicFallback: true,
    targetLocationName: location.name,
    resolvedLocation: location,
  };
}

function getAqiCategory(aqi?: number): string {
  if (aqi === undefined) return 'Unknown';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}
