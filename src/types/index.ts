export type ModuleId =
  | 'climate'
  | 'agriculture'
  | 'water'
  | 'energy'
  | 'environment'
  | 'natural-resources'
  | 'economy'
  | 'healthcare-education'
  | 'infrastructure';

export type DataClassification =
  | 'observation'
  | 'provider_reported_current'
  | 'model_analysis'
  | 'forecast'
  | 'historical_baseline'
  | 'estimate'
  | 'simulation'
  | 'unavailable';

export type DataStatus =
  | 'observation'
  | 'measured'
  | 'provider_reported_current'
  | 'model_analysis'
  | 'forecast'
  | 'historical_baseline'
  | 'estimate'
  | 'estimated'
  | 'simulation'
  | 'unavailable'
  | 'awaiting_geocoding'
  | 'geocoding';

export type LocationResolutionState =
  | 'idle'
  | 'query_entered'
  | 'resolving'
  | 'resolved'
  | 'error';

export interface LocationItem {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
}

export interface GeocodeResult {
  placeId: number;
  displayName: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  importance: number;
  country?: string;
  state?: string;
  city?: string;
  countryCode?: string;
  boundingBox?: [number, number, number, number];
}

export interface WeatherCurrent {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  weatherCode: number;
  weatherText: string;
  windSpeed: number;
  windDirection: number;
  isDay: boolean;
  surfacePressure?: number;
  directNormalIrradiance?: number;
  globalTiltedIrradiance?: number;
}

export interface WeatherForecastDay {
  date: string;
  weatherCode: number;
  weatherText: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax?: number;
  windSpeedMax: number;
  shortwaveRadiationSum?: number;
  et0Evapotranspiration?: number;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  current: WeatherCurrent;
  daily: WeatherForecastDay[];
  provider: string;
  retrievedAt: string;
  dataTier: DataClassification;
  dataSourceNotes: string;
}

export interface AirQualityCurrent {
  time: string;
  europeanAqi?: number;
  usAqi?: number;
  pm2_5?: number;
  pm10?: number;
  nitrogenDioxide?: number;
  ozone?: number;
}

export interface AirQualityData {
  latitude: number;
  longitude: number;
  current: AirQualityCurrent;
  provider: string;
  retrievedAt: string;
  dataTier: DataClassification;
  dataSourceNotes: string;
}

export interface DomainMetric {
  id: string;
  name: string;
  category: ModuleId;
  value: number | string | null;
  unit: string;
  classification: DataClassification;
  source: string;
  coverage?: string;
  retrievedAt?: string;
  observationTime?: string;
  qualityNotes?: string;
  unavailableReason?: string;
  geographicScope?: string;
}

export interface HydrologyData {
  latitude: number;
  longitude: number;
  riverDischarge?: number; // m³/s (GloFAS model)
  soilMoisture0to7cm?: number; // m³/m³
  soilMoisture7to28cm?: number; // m³/m³
  soilMoisture28to100cm?: number; // m³/m³
  time?: string;
  provider: string;
  dataTier: DataClassification;
  dataSourceNotes: string;
  retrievedAt: string;
}

export interface WorldBankIndicatorValue {
  value: number | null;
  year: string;
  indicatorId: string;
  indicatorName: string;
}

export interface WorldBankCountryData {
  countryCode: string;
  countryName: string;
  gdpPerCapita?: WorldBankIndicatorValue;
  inflationRate?: WorldBankIndicatorValue;
  totalPopulation?: WorldBankIndicatorValue;
  urbanPopulationPercent?: WorldBankIndicatorValue;
  hospitalBeds?: WorldBankIndicatorValue;
  lifeExpectancy?: WorldBankIndicatorValue;
  electricityAccess?: WorldBankIndicatorValue;
  internetUsersPercent?: WorldBankIndicatorValue;
  physiciansPer1000?: WorldBankIndicatorValue;
  healthExpenditurePctGdp?: WorldBankIndicatorValue;
  renewableEnergyShare?: WorldBankIndicatorValue;
  laborForceParticipation?: WorldBankIndicatorValue;
  logisticsPerformanceIndex?: WorldBankIndicatorValue;
  fixedBroadband?: WorldBankIndicatorValue;
  retrievedAt: string;
  source: string;
}

export interface SeismicEvent {
  id: string;
  magnitude: number;
  place: string;
  time: string;
  distanceKm?: number;
}

export interface SeismicData {
  latitude: number;
  longitude: number;
  recentEventCount: number;
  maxMagnitude?: number;
  nearestEvent?: SeismicEvent;
  events?: SeismicEvent[];
  retrievedAt: string;
  provider: string;
  dataTier: DataClassification;
  dataSourceNotes: string;
}

export interface DomainIntelligence {
  domainId: ModuleId;
  domainTitle: string;
  status: 'available' | 'partial' | 'unavailable';
  metrics: DomainMetric[];
  summary?: string;
  limitations: string;
}

export interface IntelligenceModuleMeta {
  id: ModuleId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  path: string;
  iconName: string;
  indicatorCount: number;
  plannedDataSources: string[];
  reportingPeriod: string;
  sampleIndicators: {
    name: string;
    description: string;
    unit: string;
    status: DataStatus;
  }[];
}

export interface MetricCardProps {
  label: string;
  value?: string | number | null;
  unit?: string;
  status?: DataStatus;
  statusLabel?: string;
  description?: string;
  subtext?: string;
  source?: string;
  timestamp?: string;
  geographicScope?: string;
  icon?: React.ReactNode;
  className?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
  isNotice?: boolean;
  supportingData?: {
    metric: string;
    value: string | number;
    unit: string;
    source: string;
    tier: DataClassification;
  }[];
  limitations?: string;
  targetLocationName?: string;
}

export interface ScenarioParameter {
  id: string;
  name: string;
  description: string;
  defaultValue: number;
  unit: string;
  min: number;
  max: number;
  step: number;
}

export interface ResourceGapCategory {
  id: string;
  name: string;
  unit: string;
  description: string;
}
