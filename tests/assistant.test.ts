import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseQueryIntent,
  askIntelligenceAssistant,
  ConversationContextState,
} from '../src/services/aiAssistant';
import {
  formatDisplayValueWithUnit,
  stripUnitFromValue,
  isValidNumeric,
} from '../src/utils/formatters';
import { seedGeocodeCache } from '../src/services/geocoding';
import {
  GeocodeResult,
  WeatherData,
  AirQualityData,
  WorldBankCountryData,
  HydrologyData,
  SeismicData,
} from '../src/types';

// Mock fixtures
const mockChennai: GeocodeResult = {
  placeId: 101,
  name: 'Chennai',
  displayName: 'Chennai, Tamil Nadu, India',
  lat: 13.0827,
  lng: 80.2707,
  country: 'India',
  countryCode: 'in',
  state: 'Tamil Nadu',
  type: 'city',
  importance: 0.85,
};

const mockTokyo: GeocodeResult = {
  placeId: 102,
  name: 'Tokyo',
  displayName: 'Tokyo, Japan',
  lat: 35.6762,
  lng: 139.6503,
  country: 'Japan',
  countryCode: 'jp',
  type: 'city',
  importance: 0.9,
};

const mockHyderabad: GeocodeResult = {
  placeId: 103,
  name: 'Hyderabad',
  displayName: 'Hyderabad, Telangana, India',
  lat: 17.3850,
  lng: 78.4867,
  country: 'India',
  countryCode: 'in',
  state: 'Telangana',
  type: 'city',
  importance: 0.85,
};

const mockChennaiWeather: WeatherData = {
  latitude: 13.08,
  longitude: 80.27,
  elevation: 10,
  current: {
    time: '2026-11-01T12:00',
    temperature: 28.4,
    apparentTemperature: 31.0,
    relativeHumidity: 65,
    windSpeed: 14.2,
    windDirection: 80,
    weatherCode: 0,
    weatherText: 'Clear sky',
    precipitation: 0.0,
    directNormalIrradiance: 620,
    globalTiltedIrradiance: 580,
  },
  daily: [
    {
      date: '2026-11-01',
      weatherCode: 0,
      weatherText: 'Clear sky',
      tempMax: 32.0,
      tempMin: 24.0,
      precipitationSum: 0.0,
      shortwaveRadiationSum: 19.5,
      et0Evapotranspiration: 4.8,
    },
  ],
  retrievedAt: '2026-11-01T12:00:00Z',
  provider: 'Open-Meteo',
  dataTier: 'model_analysis',
  dataSourceNotes: 'Assimilated NWP',
};

const mockTokyoWeather: WeatherData = {
  latitude: 35.68,
  longitude: 139.69,
  elevation: 40,
  current: {
    time: '2026-11-01T12:00',
    temperature: 15.2,
    apparentTemperature: 14.0,
    relativeHumidity: 45,
    windSpeed: 10.0,
    windDirection: 180,
    weatherCode: 1,
    weatherText: 'Mainly clear',
    precipitation: 0.0,
    directNormalIrradiance: 450,
    globalTiltedIrradiance: 410,
  },
  daily: [
    {
      date: '2026-11-01',
      weatherCode: 1,
      weatherText: 'Mainly clear',
      tempMax: 18.0,
      tempMin: 11.0,
      precipitationSum: 0.0,
      shortwaveRadiationSum: 14.2,
      et0Evapotranspiration: 2.5,
    },
  ],
  retrievedAt: '2026-11-01T12:00:00Z',
  provider: 'Open-Meteo',
  dataTier: 'model_analysis',
  dataSourceNotes: 'Assimilated NWP',
};

const mockChennaiAirQuality: AirQualityData = {
  latitude: 13.08,
  longitude: 80.27,
  current: {
    time: '2026-11-01T12:00',
    usAqi: 118,
    europeanAqi: 65,
    pm2_5: 42.5,
    pm10: 68.0,
    nitrogenDioxide: 18.2,
    ozone: 24.0,
  },
  retrievedAt: '2026-11-01T12:00:00Z',
  provider: 'Copernicus CAMS',
  dataTier: 'model_analysis',
  dataSourceNotes: 'Atmospheric dispersion',
};

const mockIndiaWorldBank: WorldBankCountryData = {
  countryCode: 'IN',
  countryName: 'India',
  gdpPerCapita: { indicator: 'NY.GDP.PCAP.CD', value: 2411, year: '2023' },
  inflationRate: { indicator: 'FP.CPI.TOTL.ZG', value: 5.4, year: '2023' },
  totalPopulation: { indicator: 'SP.POP.TOTL', value: 1428000000, year: '2023' },
  urbanPopulationPercent: { indicator: 'SP.URB.TOTL.IN.ZS', value: 36.4, year: '2023' },
  laborForceParticipation: { indicator: 'SL.TLF.CACT.ZS', value: 55.2, year: '2023' },
  hospitalBeds: { indicator: 'SH.MED.BEDS.ZS', value: 0.5, year: '2019' },
  physiciansPer1000: { indicator: 'SH.MED.PHYS.ZS', value: 0.73, year: '2020' },
  lifeExpectancy: { indicator: 'SP.DYN.LE00.IN', value: 67.7, year: '2022' },
  healthExpenditurePctGdp: { indicator: 'SH.XPD.CHEX.GD.ZS', value: 3.3, year: '2021' },
  electricityAccess: { indicator: 'EG.ELC.ACCS.ZS', value: 99.6, year: '2022' },
  renewableEnergyShare: { indicator: 'EG.FEC.RNEW.ZS', value: 34.9, year: '2021' },
  internetUsersPercent: { indicator: 'IT.NET.USER.ZS', value: 52.0, year: '2022' },
  fixedBroadband: { indicator: 'IT.NET.BBND.P2', value: 2.6, year: '2023' },
  logisticsPerformanceIndex: { indicator: 'LP.LPI.OVRL.XQ', value: 3.4, year: '2023' },
  retrievedAt: '2026-11-01T12:00:00Z',
  provider: 'World Bank Open Data',
  dataTier: 'provider_reported_current',
};

const mockChennaiHydrology: HydrologyData = {
  latitude: 13.08,
  longitude: 80.27,
  time: '2026-11-01',
  riverDischarge: 49.93,
  soilMoisture0to7cm: 0.185,
  soilMoisture7to28cm: 0.218,
  soilMoisture28to100cm: 0.254,
  retrievedAt: '2026-11-01T12:00:00Z',
  provider: 'Copernicus GloFAS / ECMWF',
  dataTier: 'model_analysis',
  dataSourceNotes: 'Modeled basin discharge',
};

const mockChennaiSeismic: SeismicData = {
  latitude: 13.08,
  longitude: 80.27,
  recentEventCount: 0,
  maxMagnitude: undefined,
  events: [],
  retrievedAt: '2026-11-01T12:00:00Z',
  provider: 'USGS Earthquake Hazards',
  dataTier: 'provider_reported_current',
  dataSourceNotes: 'Physical seismometer network',
};

// Seed geocoding cache for deterministic offline testing
seedGeocodeCache('chennai, india', [mockChennai]);
seedGeocodeCache('chennai', [mockChennai]);
seedGeocodeCache('hyderabad, india', [mockHyderabad]);
seedGeocodeCache('hyderabad', [mockHyderabad]);
seedGeocodeCache('tokyo, japan', [mockTokyo]);
seedGeocodeCache('tokyo', [mockTokyo]);

// ==========================================
// TEST SUITE: Intent Parsing & Formatter
// ==========================================

test('parseQueryIntent extracts "Give me about Chennai, India"', () => {
  const intent = parseQueryIntent('Give me about Chennai, India');
  assert.equal(intent.explicitLocations.length, 1);
  assert.equal(intent.explicitLocations[0], 'Chennai, India');
  assert.equal(intent.isComparison, false);
});

test('parseQueryIntent handles comparison "How does Chennai compare with Hyderabad?"', () => {
  const intent = parseQueryIntent('How does Chennai compare with Hyderabad?');
  assert.equal(intent.isComparison, true);
  assert.equal(intent.explicitLocations.length, 2);
  assert.equal(intent.explicitLocations[0], 'Chennai');
  assert.equal(intent.explicitLocations[1], 'Hyderabad');
});

test('parseQueryIntent handles anaphora "Compare it with Hyderabad" using context', () => {
  const intent = parseQueryIntent('Compare it with Hyderabad', 'Chennai');
  assert.equal(intent.isComparison, true);
  assert.equal(intent.isAnaphoric, true);
  assert.equal(intent.explicitLocations.length, 2);
  assert.equal(intent.explicitLocations[0], 'Chennai');
  assert.equal(intent.explicitLocations[1], 'Hyderabad');
});

test('parseQueryIntent categorizes missing data questions', () => {
  const intent = parseQueryIntent('Why is the groundwater indicator unavailable?');
  assert.equal(intent.topicCategory, 'missing');
  assert.equal(intent.explicitLocations.length, 0);
});

test('parseQueryIntent categorizes source questions', () => {
  const intent = parseQueryIntent('What is the source of the solar data?');
  assert.equal(intent.topicCategory, 'source');
  assert.equal(intent.explicitLocations.length, 0);
});

test('formatters prevent duplicate units like "49.93 m³/s m³/s"', () => {
  const raw = '49.93 m³/s';
  const stripped = stripUnitFromValue(raw, 'm³/s');
  assert.equal(stripped, '49.93');

  const formatted = formatDisplayValueWithUnit(raw, 'm³/s');
  assert.equal(formatted, '49.93 m³/s');
  assert.notEqual(formatted, '49.93 m³/s m³/s');
});

test('formatters preserve legitimate zeros and handle missing data', () => {
  assert.equal(formatDisplayValueWithUnit(0, 'events'), '0 events');
  assert.equal(formatDisplayValueWithUnit(0, 'mm'), '0 mm');
  assert.equal(formatDisplayValueWithUnit(0, '°C'), '0 °C');
  assert.equal(formatDisplayValueWithUnit(null, 'm³/s'), 'Unavailable');
  assert.equal(formatDisplayValueWithUnit(undefined, 'm³/s'), 'Unavailable');
  assert.equal(formatDisplayValueWithUnit('—', 'm³/s'), 'Unavailable');
});

// ==========================================
// SCENARIO TESTS: Test A through Test H
// ==========================================

test('Test A: User asks "Give me about Chennai, India" -> identifies Chennai, India, no Tokyo data', async () => {
  // Even if Tokyo was the activeLocation in map context!
  const response = await askIntelligenceAssistant(
    'Give me about Chennai, India',
    mockTokyo, // Map location is Tokyo!
    mockTokyoWeather,
    null,
    null,
    null,
    null,
    undefined,
    undefined
  );

  // The assistant must answer about Chennai, India
  assert.match(response.answer, /Chennai/i);
  assert.doesNotMatch(response.answer, /Tokyo/i);
  assert.doesNotMatch(response.answer, /Japan/i);
  assert.equal(response.targetLocationName, 'Chennai');
});

test('Test B: User asks about Tokyo, then asks about Chennai -> second answer uses Chennai, not cached Tokyo', async () => {
  const context: ConversationContextState = {
    lastLocation: mockTokyo,
    lastWeather: mockTokyoWeather,
    lastAirQuality: null,
    lastWorldBank: null,
    lastHydrology: null,
    lastSeismic: null,
  };

  const response = await askIntelligenceAssistant(
    'Give me about Chennai, India',
    mockTokyo,
    mockTokyoWeather,
    null,
    null,
    null,
    null,
    undefined,
    context
  );

  assert.match(response.answer, /Chennai/i);
  assert.doesNotMatch(response.answer, /Tokyo/i);
  assert.doesNotMatch(response.answer, /Japan/i);
  assert.equal(response.targetLocationName, 'Chennai');
});

test('Test C: User asks about Chennai, then "Compare it with Hyderabad" -> resolved independently, values not mixed', async () => {
  const context: ConversationContextState = {
    lastLocation: mockChennai,
    lastWeather: mockChennaiWeather,
    lastAirQuality: mockChennaiAirQuality,
    lastWorldBank: mockIndiaWorldBank,
    lastHydrology: mockChennaiHydrology,
    lastSeismic: mockChennaiSeismic,
  };

  const response = await askIntelligenceAssistant(
    'Compare it with Hyderabad',
    mockChennai,
    mockChennaiWeather,
    mockChennaiAirQuality,
    mockIndiaWorldBank,
    mockChennaiHydrology,
    mockChennaiSeismic,
    undefined,
    context
  );

  assert.equal(response.isDeterministicFallback, true);
  assert.match(response.answer, /Chennai/i);
  assert.match(response.answer, /Hyderabad/i);
  assert.doesNotMatch(response.answer, /Tokyo/i);
});

test('Test D: An API returns a missing metric -> identifies unavailable information without inventing a number', async () => {
  // Chennai with null hydrology
  const context: ConversationContextState = {
    lastLocation: mockChennai,
    lastWeather: mockChennaiWeather,
    lastAirQuality: mockChennaiAirQuality,
    lastWorldBank: mockIndiaWorldBank,
    lastHydrology: null, // missing hydrology API
    lastSeismic: mockChennaiSeismic,
  };

  const response = await askIntelligenceAssistant(
    'What is the river discharge in Chennai?',
    mockChennai,
    mockChennaiWeather,
    mockChennaiAirQuality,
    mockIndiaWorldBank,
    null,
    mockChennaiSeismic,
    undefined,
    context
  );

  assert.match(response.answer, /unavailable|loading/i);
  // Ensure no invented number is returned
  assert.doesNotMatch(response.answer, /\b\d+\.\d+\s*m³\/s/);
});

test('Test E: An API returns a legitimate zero -> preserves valid zero and interprets appropriately', async () => {
  const context: ConversationContextState = {
    lastLocation: mockChennai,
    lastWeather: mockChennaiWeather, // precipitation is 0.0 mm
    lastAirQuality: mockChennaiAirQuality,
    lastWorldBank: mockIndiaWorldBank,
    lastHydrology: mockChennaiHydrology,
    lastSeismic: mockChennaiSeismic, // 0 earthquakes in 90 days
  };

  const response = await askIntelligenceAssistant(
    'Are there earthquakes in Chennai?',
    mockChennai,
    mockChennaiWeather,
    mockChennaiAirQuality,
    mockIndiaWorldBank,
    mockChennaiHydrology,
    mockChennaiSeismic,
    undefined,
    context
  );

  // Checks that zero events is preserved and noted correctly
  assert.match(response.answer, /0 seismic events/i);
  assert.match(response.answer, /absence of minor seismicity does not imply zero/i);
});

test('Test F: An API request fails -> reports failure gracefully without fabricating data', async () => {
  // Querying a completely invalid place
  const response = await askIntelligenceAssistant(
    'Tell me about NonexistentFictionalCityXYZ12345',
    mockTokyo, // Map location is Tokyo
    mockTokyoWeather,
    null,
    null,
    null,
    null
  );

  assert.match(response.answer, /unable to locate|Location Not Found/i);
  assert.match(response.answer, /NonexistentFictionalCityXYZ12345/);
  // Must NOT fall back to Tokyo!
  assert.doesNotMatch(response.answer, /Tokyo/i);
  assert.doesNotMatch(response.answer, /Japan/i);
});

test('Test G: Follow-up question about current location -> preserves context unless user names a different location', async () => {
  const context: ConversationContextState = {
    lastLocation: mockChennai,
    lastWeather: mockChennaiWeather,
    lastAirQuality: mockChennaiAirQuality,
    lastWorldBank: mockIndiaWorldBank,
    lastHydrology: mockChennaiHydrology,
    lastSeismic: mockChennaiSeismic,
  };

  // User does NOT specify a city in the follow-up question
  const response = await askIntelligenceAssistant(
    'What is the air quality?',
    mockTokyo, // Map location happens to be Tokyo
    mockTokyoWeather,
    null,
    null,
    null,
    null,
    undefined,
    context // Conversation context is Chennai
  );

  // Must answer for Chennai (conversation context), NOT Tokyo!
  assert.match(response.answer, /Chennai/i);
  assert.match(response.answer, /118\s*AQI/i);
  assert.doesNotMatch(response.answer, /Tokyo/i);
});

test('Test H: Broad location question -> returns readable overview rather than dumping raw telemetry records', async () => {
  const context: ConversationContextState = {
    lastLocation: mockChennai,
    lastWeather: mockChennaiWeather,
    lastAirQuality: mockChennaiAirQuality,
    lastWorldBank: mockIndiaWorldBank,
    lastHydrology: mockChennaiHydrology,
    lastSeismic: mockChennaiSeismic,
  };

  const response = await askIntelligenceAssistant(
    'Give me an overview of Chennai',
    mockChennai,
    mockChennaiWeather,
    mockChennaiAirQuality,
    mockIndiaWorldBank,
    mockChennaiHydrology,
    mockChennaiSeismic,
    undefined,
    context
  );

  // Check structure matches recommended headings
  assert.match(response.answer, /### Chennai.*— Location Intelligence Overview/i);
  assert.match(response.answer, /#### Weather and Climate/i);
  assert.match(response.answer, /#### Air Quality/i);
  assert.match(response.answer, /#### Solar and Environment/i);
  assert.match(response.answer, /#### Water Resources/i);
  assert.match(response.answer, /#### Earthquakes and Natural Hazards/i);
  assert.match(response.answer, /#### Economy and Development/i);
  assert.match(response.answer, /#### Data Limitations/i);
  assert.match(response.answer, /Data Details & Sources/i);

  // Check that supporting data has clean values without unit duplication
  for (const item of response.supportingData) {
    if (typeof item.value === 'string') {
      assert.doesNotMatch(item.value, /m³\/s\s*m³\/s/);
      assert.doesNotMatch(item.value, /°C\s*°C/);
    }
  }
});
