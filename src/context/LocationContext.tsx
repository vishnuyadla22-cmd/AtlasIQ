import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GeocodeResult,
  WeatherData,
  AirQualityData,
  WorldBankCountryData,
  HydrologyData,
  SeismicData,
  LocationResolutionState,
} from '../types';
import { searchLocations } from '../services/geocoding';
import { fetchWeatherData } from '../services/weather';
import { fetchAirQualityData } from '../services/airQuality';
import { fetchWorldBankData } from '../services/worldBank';
import { fetchHydrologyData } from '../services/hydrology';
import { fetchSeismicData } from '../services/seismic';

const ACTIVE_LOCATION_STORAGE_KEY = 'atlasiq_active_location_v1';

export interface LocationContextType {
  activeLocation: GeocodeResult | null;
  resolutionState: LocationResolutionState;
  weatherData: WeatherData | null;
  airQualityData: AirQualityData | null;
  worldBankData: WorldBankCountryData | null;
  hydrologyData: HydrologyData | null;
  seismicData: SeismicData | null;
  isLoadingTelemetry: boolean;
  telemetryError: string | null;

  // Search & geocode state
  searchQuery: string;
  isGeocoding: boolean;
  geocodeError: string | null;
  candidates: GeocodeResult[];

  // Actions
  searchLocation: (queryText: string) => Promise<{ success: boolean; error?: string; candidates?: GeocodeResult[] }>;
  selectCandidate: (candidate: GeocodeResult) => void;
  setActiveLocation: (loc: GeocodeResult | null) => void;
  clearActiveLocation: () => void;
  refreshTelemetry: () => Promise<void>;
  setSearchQuery: (query: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial location from localStorage if available
  const [activeLocation, setActiveLocationState] = useState<GeocodeResult | null>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_LOCATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GeocodeResult;
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number' && parsed.name) {
          return parsed;
        }
      }
    } catch {
      // Storage unavailable or corrupted; start with null
    }
    return null;
  });

  const [resolutionState, setResolutionState] = useState<LocationResolutionState>(() =>
    activeLocation ? 'resolved' : 'idle'
  );

  const [searchQuery, setSearchQuery] = useState<string>(() => activeLocation?.name || '');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<GeocodeResult[]>([]);

  // Telemetry state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [worldBankData, setWorldBankData] = useState<WorldBankCountryData | null>(null);
  const [hydrologyData, setHydrologyData] = useState<HydrologyData | null>(null);
  const [seismicData, setSeismicData] = useState<SeismicData | null>(null);

  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // Concurrency tracking & AbortControllers
  const searchSeqRef = useRef<number>(0);
  const geocodeAbortRef = useRef<AbortController | null>(null);
  const weatherAbortRef = useRef<AbortController | null>(null);
  const aqAbortRef = useRef<AbortController | null>(null);
  const wbAbortRef = useRef<AbortController | null>(null);
  const hydroAbortRef = useRef<AbortController | null>(null);
  const seismicAbortRef = useRef<AbortController | null>(null);

  // Load telemetry for a set of resolved coordinates
  const loadLocationTelemetry = useCallback(async (loc: GeocodeResult) => {
    weatherAbortRef.current?.abort();
    aqAbortRef.current?.abort();
    wbAbortRef.current?.abort();
    hydroAbortRef.current?.abort();
    seismicAbortRef.current?.abort();

    const wController = new AbortController();
    const aqController = new AbortController();
    const wbController = new AbortController();
    const hydroController = new AbortController();
    const seismicController = new AbortController();

    weatherAbortRef.current = wController;
    aqAbortRef.current = aqController;
    wbAbortRef.current = wbController;
    hydroAbortRef.current = hydroController;
    seismicAbortRef.current = seismicController;

    setIsLoadingTelemetry(true);
    setTelemetryError(null);

    try {
      const [wRes, aqRes, wbRes, hydroRes, seismicRes] = await Promise.all([
        fetchWeatherData(loc.lat, loc.lng, wController.signal),
        fetchAirQualityData(loc.lat, loc.lng, aqController.signal),
        fetchWorldBankData(loc.countryCode, loc.country, wbController.signal),
        fetchHydrologyData(loc.lat, loc.lng, hydroController.signal),
        fetchSeismicData(loc.lat, loc.lng, seismicController.signal),
      ]);

      setIsLoadingTelemetry(false);

      if (wRes.error) {
        setTelemetryError(wRes.error);
      } else {
        setWeatherData(wRes.data);
      }

      setAirQualityData(aqRes.data || null);
      setWorldBankData(wbRes.data || null);
      setHydrologyData(hydroRes.data || null);
      setSeismicData(seismicRes.data || null);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      setIsLoadingTelemetry(false);
      setTelemetryError('Failed to retrieve location telemetry.');
    }
  }, []);

  // Update active location state and synchronize with browser storage
  const setActiveLocation = useCallback(
    (loc: GeocodeResult | null) => {
      setActiveLocationState(loc);
      if (loc) {
        try {
          localStorage.setItem(ACTIVE_LOCATION_STORAGE_KEY, JSON.stringify(loc));
        } catch {
          // Ignore localStorage errors
        }
        setSearchQuery(loc.name);
        setResolutionState('resolved');
        setGeocodeError(null);
        loadLocationTelemetry(loc);
      } else {
        try {
          localStorage.removeItem(ACTIVE_LOCATION_STORAGE_KEY);
        } catch {
          // Ignore localStorage errors
        }
        setResolutionState('idle');
        setWeatherData(null);
        setAirQualityData(null);
        setWorldBankData(null);
        setHydrologyData(null);
        setSeismicData(null);
      }
    },
    [loadLocationTelemetry]
  );

  // Clear active location completely
  const clearActiveLocation = useCallback(() => {
    setActiveLocation(null);
    setCandidates([]);
    setSearchQuery('');
    setGeocodeError(null);
  }, [setActiveLocation]);

  // Execute a geocode search
  const searchLocation = useCallback(
    async (
      queryText: string
    ): Promise<{ success: boolean; error?: string; candidates?: GeocodeResult[] }> => {
      const trimmed = queryText.trim();
      if (!trimmed) {
        return { success: false, error: 'Please enter a search query.' };
      }

      const seq = ++searchSeqRef.current;
      setSearchQuery(trimmed);
      setGeocodeError(null);
      setResolutionState('resolving');
      setIsGeocoding(true);
      setCandidates([]);

      geocodeAbortRef.current?.abort();
      const controller = new AbortController();
      geocodeAbortRef.current = controller;

      try {
        const { data, error } = await searchLocations(trimmed, controller.signal);

        // Ignore response if a newer search was initiated
        if (seq !== searchSeqRef.current) {
          return { success: false, error: 'Cancelled by subsequent query.' };
        }

        setIsGeocoding(false);

        if (error) {
          setGeocodeError(error);
          setResolutionState('error');
          // PRESERVE previous activeLocation: do not overwrite with null or dummy data
          return { success: false, error };
        }

        if (!data || data.length === 0) {
          const msg = `No geographic coordinates found for "${trimmed}".`;
          setGeocodeError(msg);
          setResolutionState('error');
          // PRESERVE previous activeLocation
          return { success: false, error: msg };
        }

        setCandidates(data);
        const primary = data[0];
        setActiveLocation(primary);
        return { success: true, candidates: data };
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return { success: false, error: 'Search aborted.' };
        }
        if (seq === searchSeqRef.current) {
          setIsGeocoding(false);
          const msg = 'Geocoding service unavailable.';
          setGeocodeError(msg);
          setResolutionState('error');
          return { success: false, error: msg };
        }
        return { success: false };
      }
    },
    [setActiveLocation]
  );

  // Select a specific candidate from multiple search results
  const selectCandidate = useCallback(
    (candidate: GeocodeResult) => {
      setCandidates([]);
      setActiveLocation(candidate);
    },
    [setActiveLocation]
  );

  // Manual refresh of telemetry for current active location
  const refreshTelemetry = useCallback(async () => {
    if (activeLocation) {
      await loadLocationTelemetry(activeLocation);
    }
  }, [activeLocation, loadLocationTelemetry]);

  // Initial mount: if active location was restored from storage, fetch its telemetry
  useEffect(() => {
    if (activeLocation && !weatherData && !isLoadingTelemetry) {
      loadLocationTelemetry(activeLocation);
    }
    return () => {
      geocodeAbortRef.current?.abort();
      weatherAbortRef.current?.abort();
      aqAbortRef.current?.abort();
      wbAbortRef.current?.abort();
      hydroAbortRef.current?.abort();
      seismicAbortRef.current?.abort();
    };
  }, []); // Run once on mount

  return (
    <LocationContext.Provider
      value={{
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
        setActiveLocation,
        clearActiveLocation,
        refreshTelemetry,
        setSearchQuery,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
