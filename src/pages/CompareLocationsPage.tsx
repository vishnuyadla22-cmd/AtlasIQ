import React, { useState, useCallback, useRef } from 'react';
import {
  GitCompare,
  MapPin,
  Filter,
  Search,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { StatusPill } from '../components/common/StatusPill';
import { searchLocations } from '../services/geocoding';
import { fetchWeatherData } from '../services/weather';
import { fetchAirQualityData } from '../services/airQuality';
import { fetchHydrologyData } from '../services/hydrology';
import { fetchWorldBankData } from '../services/worldBank';
import { fetchSeismicData } from '../services/seismic';
import {
  GeocodeResult,
  WeatherData,
  AirQualityData,
  WorldBankCountryData,
  HydrologyData,
  SeismicData,
  DataClassification,
} from '../types';

interface ComparisonRow {
  id: string;
  category: string;
  name: string;
  unit: string;
  classification: DataClassification;
  valA: number | string | null;
  valB: number | string | null;
  source: string;
  deltaText?: string;
  deltaType?: 'neutral' | 'a_higher' | 'b_higher' | 'incomparable';
  note?: string;
}

export const CompareLocationsPage: React.FC = () => {
  // Location A State
  const [queryA, setQueryA] = useState('');
  const [locA, setLocA] = useState<GeocodeResult | null>(null);
  const [candidatesA, setCandidatesA] = useState<GeocodeResult[]>([]);
  const [loadingA, setLoadingA] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [weatherA, setWeatherA] = useState<WeatherData | null>(null);
  const [aqA, setAqA] = useState<AirQualityData | null>(null);
  const [hydroA, setHydroA] = useState<HydrologyData | null>(null);
  const [wbA, setWbA] = useState<WorldBankCountryData | null>(null);
  const [seismicA, setSeismicA] = useState<SeismicData | null>(null);

  // Location B State
  const [queryB, setQueryB] = useState('');
  const [locB, setLocB] = useState<GeocodeResult | null>(null);
  const [candidatesB, setCandidatesB] = useState<GeocodeResult[]>([]);
  const [loadingB, setLoadingB] = useState(false);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [weatherB, setWeatherB] = useState<WeatherData | null>(null);
  const [aqB, setAqB] = useState<AirQualityData | null>(null);
  const [hydroB, setHydroB] = useState<HydrologyData | null>(null);
  const [wbB, setWbB] = useState<WorldBankCountryData | null>(null);
  const [seismicB, setSeismicB] = useState<SeismicData | null>(null);

  const [activeCategory, setActiveCategory] = useState('all');

  const abortRefA = useRef<AbortController | null>(null);
  const abortRefB = useRef<AbortController | null>(null);

  // Load telemetry for a selected location
  const loadTelemetryFor = async (
    target: 'A' | 'B',
    lat: number,
    lng: number,
    countryCode?: string,
    countryName?: string
  ) => {
    const controller = new AbortController();
    if (target === 'A') {
      abortRefA.current?.abort();
      abortRefA.current = controller;
    } else {
      abortRefB.current?.abort();
      abortRefB.current = controller;
    }

    const [wRes, aqRes, hydroRes, seismicRes, wbRes] = await Promise.all([
      fetchWeatherData(lat, lng, controller.signal),
      fetchAirQualityData(lat, lng, controller.signal),
      fetchHydrologyData(lat, lng, controller.signal),
      fetchSeismicData(lat, lng, controller.signal),
      fetchWorldBankData(countryCode, countryName, controller.signal),
    ]);

    if (target === 'A') {
      if (!wRes.error && wRes.data) setWeatherA(wRes.data);
      if (!aqRes.error && aqRes.data) setAqA(aqRes.data);
      if (!hydroRes.error && hydroRes.data) setHydroA(hydroRes.data);
      if (!seismicRes.error && seismicRes.data) setSeismicA(seismicRes.data);
      if (!wbRes.error && wbRes.data) setWbA(wbRes.data);
    } else {
      if (!wRes.error && wRes.data) setWeatherB(wRes.data);
      if (!aqRes.error && aqRes.data) setAqB(aqRes.data);
      if (!hydroRes.error && hydroRes.data) setHydroB(hydroRes.data);
      if (!seismicRes.error && seismicRes.data) setSeismicB(seismicRes.data);
      if (!wbRes.error && wbRes.data) setWbB(wbRes.data);
    }
  };

  // Search handler for Location A
  const handleSearchA = useCallback(async (textToSearch?: string) => {
    const q = (textToSearch || queryA).trim();
    if (!q || q.length < 2) return;

    setErrorA(null);
    setLoadingA(true);
    setCandidatesA([]);

    const { data, error } = await searchLocations(q);
    setLoadingA(false);

    if (error) {
      setErrorA(error);
      setLocA(null);
    } else if (data.length === 0) {
      setErrorA(`No coordinates found matching "${q}".`);
      setLocA(null);
    } else {
      setCandidatesA(data);
      const chosen = data[0];
      setLocA(chosen);
      loadTelemetryFor('A', chosen.lat, chosen.lng, chosen.countryCode, chosen.country);
    }
  }, [queryA]);

  // Search handler for Location B
  const handleSearchB = useCallback(async (textToSearch?: string) => {
    const q = (textToSearch || queryB).trim();
    if (!q || q.length < 2) return;

    setErrorB(null);
    setLoadingB(true);
    setCandidatesB([]);

    const { data, error } = await searchLocations(q);
    setLoadingB(false);

    if (error) {
      setErrorB(error);
      setLocB(null);
    } else if (data.length === 0) {
      setErrorB(`No coordinates found matching "${q}".`);
      setLocB(null);
    } else {
      setCandidatesB(data);
      const chosen = data[0];
      setLocB(chosen);
      loadTelemetryFor('B', chosen.lat, chosen.lng, chosen.countryCode, chosen.country);
    }
  }, [queryB]);

  // Pre-load quick demonstration pairs
  const handleLoadPair = (nameA: string, nameB: string) => {
    setQueryA(nameA);
    setQueryB(nameB);
    handleSearchA(nameA);
    handleSearchB(nameB);
  };

  const categories = [
    { id: 'all', name: 'All Indicators' },
    { id: 'climate', name: 'Weather & Climate' },
    { id: 'environment', name: 'Air Quality & Environment' },
    { id: 'water', name: 'Water & Hydrology' },
    { id: 'seismic', name: 'Geology & Seismology' },
    { id: 'economy', name: 'Economy & Development' },
    { id: 'energy', name: 'Solar & Renewable Energy' },
    { id: 'agriculture', name: 'Agriculture & Soil' },
    { id: 'unintegrated', name: 'Pending Integration Domains' },
  ];

  // Helper to compute numeric delta
  const computeNumericDelta = (
    valA: number | undefined | null,
    valB: number | undefined | null,
    unit: string,
    higherIsBetter: boolean | null = null
  ): { text: string; type: 'neutral' | 'a_higher' | 'b_higher' | 'incomparable' } => {
    if (valA === undefined || valA === null || valB === undefined || valB === null) {
      return { text: 'Incomparable (missing data for one or both locations)', type: 'incomparable' };
    }
    const diff = valA - valB;
    if (Math.abs(diff) < 0.001) {
      return { text: `Identical (${valA} ${unit})`, type: 'neutral' };
    }
    const absDiff = Math.abs(diff).toFixed(1);
    if (diff > 0) {
      return {
        text: `+${absDiff} ${unit} (Loc A higher)`,
        type: higherIsBetter === true ? 'a_higher' : higherIsBetter === false ? 'b_higher' : 'neutral',
      };
    } else {
      return {
        text: `-${absDiff} ${unit} (Loc B higher)`,
        type: higherIsBetter === true ? 'b_higher' : higherIsBetter === false ? 'a_higher' : 'neutral',
      };
    }
  };

  // Structured Comparison Matrix
  const comparisonRows: ComparisonRow[] = [
    // 1. Climate & Weather
    {
      id: 'temp',
      category: 'climate',
      name: 'Surface Air Temperature (2m)',
      unit: '°C',
      classification: 'provider_reported_current',
      source: 'Open-Meteo Weather API',
      valA: weatherA ? weatherA.current.temperature.toFixed(1) : null,
      valB: weatherB ? weatherB.current.temperature.toFixed(1) : null,
      deltaText: computeNumericDelta(weatherA?.current.temperature, weatherB?.current.temperature, '°C').text,
      deltaType: computeNumericDelta(weatherA?.current.temperature, weatherB?.current.temperature, '°C').type,
      note: 'Analyzed surface air temperature via Open-Meteo NWP model.',
    },
    {
      id: 'apparent_temp',
      category: 'climate',
      name: 'Apparent "Feels Like" Temperature',
      unit: '°C',
      classification: 'model_analysis',
      source: 'Open-Meteo Weather API',
      valA: weatherA ? weatherA.current.apparentTemperature.toFixed(1) : null,
      valB: weatherB ? weatherB.current.apparentTemperature.toFixed(1) : null,
      deltaText: computeNumericDelta(weatherA?.current.apparentTemperature, weatherB?.current.apparentTemperature, '°C').text,
      deltaType: computeNumericDelta(weatherA?.current.apparentTemperature, weatherB?.current.apparentTemperature, '°C').type,
    },
    {
      id: 'humidity',
      category: 'climate',
      name: 'Relative Humidity',
      unit: '%',
      classification: 'provider_reported_current',
      source: 'Open-Meteo Weather API',
      valA: weatherA ? weatherA.current.relativeHumidity : null,
      valB: weatherB ? weatherB.current.relativeHumidity : null,
      deltaText: computeNumericDelta(weatherA?.current.relativeHumidity, weatherB?.current.relativeHumidity, '%').text,
      deltaType: computeNumericDelta(weatherA?.current.relativeHumidity, weatherB?.current.relativeHumidity, '%').type,
    },
    {
      id: 'wind_speed',
      category: 'climate',
      name: 'Wind Speed (10m)',
      unit: 'km/h',
      classification: 'model_analysis',
      source: 'Open-Meteo Weather API',
      valA: weatherA ? weatherA.current.windSpeed.toFixed(1) : null,
      valB: weatherB ? weatherB.current.windSpeed.toFixed(1) : null,
      deltaText: computeNumericDelta(weatherA?.current.windSpeed, weatherB?.current.windSpeed, 'km/h').text,
      deltaType: computeNumericDelta(weatherA?.current.windSpeed, weatherB?.current.windSpeed, 'km/h').type,
    },
    {
      id: 'precip',
      category: 'climate',
      name: 'Current Hour Precipitation',
      unit: 'mm',
      classification: 'provider_reported_current',
      source: 'Open-Meteo Weather API',
      valA: weatherA ? weatherA.current.precipitation : null,
      valB: weatherB ? weatherB.current.precipitation : null,
      deltaText: computeNumericDelta(weatherA?.current.precipitation, weatherB?.current.precipitation, 'mm').text,
      deltaType: computeNumericDelta(weatherA?.current.precipitation, weatherB?.current.precipitation, 'mm').type,
    },

    // 2. Air Quality & Environment
    {
      id: 'us_aqi',
      category: 'environment',
      name: 'Air Quality Index (US AQI)',
      unit: 'AQI index',
      classification: 'model_analysis',
      source: 'Copernicus CAMS via Open-Meteo',
      valA: aqA?.current.usAqi !== undefined ? aqA.current.usAqi : null,
      valB: aqB?.current.usAqi !== undefined ? aqB.current.usAqi : null,
      deltaText: computeNumericDelta(aqA?.current.usAqi, aqB?.current.usAqi, 'AQI', false).text,
      deltaType: computeNumericDelta(aqA?.current.usAqi, aqB?.current.usAqi, 'AQI', false).type,
      note: 'Lower AQI indicates cleaner air quality according to US EPA standard.',
    },
    {
      id: 'pm25',
      category: 'environment',
      name: 'Fine Particulate Matter (PM2.5)',
      unit: 'µg/m³',
      classification: 'model_analysis',
      source: 'Copernicus CAMS via Open-Meteo',
      valA: aqA?.current.pm2_5 !== undefined ? aqA.current.pm2_5.toFixed(1) : null,
      valB: aqB?.current.pm2_5 !== undefined ? aqB.current.pm2_5.toFixed(1) : null,
      deltaText: computeNumericDelta(aqA?.current.pm2_5, aqB?.current.pm2_5, 'µg/m³', false).text,
      deltaType: computeNumericDelta(aqA?.current.pm2_5, aqB?.current.pm2_5, 'µg/m³', false).type,
      note: 'WHO guideline recommends annual mean <= 5 µg/m³ and 24h mean <= 15 µg/m³.',
    },
    {
      id: 'pm10',
      category: 'environment',
      name: 'Coarse Particulate Matter (PM10)',
      unit: 'µg/m³',
      classification: 'model_analysis',
      source: 'Copernicus CAMS via Open-Meteo',
      valA: aqA?.current.pm10 !== undefined ? aqA.current.pm10.toFixed(1) : null,
      valB: aqB?.current.pm10 !== undefined ? aqB.current.pm10.toFixed(1) : null,
      deltaText: computeNumericDelta(aqA?.current.pm10, aqB?.current.pm10, 'µg/m³', false).text,
      deltaType: computeNumericDelta(aqA?.current.pm10, aqB?.current.pm10, 'µg/m³', false).type,
    },

    // 3. Water & Hydrology (Phase 5 Active Integration)
    {
      id: 'river_discharge',
      category: 'water',
      name: 'Daily River Discharge (GloFAS)',
      unit: 'm³/s',
      classification: 'model_analysis',
      source: 'Copernicus GloFAS Flood API',
      valA: hydroA?.riverDischarge !== undefined ? hydroA.riverDischarge.toFixed(2) : null,
      valB: hydroB?.riverDischarge !== undefined ? hydroB.riverDischarge.toFixed(2) : null,
      deltaText: computeNumericDelta(hydroA?.riverDischarge, hydroB?.riverDischarge, 'm³/s').text,
      deltaType: computeNumericDelta(hydroA?.riverDischarge, hydroB?.riverDischarge, 'm³/s').type,
      note: 'Daily river channel discharge modeled by Copernicus GloFAS (0.05° resolution).',
    },
    {
      id: 'soil_moisture_0_7',
      category: 'water',
      name: 'Surface Volumetric Soil Moisture (0–7cm)',
      unit: 'm³/m³',
      classification: 'model_analysis',
      source: 'ECMWF Land Model via Open-Meteo',
      valA: hydroA?.soilMoisture0to7cm !== undefined ? hydroA.soilMoisture0to7cm.toFixed(3) : null,
      valB: hydroB?.soilMoisture0to7cm !== undefined ? hydroB.soilMoisture0to7cm.toFixed(3) : null,
      deltaText: computeNumericDelta(hydroA?.soilMoisture0to7cm, hydroB?.soilMoisture0to7cm, 'm³/m³').text,
      deltaType: computeNumericDelta(hydroA?.soilMoisture0to7cm, hydroB?.soilMoisture0to7cm, 'm³/m³').type,
      note: 'Fraction of soil volume occupied by water in top 7cm of soil.',
    },
    {
      id: 'soil_moisture_7_28',
      category: 'water',
      name: 'Root-Zone Soil Moisture (7–28cm)',
      unit: 'm³/m³',
      classification: 'model_analysis',
      source: 'ECMWF Land Model via Open-Meteo',
      valA: hydroA?.soilMoisture7to28cm !== undefined ? hydroA.soilMoisture7to28cm.toFixed(3) : null,
      valB: hydroB?.soilMoisture7to28cm !== undefined ? hydroB.soilMoisture7to28cm.toFixed(3) : null,
      deltaText: computeNumericDelta(hydroA?.soilMoisture7to28cm, hydroB?.soilMoisture7to28cm, 'm³/m³').text,
      deltaType: computeNumericDelta(hydroA?.soilMoisture7to28cm, hydroB?.soilMoisture7to28cm, 'm³/m³').type,
    },
    {
      id: 'soil_moisture_28_100',
      category: 'water',
      name: 'Deep Subsoil Moisture (28–100cm)',
      unit: 'm³/m³',
      classification: 'model_analysis',
      source: 'ECMWF Land Model via Open-Meteo',
      valA: hydroA?.soilMoisture28to100cm !== undefined ? hydroA.soilMoisture28to100cm.toFixed(3) : null,
      valB: hydroB?.soilMoisture28to100cm !== undefined ? hydroB.soilMoisture28to100cm.toFixed(3) : null,
      deltaText: computeNumericDelta(hydroA?.soilMoisture28to100cm, hydroB?.soilMoisture28to100cm, 'm³/m³').text,
      deltaType: computeNumericDelta(hydroA?.soilMoisture28to100cm, hydroB?.soilMoisture28to100cm, 'm³/m³').type,
    },

    // 4. Geology & Seismology (Phase 5 Active Integration)
    {
      id: 'seismic_events',
      category: 'seismic',
      name: 'Recent Earthquakes (≥ M2.5, 90 Days)',
      unit: 'events (250km)',
      classification: 'provider_reported_current',
      source: 'USGS Earthquake Hazards Program',
      valA: seismicA ? seismicA.recentEventCount : null,
      valB: seismicB ? seismicB.recentEventCount : null,
      deltaText: computeNumericDelta(seismicA?.recentEventCount, seismicB?.recentEventCount, 'events', false).text,
      deltaType: computeNumericDelta(seismicA?.recentEventCount, seismicB?.recentEventCount, 'events', false).type,
      note: 'Seismometer-recorded physical earthquake events within 250 km radial distance.',
    },
    {
      id: 'peak_magnitude',
      category: 'seismic',
      name: 'Peak Recorded Seismic Magnitude',
      unit: 'Mw',
      classification: 'provider_reported_current',
      source: 'USGS Earthquake Hazards Program',
      valA: seismicA?.maxMagnitude !== undefined ? seismicA.maxMagnitude.toFixed(1) : (seismicA ? 'None' : null),
      valB: seismicB?.maxMagnitude !== undefined ? seismicB.maxMagnitude.toFixed(1) : (seismicB ? 'None' : null),
      deltaText: computeNumericDelta(seismicA?.maxMagnitude, seismicB?.maxMagnitude, 'Mw', false).text,
      deltaType: computeNumericDelta(seismicA?.maxMagnitude, seismicB?.maxMagnitude, 'Mw', false).type,
      note: 'Highest moment magnitude recorded within 250 km in the past 90 days.',
    },

    // 5. Economy & Development (Phase 5 Active Integration - National Scope)
    {
      id: 'gdp_per_capita',
      category: 'economy',
      name: 'National GDP Per Capita',
      unit: 'USD',
      classification: 'provider_reported_current',
      source: 'World Bank Open Data (National)',
      valA: wbA?.gdpPerCapita?.value !== null && wbA?.gdpPerCapita?.value !== undefined ? Math.round(wbA.gdpPerCapita.value) : null,
      valB: wbB?.gdpPerCapita?.value !== null && wbB?.gdpPerCapita?.value !== undefined ? Math.round(wbB.gdpPerCapita.value) : null,
      deltaText: computeNumericDelta(wbA?.gdpPerCapita?.value, wbB?.gdpPerCapita?.value, 'USD').text,
      deltaType: computeNumericDelta(wbA?.gdpPerCapita?.value, wbB?.gdpPerCapita?.value, 'USD').type,
      note: `National aggregate scope (${wbA?.countryName || 'Loc A'} vs ${wbB?.countryName || 'Loc B'}). City-level figures require municipal survey.`,
    },
    {
      id: 'inflation_rate',
      category: 'economy',
      name: 'Annual Inflation Rate (CPI)',
      unit: '%',
      classification: 'provider_reported_current',
      source: 'World Bank Open Data (National)',
      valA: wbA?.inflationRate?.value !== null && wbA?.inflationRate?.value !== undefined ? wbA.inflationRate.value.toFixed(1) : null,
      valB: wbB?.inflationRate?.value !== null && wbB?.inflationRate?.value !== undefined ? wbB.inflationRate.value.toFixed(1) : null,
      deltaText: computeNumericDelta(wbA?.inflationRate?.value, wbB?.inflationRate?.value, '%', false).text,
      deltaType: computeNumericDelta(wbA?.inflationRate?.value, wbB?.inflationRate?.value, '%', false).type,
      note: 'Annual consumer price index percentage change (national scope).',
    },
    {
      id: 'urbanization_rate',
      category: 'economy',
      name: 'Urban Population Share',
      unit: '%',
      classification: 'provider_reported_current',
      source: 'World Bank Open Data (National)',
      valA: wbA?.urbanPopulationPercent?.value !== null && wbA?.urbanPopulationPercent?.value !== undefined ? wbA.urbanPopulationPercent.value.toFixed(1) : null,
      valB: wbB?.urbanPopulationPercent?.value !== null && wbB?.urbanPopulationPercent?.value !== undefined ? wbB.urbanPopulationPercent.value.toFixed(1) : null,
      deltaText: computeNumericDelta(wbA?.urbanPopulationPercent?.value, wbB?.urbanPopulationPercent?.value, '%').text,
      deltaType: computeNumericDelta(wbA?.urbanPopulationPercent?.value, wbB?.urbanPopulationPercent?.value, '%').type,
      note: 'Percentage of total national population residing in urban agglomerations.',
    },
    {
      id: 'hospital_beds',
      category: 'economy',
      name: 'Hospital Beds Density',
      unit: 'per 1k pop',
      classification: 'provider_reported_current',
      source: 'World Bank / WHO (National)',
      valA: wbA?.hospitalBeds?.value !== null && wbA?.hospitalBeds?.value !== undefined ? wbA.hospitalBeds.value.toFixed(1) : null,
      valB: wbB?.hospitalBeds?.value !== null && wbB?.hospitalBeds?.value !== undefined ? wbB.hospitalBeds.value.toFixed(1) : null,
      deltaText: computeNumericDelta(wbA?.hospitalBeds?.value, wbB?.hospitalBeds?.value, 'beds/1k').text,
      deltaType: computeNumericDelta(wbA?.hospitalBeds?.value, wbB?.hospitalBeds?.value, 'beds/1k').type,
      note: 'Inpatient hospital bed capacity at national level. Municipal clinic routing is pending.',
    },
    {
      id: 'physicians_density',
      category: 'economy',
      name: 'Physicians Density',
      unit: 'per 1k pop',
      classification: 'provider_reported_current',
      source: 'World Bank / WHO (National)',
      valA: wbA?.physiciansPer1000?.value !== null && wbA?.physiciansPer1000?.value !== undefined ? wbA.physiciansPer1000.value.toFixed(2) : null,
      valB: wbB?.physiciansPer1000?.value !== null && wbB?.physiciansPer1000?.value !== undefined ? wbB.physiciansPer1000.value.toFixed(2) : null,
      deltaText: computeNumericDelta(wbA?.physiciansPer1000?.value, wbB?.physiciansPer1000?.value, 'physicians/1k').text,
      deltaType: computeNumericDelta(wbA?.physiciansPer1000?.value, wbB?.physiciansPer1000?.value, 'physicians/1k').type,
      note: 'Practicing generalist and specialist physicians per 1,000 residents (national scope).',
    },
    {
      id: 'labor_force',
      category: 'economy',
      name: 'Labor Force Participation Rate',
      unit: '% pop (15+)',
      classification: 'provider_reported_current',
      source: 'ILO / World Bank (National)',
      valA: wbA?.laborForceParticipation?.value !== null && wbA?.laborForceParticipation?.value !== undefined ? wbA.laborForceParticipation.value.toFixed(1) : null,
      valB: wbB?.laborForceParticipation?.value !== null && wbB?.laborForceParticipation?.value !== undefined ? wbB.laborForceParticipation.value.toFixed(1) : null,
      deltaText: computeNumericDelta(wbA?.laborForceParticipation?.value, wbB?.laborForceParticipation?.value, '%').text,
      deltaType: computeNumericDelta(wbA?.laborForceParticipation?.value, wbB?.laborForceParticipation?.value, '%').type,
    },
    {
      id: 'electricity_access',
      category: 'economy',
      name: 'Electrical Grid Access',
      unit: '% pop',
      classification: 'provider_reported_current',
      source: 'World Bank Open Data (National)',
      valA: wbA?.electricityAccess?.value !== null && wbA?.electricityAccess?.value !== undefined ? wbA.electricityAccess.value.toFixed(1) : null,
      valB: wbB?.electricityAccess?.value !== null && wbB?.electricityAccess?.value !== undefined ? wbB.electricityAccess.value.toFixed(1) : null,
      deltaText: computeNumericDelta(wbA?.electricityAccess?.value, wbB?.electricityAccess?.value, '%').text,
      deltaType: computeNumericDelta(wbA?.electricityAccess?.value, wbB?.electricityAccess?.value, '%').type,
    },
    {
      id: 'internet_users',
      category: 'economy',
      name: 'Internet Penetration',
      unit: '% pop',
      classification: 'provider_reported_current',
      source: 'World Bank / ITU (National)',
      valA: wbA?.internetUsersPercent?.value !== null && wbA?.internetUsersPercent?.value !== undefined ? wbA.internetUsersPercent.value.toFixed(1) : null,
      valB: wbB?.internetUsersPercent?.value !== null && wbB?.internetUsersPercent?.value !== undefined ? wbB.internetUsersPercent.value.toFixed(1) : null,
      deltaText: computeNumericDelta(wbA?.internetUsersPercent?.value, wbB?.internetUsersPercent?.value, '%').text,
      deltaType: computeNumericDelta(wbA?.internetUsersPercent?.value, wbB?.internetUsersPercent?.value, '%').type,
    },
    {
      id: 'fixed_broadband',
      category: 'economy',
      name: 'Fixed Broadband Subscriptions',
      unit: 'per 100 pop',
      classification: 'provider_reported_current',
      source: 'ITU / World Bank (National)',
      valA: wbA?.fixedBroadband?.value !== null && wbA?.fixedBroadband?.value !== undefined ? wbA.fixedBroadband.value.toFixed(2) : null,
      valB: wbB?.fixedBroadband?.value !== null && wbB?.fixedBroadband?.value !== undefined ? wbB.fixedBroadband.value.toFixed(2) : null,
      deltaText: computeNumericDelta(wbA?.fixedBroadband?.value, wbB?.fixedBroadband?.value, 'per 100').text,
      deltaType: computeNumericDelta(wbA?.fixedBroadband?.value, wbB?.fixedBroadband?.value, 'per 100').type,
    },
    {
      id: 'logistics_lpi',
      category: 'economy',
      name: 'Logistics Performance Index',
      unit: 'score (1-5)',
      classification: 'provider_reported_current',
      source: 'World Bank Trade & Transport (National)',
      valA: wbA?.logisticsPerformanceIndex?.value !== null && wbA?.logisticsPerformanceIndex?.value !== undefined ? wbA.logisticsPerformanceIndex.value.toFixed(2) : null,
      valB: wbB?.logisticsPerformanceIndex?.value !== null && wbB?.logisticsPerformanceIndex?.value !== undefined ? wbB.logisticsPerformanceIndex.value.toFixed(2) : null,
      deltaText: computeNumericDelta(wbA?.logisticsPerformanceIndex?.value, wbB?.logisticsPerformanceIndex?.value, 'score').text,
      deltaType: computeNumericDelta(wbA?.logisticsPerformanceIndex?.value, wbB?.logisticsPerformanceIndex?.value, 'score').type,
    },

    // 6. Energy & Solar
    {
      id: 'renewable_share',
      category: 'energy',
      name: 'National Renewable Energy Share',
      unit: '% final energy',
      classification: 'provider_reported_current',
      source: 'World Bank / IEA (National)',
      valA: wbA?.renewableEnergyShare?.value !== null && wbA?.renewableEnergyShare?.value !== undefined ? wbA.renewableEnergyShare.value.toFixed(1) : null,
      valB: wbB?.renewableEnergyShare?.value !== null && wbB?.renewableEnergyShare?.value !== undefined ? wbB.renewableEnergyShare.value.toFixed(1) : null,
      deltaText: computeNumericDelta(wbA?.renewableEnergyShare?.value, wbB?.renewableEnergyShare?.value, '%').text,
      deltaType: computeNumericDelta(wbA?.renewableEnergyShare?.value, wbB?.renewableEnergyShare?.value, '%').type,
      note: 'Percentage of total final energy consumption from renewable sources (national scope).',
    },
    {
      id: 'dni',
      category: 'energy',
      name: 'Direct Normal Solar Irradiance (DNI)',
      unit: 'W/m²',
      classification: 'model_analysis',
      source: 'Open-Meteo Solar Model',
      valA: weatherA?.current.directNormalIrradiance !== undefined ? weatherA.current.directNormalIrradiance.toFixed(0) : null,
      valB: weatherB?.current.directNormalIrradiance !== undefined ? weatherB.current.directNormalIrradiance.toFixed(0) : null,
      deltaText: computeNumericDelta(weatherA?.current.directNormalIrradiance, weatherB?.current.directNormalIrradiance, 'W/m²').text,
      deltaType: computeNumericDelta(weatherA?.current.directNormalIrradiance, weatherB?.current.directNormalIrradiance, 'W/m²').type,
      note: 'Direct beam irradiance perpendicular to incoming sunlight.',
    },
    {
      id: 'daily_radiation',
      category: 'energy',
      name: 'Forecast Daily Shortwave Solar Radiation',
      unit: 'MJ/m²',
      classification: 'forecast',
      source: 'Open-Meteo Solar Model',
      valA: weatherA?.daily[0]?.shortwaveRadiationSum !== undefined ? weatherA.daily[0].shortwaveRadiationSum.toFixed(2) : null,
      valB: weatherB?.daily[0]?.shortwaveRadiationSum !== undefined ? weatherB.daily[0].shortwaveRadiationSum.toFixed(2) : null,
      deltaText: computeNumericDelta(weatherA?.daily[0]?.shortwaveRadiationSum, weatherB?.daily[0]?.shortwaveRadiationSum, 'MJ/m²').text,
      deltaType: computeNumericDelta(weatherA?.daily[0]?.shortwaveRadiationSum, weatherB?.daily[0]?.shortwaveRadiationSum, 'MJ/m²').type,
    },

    // 7. Agriculture
    {
      id: 'et0',
      category: 'agriculture',
      name: 'Reference Crop Evapotranspiration (ET₀)',
      unit: 'mm/day',
      classification: 'model_analysis',
      source: 'FAO-56 Penman-Monteith (Open-Meteo)',
      valA: weatherA?.daily[0]?.et0Evapotranspiration !== undefined ? weatherA.daily[0].et0Evapotranspiration.toFixed(1) : null,
      valB: weatherB?.daily[0]?.et0Evapotranspiration !== undefined ? weatherB.daily[0].et0Evapotranspiration.toFixed(1) : null,
      deltaText: computeNumericDelta(weatherA?.daily[0]?.et0Evapotranspiration, weatherB?.daily[0]?.et0Evapotranspiration, 'mm/day').text,
      deltaType: computeNumericDelta(weatherA?.daily[0]?.et0Evapotranspiration, weatherB?.daily[0]?.et0Evapotranspiration, 'mm/day').type,
      note: 'Daily water loss from well-watered reference grass cover.',
    },

    // 8. Pending Staged Domains (Explicitly Unpopulated)
    {
      id: 'water_stress',
      category: 'unintegrated',
      name: 'Baseline Water Stress Ratio',
      unit: 'ratio',
      classification: 'unavailable',
      source: 'WRI Aqueduct 4.0',
      valA: null,
      valB: null,
      deltaText: 'Integration Pending (WRI sub-basin raster polygon API required)',
      deltaType: 'incomparable',
      note: 'Not evaluated as zero; explicitly unavailable to preserve analytical integrity.',
    },
    {
      id: 'grace_groundwater',
      category: 'unintegrated',
      name: 'Groundwater Storage Anomaly',
      unit: 'cm eq. water',
      classification: 'unavailable',
      source: 'NASA GRACE-FO',
      valA: null,
      valB: null,
      deltaText: 'Integration Pending (NASA Earthdata authenticated gravimetry required)',
      deltaType: 'incomparable',
    },
    {
      id: 'mineral_reserves',
      category: 'unintegrated',
      name: 'Critical Mineral Deposit Reserves',
      unit: 'metric tons',
      classification: 'unavailable',
      source: 'USGS MRDS',
      valA: null,
      valB: null,
      deltaText: 'Integration Pending (OGC WFS spatial vector layer required)',
      deltaType: 'incomparable',
    },
    {
      id: 'municipal_cpi',
      category: 'unintegrated',
      name: 'Sub-National Municipal Living Cost Index',
      unit: 'index',
      classification: 'unavailable',
      source: 'Municipal Census / Spatial Survey',
      valA: null,
      valB: null,
      deltaText: 'Integration Pending (Published only at national aggregate level)',
      deltaType: 'incomparable',
    },
    {
      id: 'road_density',
      category: 'unintegrated',
      name: 'Paved Road Network Density',
      unit: 'km/km²',
      classification: 'unavailable',
      source: 'OpenStreetMap Overpass',
      valA: null,
      valB: null,
      deltaText: 'Integration Pending (Overpass GIS vector pipeline required)',
      deltaType: 'incomparable',
    },
  ];

  const filteredRows = activeCategory === 'all'
    ? comparisonRows
    : comparisonRows.filter((r) => r.category === activeCategory);

  // Deterministic Factual Summary generator
  const generateComparativeSummary = () => {
    if (!locA || !locB || !weatherA || !weatherB) return null;

    const nameA = locA.name;
    const nameB = locB.name;
    const tempA = weatherA.current.temperature;
    const tempB = weatherB.current.temperature;
    const tempDiff = Math.abs(tempA - tempB).toFixed(1);
    const tempRelation = tempA > tempB ? 'warmer' : 'cooler';

    const aqiA = aqA?.current.usAqi;
    const aqiB = aqB?.current.usAqi;
    let aqiText = '';
    if (aqiA !== undefined && aqiB !== undefined) {
      const aqiDiff = Math.abs(aqiA - aqiB);
      const aqiRelation = aqiA < aqiB ? 'cleaner air' : 'higher particulate index';
      aqiText = ` Regarding atmospheric air quality, ${nameA} reports ${aqiA} US AQI (PM2.5: ${aqA?.current.pm2_5?.toFixed(1) || '—'} µg/m³) while ${nameB} reports ${aqiB} US AQI (PM2.5: ${aqB?.current.pm2_5?.toFixed(1) || '—'} µg/m³), indicating ${nameA} has ${aqiRelation} by ${aqiDiff} AQI points.`;
    }

    const dischA = hydroA?.riverDischarge;
    const dischB = hydroB?.riverDischarge;
    let hydroText = '';
    if (dischA !== undefined && dischB !== undefined) {
      hydroText = ` Copernicus GloFAS indicates daily river discharge of ${dischA.toFixed(2)} m³/s in ${nameA} vs. ${dischB.toFixed(2)} m³/s in ${nameB}.`;
    }

    const gdpA = wbA?.gdpPerCapita?.value;
    const gdpB = wbB?.gdpPerCapita?.value;
    let econText = '';
    if (gdpA && gdpB) {
      econText = ` At the national level, World Bank accounts indicate GDP per capita of $${Math.round(gdpA).toLocaleString()} (${wbA?.countryName || locA.country}) vs. $${Math.round(gdpB).toLocaleString()} (${wbB?.countryName || locB.country}).`;
    }

    return `At current observation times, reported surface temperature in ${nameA} is ${tempA.toFixed(1)}°C (${weatherA.current.weatherText}), which is ${tempDiff}°C ${tempRelation} than ${nameB} at ${tempB.toFixed(1)}°C (${weatherB.current.weatherText}).${aqiText}${hydroText}${econText} Note: Sub-basin water stress (WRI Aqueduct) and municipal cost-of-living indices remain unpopulated for both regions and are excluded from numerical ranking to preserve analytical integrity.`;
  };

  const comparativeSummary = generateComparativeSummary();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full mb-2">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Comparative Regional Benchmarking</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Compare Locations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Side-by-side empirical evaluation comparing geodetics, weather conditions, air quality, river discharge, seismic hazards, and national economic indicators across two verified locations.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 block text-center">
              AtlasIQ Comparison Engine
            </span>
          </div>
        </div>

        {/* Quick Example Pairs */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Quick Test Pairs:</span>
          <button
            onClick={() => handleLoadPair('Tokyo, Japan', 'Hyderabad, India')}
            className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-colors text-[11px]"
          >
            Tokyo, Japan vs Hyderabad, India
          </button>
          <button
            onClick={() => handleLoadPair('Valencia, Spain', 'Phoenix, Arizona')}
            className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-colors text-[11px]"
          >
            Valencia, Spain vs Phoenix, Arizona
          </button>
          <button
            onClick={() => handleLoadPair('Nairobi, Kenya', 'London, UK')}
            className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-colors text-[11px]"
          >
            Nairobi, Kenya vs London, UK
          </button>
        </div>
      </div>

      {/* Dual Search & Geocoding Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location A Selector */}
        <Card className="space-y-3 border-brand-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
              <h2 className="text-sm font-bold text-slate-900">Location Benchmark (A)</h2>
            </div>
            {locA ? (
              <Badge variant="brand" size="sm">Resolved</Badge>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Unselected</span>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchA();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={queryA}
                onChange={(e) => setQueryA(e.target.value)}
                placeholder="Search city A (e.g., Tokyo, Japan)..."
                className="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={loadingA}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center gap-1 shrink-0"
            >
              {loadingA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Resolve</span>
            </button>
          </form>

          {/* Multiple Candidates Selection for A */}
          {candidatesA.length > 1 && (
            <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Select candidate for A:</span>
              <div className="flex flex-wrap gap-1.5">
                {candidatesA.map((c) => (
                  <button
                    key={c.placeId}
                    onClick={() => {
                      setLocA(c);
                      loadTelemetryFor('A', c.lat, c.lng, c.countryCode, c.country);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                      locA?.placeId === c.placeId
                        ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.name} ({[c.state, c.country].filter(Boolean).join(', ') || `${c.lat.toFixed(2)}°, ${c.lng.toFixed(2)}`})
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorA && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{errorA}</span>
            </div>
          )}

          {/* Location A Profile Card */}
          {locA && (
            <div className="pt-2 text-xs space-y-1.5 border-t border-slate-100">
              <div className="font-bold text-slate-900 truncate" title={locA.displayName}>
                {locA.displayName}
              </div>
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Coordinates: {locA.lat.toFixed(4)}°, {locA.lng.toFixed(4)}°</span>
                <span>Elev: {weatherA?.elevation !== undefined ? `${weatherA.elevation}m` : '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 text-[11px]">Country: {wbA?.countryName || locA.country || '—'}</span>
                <StatusPill status="measured" customLabel="Nominatim Geocoded" />
              </div>
            </div>
          )}
        </Card>

        {/* Location B Selector */}
        <Card className="space-y-3 border-teal-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-sm font-bold text-slate-900">Location Comparative (B)</h2>
            </div>
            {locB ? (
              <Badge variant="teal" size="sm">Resolved</Badge>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Unselected</span>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchB();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={queryB}
                onChange={(e) => setQueryB(e.target.value)}
                placeholder="Search city B (e.g., Hyderabad, India)..."
                className="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={loadingB}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1 shrink-0"
            >
              {loadingB ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Resolve</span>
            </button>
          </form>

          {/* Multiple Candidates Selection for B */}
          {candidatesB.length > 1 && (
            <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Select candidate for B:</span>
              <div className="flex flex-wrap gap-1.5">
                {candidatesB.map((c) => (
                  <button
                    key={c.placeId}
                    onClick={() => {
                      setLocB(c);
                      loadTelemetryFor('B', c.lat, c.lng, c.countryCode, c.country);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                      locB?.placeId === c.placeId
                        ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.name} ({[c.state, c.country].filter(Boolean).join(', ') || `${c.lat.toFixed(2)}°, ${c.lng.toFixed(2)}`})
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorB && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{errorB}</span>
            </div>
          )}

          {/* Location B Profile Card */}
          {locB && (
            <div className="pt-2 text-xs space-y-1.5 border-t border-slate-100">
              <div className="font-bold text-slate-900 truncate" title={locB.displayName}>
                {locB.displayName}
              </div>
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Coordinates: {locB.lat.toFixed(4)}°, {locB.lng.toFixed(4)}°</span>
                <span>Elev: {weatherB?.elevation !== undefined ? `${weatherB.elevation}m` : '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 text-[11px]">Country: {wbB?.countryName || locB.country || '—'}</span>
                <StatusPill status="measured" customLabel="Nominatim Geocoded" />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Factual Comparative Summary Card */}
      {comparativeSummary && (
        <Card variant="subtle" className="border-teal-200/80 bg-teal-50/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-100/70 text-teal-800 shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  Factual Comparative Intelligence Summary
                </h3>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-800">
                  Deterministic Delta
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {comparativeSummary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Side-by-Side Comparative Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-0">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-brand-600" />
              <span>Cross-Domain Comparative Indicator Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct telemetry & model outputs compared only where compatible metrics exist.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-200/70 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-1/3">Indicator & Provenance</th>
                <th className="py-3 px-4 w-1/4 border-l border-slate-200">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0"></span>
                    <span className="text-slate-900 font-bold truncate">
                      {locA ? locA.name : 'Location A (Unset)'}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 w-1/4 border-l border-slate-200">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                    <span className="text-slate-900 font-bold truncate">
                      {locB ? locB.name : 'Location B (Unset)'}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 w-1/6 border-l border-slate-200 text-slate-700">
                  <span>Delta / Comparison</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Indicator Column */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{row.name}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="font-mono">Unit: {row.unit}</span>
                      <span>·</span>
                      <span className="truncate">Src: {row.source}</span>
                    </div>
                    {row.note && (
                      <div className="text-[10px] text-slate-400 mt-0.5 italic">{row.note}</div>
                    )}
                  </td>

                  {/* Location A Column */}
                  <td className="py-3 px-4 border-l border-slate-200">
                    {row.valA !== null ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 font-mono">
                          {row.valA} <span className="text-xs font-normal text-slate-500">{row.unit}</span>
                        </div>
                        <StatusPill status={row.classification} />
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-slate-300 font-mono text-sm font-bold">—</span>
                        <div>
                          <StatusPill status="unavailable" />
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Location B Column */}
                  <td className="py-3 px-4 border-l border-slate-200">
                    {row.valB !== null ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 font-mono">
                          {row.valB} <span className="text-xs font-normal text-slate-500">{row.unit}</span>
                        </div>
                        <StatusPill status={row.classification} />
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-slate-300 font-mono text-sm font-bold">—</span>
                        <div>
                          <StatusPill status="unavailable" />
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Delta / Comparison Column */}
                  <td className="py-3 px-4 border-l border-slate-200">
                    {row.deltaText ? (
                      <div
                        className={`text-xs font-medium ${
                          row.deltaType === 'incomparable'
                            ? 'text-slate-400 italic text-[11px]'
                            : 'text-slate-700 font-mono font-semibold'
                        }`}
                      >
                        {row.deltaText}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* When neither location is selected, display helpful empty state */}
      {!locA && !locB && (
        <EmptyState
          title="Search two locations above to generate comparative intelligence."
          description="Type any two places in the benchmark and comparative boxes, or click one of the quick test pairs above to run an instant cross-domain empirical evaluation."
        />
      )}
    </div>
  );
};
