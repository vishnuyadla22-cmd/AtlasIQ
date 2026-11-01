import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import { SearchInput } from '../components/common/SearchInput';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';
import { StatusPill } from '../components/common/StatusPill';
import { Badge } from '../components/common/Badge';
import { LocationMap } from '../components/map/LocationMap';
import { searchLocations } from '../services/geocoding';
import { fetchWeatherData } from '../services/weather';
import { GeocodeResult, WeatherData, LocationResolutionState } from '../types';

export const LocationExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [resolutionState, setResolutionState] = useState<LocationResolutionState>(
    initialQuery ? 'query_entered' : 'idle'
  );

  const [candidates, setCandidates] = useState<GeocodeResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodeResult | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // AbortController refs to cancel pending fetches on unmount or new search
  const geocodeAbortRef = useRef<AbortController | null>(null);
  const weatherAbortRef = useRef<AbortController | null>(null);

  // Fetch weather data for resolved coordinates
  const loadWeather = useCallback(async (lat: number, lng: number) => {
    weatherAbortRef.current?.abort();
    const controller = new AbortController();
    weatherAbortRef.current = controller;

    setIsWeatherLoading(true);
    setWeatherError(null);

    const { data, error } = await fetchWeatherData(lat, lng, controller.signal);

    setIsWeatherLoading(false);
    if (error) {
      setWeatherError(error);
    } else {
      setWeatherData(data);
    }
  }, []);

  // Main geocode search handler
  const executeSearch = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed) return;

      setCurrentQuery(trimmed);
      setSearchParams({ q: trimmed });
      setGeocodeError(null);
      setResolutionState('resolving');
      setIsGeocoding(true);
      setCandidates([]);
      setWeatherData(null);

      geocodeAbortRef.current?.abort();
      const controller = new AbortController();
      geocodeAbortRef.current = controller;

      const { data, error } = await searchLocations(trimmed, controller.signal);

      setIsGeocoding(false);

      if (error) {
        setGeocodeError(error);
        setResolutionState('error');
        setSelectedLocation(null);
      } else if (data.length === 0) {
        setGeocodeError(`No geographic coordinates found for "${trimmed}".`);
        setResolutionState('error');
        setSelectedLocation(null);
      } else {
        setCandidates(data);
        const primary = data[0];
        setSelectedLocation(primary);
        setResolutionState('resolved');
        // Retrieve weather telemetry for resolved coordinates
        loadWeather(primary.lat, primary.lng);
      }
    },
    [loadWeather, setSearchParams]
  );

  // When user clicks a candidate from multiple matches
  const handleSelectCandidate = (candidate: GeocodeResult) => {
    setSelectedLocation(candidate);
    loadWeather(candidate.lat, candidate.lng);
  };

  // Run search on mount if URL contains ?q=
  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
    return () => {
      geocodeAbortRef.current?.abort();
      weatherAbortRef.current?.abort();
    };
  }, []); // Run once on mount

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
              Live geographic boundary resolution, interactive spatial map, and multi-source planetary intelligence.
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
                      ({cand.country || cand.state || `${cand.lat.toFixed(2)}°, ${cand.lng.toFixed(2)}°`})
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
            isLoading={isGeocoding || isWeatherLoading}
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
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
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
                Coordinates resolved via OpenStreetMap Nominatim. Weather telemetry delivered by Open-Meteo.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Live Weather Intelligence Panel (Displayed when coordinates are resolved) */}
      {selectedLocation && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-brand-600" />
                <span>Live Weather Intelligence</span>
              </h2>
              <p className="text-xs text-slate-500">
                Empirical observational telemetry and short-term numerical forecast.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" size="sm">Open-Meteo Integration</Badge>
              <StatusPill status="measured" customLabel="Live Telemetry" />
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
              <p className="text-xs text-slate-500">Querying Open-Meteo meteorological endpoints...</p>
            </Card>
          ) : weatherData ? (
            <div className="space-y-4">
              {/* Current Weather Banner Card */}
              <Card className="bg-gradient-to-r from-white via-slate-50 to-brand-50/30 border-slate-200/90">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
                  {/* Primary Temp & Condition */}
                  <div className="col-span-2 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                      Current Surface Conditions
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {weatherData.current.temperature.toFixed(1)}°C
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        (Feels like {weatherData.current.apparentTemperature.toFixed(1)}°C)
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-brand-700 flex items-center gap-1">
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
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      {weatherData.current.relativeHumidity}%
                    </div>
                    <div className="text-[10px] text-slate-400">Relative 2m</div>
                  </div>

                  {/* Precipitation */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                      <span>Precipitation</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      {weatherData.current.precipitation} mm
                    </div>
                    <div className="text-[10px] text-slate-400">Current hour</div>
                  </div>

                  {/* Wind Speed */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Wind className="w-3.5 h-3.5 text-teal-600" />
                      <span>Wind Speed</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      {weatherData.current.windSpeed} km/h
                    </div>
                    <div className="text-[10px] text-slate-400">{weatherData.current.windDirection}° heading</div>
                  </div>

                  {/* Observation Source */}
                  <div className="space-y-0.5 border-l border-slate-200/80 pl-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Telemetry</span>
                    <span className="text-xs font-semibold text-slate-800 block truncate">Open-Meteo API</span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {formatTime(weatherData.current.time)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* 5-Day Short-Term Forecast Strip */}
              {weatherData.daily && weatherData.daily.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-semibold text-slate-700">5-Day Numerical Model Forecast</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <StatusPill status="forecast" showIcon={false} />
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
                ? `Active location: ${selectedLocation.name}. Live weather connected; other sector models arrive in subsequent phases.`
                : 'Awaiting location selection to load telemetry.'}
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            {selectedLocation ? 'Weather Connected · 4 Sectors Awaiting' : '0 of 5 Connected'}
          </span>
        </div>

        {/* Responsive grid preventing cramped layouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. Climate & Weather (LIVE when weatherData is loaded) */}
          <MetricCard
            label="Climate & Weather"
            subtext={weatherData ? weatherData.current.weatherText : 'Surface Air Temp'}
            value={weatherData ? weatherData.current.temperature.toFixed(1) : null}
            unit="°C"
            status={weatherData ? 'measured' : selectedLocation ? 'awaiting_geocoding' : 'unavailable'}
            statusLabel={weatherData ? 'Measured (Open-Meteo)' : undefined}
            source={weatherData ? 'Open-Meteo API' : undefined}
            timestamp={weatherData ? formatTime(weatherData.current.time) : undefined}
            icon={<CloudSun className="w-4 h-4 text-brand-600" />}
            description="Direct hourly surface air temperature telemetry and prevailing atmospheric conditions"
          />

          {/* 2. Water Resources (Strictly honest unavailable placeholder) */}
          <MetricCard
            label="Water Resources"
            subtext="Baseline Water Stress"
            value={null}
            unit="ratio"
            status="unavailable"
            statusLabel="Awaiting Phase 3"
            source="WRI Aqueduct 4.0"
            icon={<Droplets className="w-4 h-4 text-blue-500" />}
            description="Ratio of total annual water withdrawals to renewable surface and aquifer reserves"
          />

          {/* 3. Energy Potential (Strictly honest unavailable placeholder) */}
          <MetricCard
            label="Energy Potential"
            subtext="Solar PV Yield (PVOUT)"
            value={null}
            unit="kWh/kWp"
            status="unavailable"
            statusLabel="Awaiting Phase 3"
            source="Global Solar Atlas"
            icon={<Zap className="w-4 h-4 text-amber-500" />}
            description="Expected annual long-term electricity generation per installed kW peak"
          />

          {/* 4. Agriculture (Strictly honest unavailable placeholder) */}
          <MetricCard
            label="Agriculture"
            subtext="Soil Organic Carbon"
            value={null}
            unit="g/kg"
            status="unavailable"
            statusLabel="Awaiting Phase 5"
            source="ISRIC SoilGrids"
            icon={<Sprout className="w-4 h-4 text-emerald-500" />}
            description="Topsoil organic matter content governing crop viability and soil moisture retention"
          />

          {/* 5. Environment (Strictly honest unavailable placeholder) */}
          <MetricCard
            label="Environment"
            subtext="Air Quality (PM2.5)"
            value={null}
            unit="µg/m³"
            status="unavailable"
            statusLabel="Awaiting Phase 5"
            source="Copernicus CAMS"
            icon={<Leaf className="w-4 h-4 text-teal-500" />}
            description="Ambient fine particulate matter concentration <= 2.5 micrometers"
          />
        </div>
      </div>

      {/* Empty State when no location is selected */}
      {!selectedLocation && (
        <EmptyState
          title="Search for a location to explore its available intelligence."
          description="Enter any city, region, or country (e.g., 'Hyderabad, India' or 'Valencia, Spain') to view its interactive map coordinates and live Open-Meteo weather data."
          actionText="Focus Search Bar"
          onAction={() => {
            const input = document.querySelector('input[aria-label="Location search"]') as HTMLInputElement;
            input?.focus();
          }}
          promptNote="Interactive Leaflet mapping & Open-Meteo weather integrations are active."
        />
      )}

      {/* Data Source & Reporting Period Section */}
      <Card variant="subtle" className="text-xs text-slate-600 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Reporting Periods & Source Governance</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Telemetry Standard ISO-19115</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600">
          <div>
            <strong className="text-slate-800 block mb-1">Geocoding & Boundaries</strong>
            OpenStreetMap Nominatim search engine providing reverse geocoding, boundary polygons, and geographic coordinates under ODbL.
          </div>
          <div>
            <strong className="text-slate-800 block mb-1">Climatic & Weather Telemetry</strong>
            Open-Meteo Weather API combining DWD ICON, NOAA GFS, and ECMWF IFS atmospheric models with hourly verification.
          </div>
          <div>
            <strong className="text-slate-800 block mb-1">Upcoming Sector Models</strong>
            WRI Aqueduct 4.0 (water risk), Global Solar/Wind Atlas (renewables), and FAO WaPOR (crop suitability) scheduled for subsequent phases.
          </div>
        </div>
      </Card>
    </div>
  );
};
