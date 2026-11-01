import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Layers,
  CloudSun,
  Droplets,
  Zap,
  Sprout,
  Leaf,
  Calendar,
  Database,
  Wind,
  Droplet,
  CloudRain,
  Compass,
  CheckCircle2,
  AlertCircle,
  Activity,
  FileText,
} from 'lucide-react';
import { SearchInput } from '../components/common/SearchInput';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';
import { StatusPill } from '../components/common/StatusPill';
import { Badge } from '../components/common/Badge';
import { LocationMap } from '../components/map/LocationMap';
import { buildDomainIntelligence } from '../services/domains';
import { GeocodeResult } from '../types';
import { useLocationContext } from '../context/LocationContext';

export const LocationExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const {
    activeLocation,
    resolutionState,
    weatherData,
    airQualityData,
    worldBankData,
    hydrologyData,
    seismicData,
    isLoadingTelemetry,
    telemetryError,
    searchQuery,
    isGeocoding,
    geocodeError,
    candidates,
    searchLocation,
    selectCandidate,
  } = useLocationContext();

  // Selected location aliases to activeLocation from context
  const selectedLocation = activeLocation;
  const isWeatherLoading = isLoadingTelemetry;
  const isAqLoading = isLoadingTelemetry;
  const weatherError = telemetryError;

  const [currentQuery, setCurrentQuery] = useState(queryParam || searchQuery || '');

  // Synchronize input text with active location or query param
  useEffect(() => {
    if (activeLocation) {
      setCurrentQuery(activeLocation.name);
      if (searchParams.get('q') !== activeLocation.name) {
        setSearchParams({ q: activeLocation.name }, { replace: true });
      }
    }
  }, [activeLocation, setSearchParams]);

  // Main geocode search handler calling shared context
  const executeSearch = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed) return;

      setCurrentQuery(trimmed);
      setSearchParams({ q: trimmed });
      await searchLocation(trimmed);
    },
    [searchLocation, setSearchParams]
  );

  // When user clicks a candidate from multiple matches
  const handleSelectCandidate = (candidate: GeocodeResult) => {
    selectCandidate(candidate);
    setCurrentQuery(candidate.name);
    setSearchParams({ q: candidate.name });
  };

  // Run search on mount if URL contains ?q= and differs from currently active location
  useEffect(() => {
    if (queryParam && (!activeLocation || activeLocation.name.toLowerCase() !== queryParam.toLowerCase())) {
      executeSearch(queryParam);
    }
  }, [queryParam]);

  // Format observation timestamp
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    } catch {
      return timeStr;
    }
  };

  // Build uniform 9-domain intelligence model
  const domainIntelligence = buildDomainIntelligence(
    selectedLocation,
    weatherData,
    airQualityData,
    worldBankData,
    hydrologyData,
    seismicData
  );

  // Derive factual summary string for the location
  const factualSummary = selectedLocation && weatherData
    ? `For ${selectedLocation.name} (${selectedLocation.country || ''}), Open-Meteo reports current weather conditions of ${weatherData.current.weatherText} at ${weatherData.current.temperature.toFixed(1)}°C (feels like ${weatherData.current.apparentTemperature.toFixed(1)}°C) with ${weatherData.current.relativeHumidity}% humidity and ${weatherData.current.windSpeed.toFixed(1)} km/h wind.${airQualityData?.current.usAqi !== undefined ? ` Ambient air quality is indexed at ${airQualityData.current.usAqi} US AQI (PM2.5: ${airQualityData.current.pm2_5?.toFixed(1) || '—'} µg/m³).` : ''}`
    : null;

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Location Explorer</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Live geographic boundary resolution, interactive spatial map, and multi-sector planetary intelligence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Status:</span>
            {resolutionState === 'idle' && (
              <StatusPill status="unavailable" customLabel="Awaiting Location Input" />
            )}
            {resolutionState === 'query_entered' && (
              <StatusPill status="awaiting_geocoding" customLabel="Awaiting Geocoding" />
            )}
            {resolutionState === 'resolving' && (
              <StatusPill status="geocoding" customLabel="Resolving Coordinates..." />
            )}
            {resolutionState === 'resolved' && (
              <StatusPill status="measured" customLabel="Coordinates Resolved" />
            )}
            {resolutionState === 'error' && (
              <StatusPill status="unavailable" customLabel="Location Unresolved" />
            )}
          </div>
        </div>

        {/* Search input with direct callback */}
        <SearchInput
          initialValue={currentQuery}
          autoNavigate={false}
          onSearch={executeSearch}
          isLoading={isGeocoding}
          size="md"
        />

        {/* Candidate Selection Bar if multiple results returned */}
        {candidates.length > 1 && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-600" />
              <span>Multiple matches found. Select target location:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidates.map((cand) => {
                const isSelected = selectedLocation?.placeId === cand.placeId;
                return (
                  <button
                    key={cand.placeId}
                    onClick={() => handleSelectCandidate(cand)}
                    className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-50 border-brand-300 text-brand-800 font-medium shadow-2xs ring-1 ring-brand-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-semibold">{cand.name}</span>
                    <span className="text-slate-500 text-[11px] ml-1">
                      ({[cand.state, cand.country].filter(Boolean).join(', ') || `${cand.lat.toFixed(2)}°, ${cand.lng.toFixed(2)}°`})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error notification banner if geocoding fails */}
        {geocodeError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{geocodeError}</span>
          </div>
        )}
      </div>

      {/* Map & Location Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real Interactive Leaflet Map */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              Interactive Geospatial Map Canvas
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              OpenStreetMap Tile Layer · Leaflet v1.9
            </span>
          </div>

          <LocationMap
            selectedLocation={selectedLocation}
            isLoading={isGeocoding || isWeatherLoading || isAqLoading}
            error={null}
            height="460px"
          />
        </div>

        {/* Right 1 Col: Location Metadata Profile */}
        <div className="space-y-4">
          <div className="text-xs text-slate-600 px-1 font-semibold text-slate-700 flex items-center justify-between">
            <span>Location Profile & Geodetics</span>
            {selectedLocation && (
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Coordinates Resolved
              </span>
            )}
          </div>

          <Card className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Resolved Geography
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5 truncate" title={selectedLocation?.displayName}>
                {selectedLocation ? selectedLocation.displayName.split(',')[0] : 'No Location Selected'}
              </div>
              <div className="text-xs text-slate-500 truncate mt-0.5">
                {selectedLocation?.displayName || 'Search and select a place above'}
              </div>
              <div className="mt-2">
                {selectedLocation ? (
                  <StatusPill status="measured" customLabel="Geocoded: OSM Nominatim" />
                ) : resolutionState === 'query_entered' ? (
                  <StatusPill status="awaiting_geocoding" />
                ) : (
                  <StatusPill status="unavailable" />
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Latitude:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {selectedLocation ? `${selectedLocation.lat.toFixed(5)}°` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Longitude:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {selectedLocation ? `${selectedLocation.lng.toFixed(5)}°` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Country:</span>
                <span className="text-slate-800 font-medium">
                  {selectedLocation?.country || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">State / Region:</span>
                <span className="text-slate-800 font-medium">
                  {selectedLocation?.state || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Elevation:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {weatherData?.elevation !== undefined ? `${weatherData.elevation} m` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Timezone:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {weatherData?.timezone || '—'}
                </span>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-brand-600" />
                <span>Geodetic Provenance</span>
              </div>
              <p className="leading-snug">
                Coordinates resolved via OpenStreetMap Nominatim. Atmospheric conditions provided by Open-Meteo numerical prediction models.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Factual Intelligence Summary (Rendered when telemetry is loaded) */}
      {factualSummary && (
        <Card variant="subtle" className="border-brand-200/60 bg-brand-50/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-100/70 text-brand-700 shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
                  Location Intelligence Summary
                </h3>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-brand-200 text-brand-700">
                  Deterministic Baseline
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {factualSummary}
              </p>
              <div className="text-[10px] text-slate-500 pt-1">
                Note: Ground sensor measurements have not been established; atmospheric figures represent NWP model analysis (blended DWD ICON / ECMWF IFS). Unintegrated sector domains (water stress, sub-national GDP, infrastructure density) remain unpopulated.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Current Weather Conditions & Short-Term Forecast Panel */}
      {selectedLocation && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-brand-600" />
                <span>Current Weather Conditions</span>
              </h2>
              <p className="text-xs text-slate-500">
                Model-analyzed atmospheric state and 5-day numerical weather forecast via Open-Meteo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" size="sm">Open-Meteo Model</Badge>
              <StatusPill status="provider_reported_current" customLabel="Reported Conditions" />
            </div>
          </div>

          {weatherError ? (
            <Card className="p-4 bg-amber-50 border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{weatherError}</span>
            </Card>
          ) : isWeatherLoading ? (
            <Card className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Retrieving Open-Meteo meteorological models...</p>
            </Card>
          ) : weatherData ? (
            <div className="space-y-4">
              {/* Current Weather Conditions Banner Card */}
              <Card className="bg-gradient-to-r from-white via-slate-50 to-brand-50/30 border-slate-200/90">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
                  {/* Primary Temp & Condition */}
                  <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                      Reported Surface Temperature
                    </span>
                    <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                        {weatherData.current.temperature.toFixed(1)}°C
                      </span>
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        (Feels like {weatherData.current.apparentTemperature.toFixed(1)}°C)
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-brand-700 flex items-center gap-1 flex-wrap">
                      <span>{weatherData.current.weatherText}</span>
                      <span>·</span>
                      <span className="font-normal text-slate-500">
                        {weatherData.current.isDay ? 'Daytime' : 'Night'}
                      </span>
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Droplet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800 whitespace-nowrap">
                      {weatherData.current.relativeHumidity}%
                    </div>
                    <div className="text-[10px] text-slate-400">Relative 2m</div>
                  </div>

                  {/* Precipitation */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <CloudRain className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Precipitation</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800 whitespace-nowrap">
                      {weatherData.current.precipitation} mm
                    </div>
                    <div className="text-[10px] text-slate-400">Current hour</div>
                  </div>

                  {/* Wind Speed */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Wind Speed</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800 whitespace-nowrap">
                      {weatherData.current.windSpeed} km/h
                    </div>
                    <div className="text-[10px] text-slate-400">{weatherData.current.windDirection}° heading</div>
                  </div>

                  {/* Data Source & Provenance */}
                  <div className="space-y-0.5 border-l border-slate-200/80 pl-3 min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Source Model</span>
                    <span className="text-xs font-semibold text-slate-800 block truncate" title="Open-Meteo NWP">Open-Meteo NWP</span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {formatTime(weatherData.current.time)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* 5-Day Numerical Model Forecast Strip */}
              {weatherData.daily && weatherData.daily.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-semibold text-slate-700">5-Day Numerical Model Forecast (Future Output)</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <StatusPill status="forecast" customLabel="Numerical Forecast" showIcon={false} />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {weatherData.daily.map((day, idx) => {
                      const dayDate = new Date(day.date);
                      const dayName =
                        idx === 0
                          ? 'Today'
                          : dayDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

                      return (
                        <Card key={idx} padding="sm" className="space-y-2 text-center bg-white">
                          <div className="text-xs font-bold text-slate-800">{dayName}</div>
                          <div className="text-xs text-brand-600 font-medium truncate" title={day.weatherText}>
                            {day.weatherText}
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="font-bold text-slate-900">{day.tempMax.toFixed(0)}°</span>
                            <span className="text-slate-400 font-medium">{day.tempMin.toFixed(0)}°</span>
                          </div>
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 px-1">
                            <span>Precip: {day.precipitationSum} mm</span>
                            <span>{day.windSpeedMax.toFixed(0)} km/h</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Core Sector Intelligence Indicator Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Core Sector Intelligence Indicators
            </h2>
            <p className="text-xs text-slate-500">
              {selectedLocation
                ? `Active location: ${selectedLocation.name}. Real weather, air quality, solar, and agrometeorology models active; remaining domains show explicit pending states.`
                : 'Awaiting location selection to load telemetry.'}
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            {selectedLocation ? '4 Sector Models Active · 5 Domains Awaiting' : '0 of 9 Domains Active'}
          </span>
        </div>

        {/* Responsive grid preventing cramped layouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. Climate & Weather (Open-Meteo Current Condition) */}
          <MetricCard
            label="Climate & Weather"
            subtext={weatherData ? weatherData.current.weatherText : 'Surface Air Temp'}
            value={weatherData ? weatherData.current.temperature.toFixed(1) : null}
            unit="°C"
            status={weatherData ? 'provider_reported_current' : selectedLocation ? 'awaiting_geocoding' : 'unavailable'}
            statusLabel={weatherData ? 'Reported Condition' : undefined}
            source={weatherData ? 'Open-Meteo Weather API' : undefined}
            timestamp={weatherData ? formatTime(weatherData.current.time) : undefined}
            icon={<CloudSun className="w-4 h-4 text-brand-600" />}
            geographicScope="Point Coordinate (0.1° NWP Grid)"
            description="Hourly surface air temperature analyzed via blended numerical weather prediction models (ECMWF/ICON/GFS)"
          />

          {/* 2. Environment & Air Quality (Copernicus CAMS via Open-Meteo) */}
          <MetricCard
            label="Environment & Air Quality"
            subtext={airQualityData?.current.usAqi !== undefined ? `US AQI: ${airQualityData.current.usAqi}` : 'Fine Particulate Matter'}
            value={airQualityData?.current.pm2_5 !== undefined ? airQualityData.current.pm2_5.toFixed(1) : null}
            unit="µg/m³ PM2.5"
            status={airQualityData ? 'model_analysis' : selectedLocation ? 'awaiting_geocoding' : 'unavailable'}
            statusLabel={airQualityData ? 'Model Analysis' : undefined}
            source={airQualityData ? 'Copernicus CAMS' : undefined}
            timestamp={airQualityData ? formatTime(airQualityData.current.time) : undefined}
            icon={<Leaf className="w-4 h-4 text-teal-600" />}
            geographicScope="Copernicus CAMS (0.1° Grid)"
            description="Atmospheric PM2.5 particulate concentration modeled via Copernicus Atmosphere Monitoring Service (CAMS)"
          />

          {/* 3. Energy Potential (Direct Solar Irradiance via Open-Meteo) */}
          <MetricCard
            label="Energy Potential"
            subtext={weatherData?.current.directNormalIrradiance !== undefined ? 'Solar DNI Beam' : 'Solar Irradiance'}
            value={weatherData?.current.directNormalIrradiance !== undefined ? weatherData.current.directNormalIrradiance.toFixed(0) : null}
            unit="W/m²"
            status={weatherData?.current.directNormalIrradiance !== undefined ? 'model_analysis' : selectedLocation ? 'awaiting_geocoding' : 'unavailable'}
            statusLabel={weatherData?.current.directNormalIrradiance !== undefined ? 'Model Analysis' : undefined}
            source={weatherData ? 'Open-Meteo Solar Model' : undefined}
            timestamp={weatherData ? formatTime(weatherData.current.time) : undefined}
            icon={<Zap className="w-4 h-4 text-amber-500" />}
            geographicScope="Point Coordinate (0.1° Grid)"
            description="Direct Normal Irradiance (DNI) modeled from atmospheric radiative transfer equations"
          />

          {/* 4. Agriculture & Soil (FAO-56 Evapotranspiration via Open-Meteo) */}
          <MetricCard
            label="Agriculture & Soil"
            subtext={weatherData?.daily[0]?.et0Evapotranspiration !== undefined ? 'FAO-56 ET₀ Water Demand' : 'Crop Evapotranspiration'}
            value={weatherData?.daily[0]?.et0Evapotranspiration !== undefined ? weatherData.daily[0].et0Evapotranspiration.toFixed(1) : null}
            unit="mm/day"
            status={weatherData?.daily[0]?.et0Evapotranspiration !== undefined ? 'model_analysis' : selectedLocation ? 'awaiting_geocoding' : 'unavailable'}
            statusLabel={weatherData?.daily[0]?.et0Evapotranspiration !== undefined ? 'Model Analysis' : undefined}
            source={weatherData ? 'FAO-56 Penman-Monteith' : undefined}
            timestamp={weatherData?.daily[0]?.date}
            icon={<Sprout className="w-4 h-4 text-emerald-500" />}
            geographicScope="Local Terrain (FAO-56)"
            description="Reference evapotranspiration (ET₀) for agricultural crop water balance estimation"
          />

          {/* 5. Water Resources (Copernicus GloFAS Daily River Discharge) */}
          <MetricCard
            label="Water Resources"
            subtext={hydrologyData?.riverDischarge !== undefined ? 'GloFAS River Discharge' : 'River Discharge'}
            value={hydrologyData?.riverDischarge !== undefined ? hydrologyData.riverDischarge.toFixed(2) : null}
            unit="m³/s"
            status={hydrologyData?.riverDischarge !== undefined ? 'model_analysis' : selectedLocation ? 'awaiting_geocoding' : 'unavailable'}
            statusLabel={hydrologyData?.riverDischarge !== undefined ? 'Model Analysis' : undefined}
            source="Copernicus GloFAS via Open-Meteo"
            icon={<Droplets className="w-4 h-4 text-blue-500" />}
            geographicScope="Sub-Basin River Grid (0.05°)"
            description="Daily river channel discharge modeled by the Copernicus Global Flood Awareness System (GloFAS)"
          />
        </div>
      </div>

      {/* Expanded Domain Intelligence Metadata Overview */}
      {selectedLocation && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>Full Domain Intelligence Provenance</span>
            </h2>
            <span className="text-xs text-slate-500">AtlasIQ 9-Domain Baseline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {domainIntelligence.map((domain) => (
              <Card key={domain.domainId} className="space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{domain.domainTitle}</span>
                    <Badge
                      variant={domain.status === 'available' ? 'emerald' : domain.status === 'partial' ? 'teal' : 'default'}
                      size="sm"
                    >
                      {domain.status === 'available' ? 'Active' : domain.status === 'partial' ? 'Partial' : 'Pending API'}
                    </Badge>
                  </div>
                  <ul className="text-xs space-y-1 divide-y divide-slate-100">
                    {domain.metrics.slice(0, 3).map((m) => (
                      <li key={m.id} className="pt-1 flex items-center justify-between">
                        <span className="text-slate-600 truncate mr-2" title={m.name}>{m.name}</span>
                        {m.value !== null ? (
                          <span className="font-semibold text-slate-900 shrink-0 font-mono text-[11px]">
                            {m.value} {m.unit}
                          </span>
                        ) : (
                          <span className="text-slate-400 shrink-0 text-[11px] italic">Unavailable</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-snug">
                  {domain.limitations}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no location is selected */}
      {!selectedLocation && (
        <EmptyState
          title="Search for a location to explore its available intelligence."
          description="Enter any city, region, or country (e.g., 'Hyderabad, India' or 'Valencia, Spain') to view its interactive map coordinates, weather conditions, and air quality telemetry."
          actionText="Focus Search Bar"
          onAction={() => {
            const input = document.querySelector('input[aria-label="Location search"]') as HTMLInputElement;
            input?.focus();
          }}
          promptNote="Interactive Leaflet mapping, Nominatim geocoding, and Open-Meteo weather/air quality models are active."
        />
      )}

      {/* Data Source & Reporting Period Section */}
      <Card variant="subtle" className="text-xs text-slate-600 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Data Provenance & Scientific Methodology</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Transparency Standard ISO-19115</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600">
          <div>
            <strong className="text-slate-800 block mb-1">Geocoding & Boundaries</strong>
            OpenStreetMap Nominatim search engine providing reverse geocoding, boundary polygons, and geographic coordinates under ODbL.
          </div>
          <div>
            <strong className="text-slate-800 block mb-1">Weather & Atmosphere</strong>
            Open-Meteo Numerical Weather Prediction (NWP) model outputs (ECMWF, DWD ICON, GFS) and Copernicus CAMS air quality models. Not unassimilated ground sensor networks.
          </div>
          <div>
            <strong className="text-slate-800 block mb-1">Pending Sector Models</strong>
            WRI Aqueduct 4.0 (water risk), Global Solar Atlas (grid PV capacity), and ISRIC SoilGrids (soil carbon) remain unpopulated pending authenticated GIS raster access.
          </div>
        </div>
      </Card>
    </div>
  );
};
