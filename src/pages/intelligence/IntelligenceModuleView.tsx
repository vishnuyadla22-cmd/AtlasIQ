import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Database,
  ArrowLeft,
  CloudSun,
  Sprout,
  Droplets,
  Zap,
  Leaf,
  Mountain,
  TrendingUp,
  GraduationCap,
  Truck,
  BarChart3,
  MapPin,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { MetricCard } from '../../components/common/MetricCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { StatusPill } from '../../components/common/StatusPill';
import { SearchInput } from '../../components/common/SearchInput';
import { DomainVisualization } from '../../components/common/DomainVisualization';
import { INTELLIGENCE_MODULES } from '../../data/modules';
import { ModuleId, GeocodeResult } from '../../types';
import { useLocationContext } from '../../context/LocationContext';
import { buildDomainIntelligence } from '../../services/domains';

interface IntelligenceModuleViewProps {
  moduleIdOverride?: ModuleId;
}

export const IntelligenceModuleView: React.FC<IntelligenceModuleViewProps> = ({
  moduleIdOverride,
}) => {
  const { moduleId: routeModuleId } = useParams<{ moduleId: string }>();
  const activeModuleId = (moduleIdOverride || routeModuleId) as ModuleId;
  const currentModule = INTELLIGENCE_MODULES.find((m) => m.id === activeModuleId) || INTELLIGENCE_MODULES[0];

  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q');

  const {
    activeLocation,
    weatherData,
    airQualityData,
    worldBankData,
    hydrologyData,
    seismicData,
    isLoadingTelemetry,
    telemetryError,
    candidates,
    isGeocoding,
    geocodeError,
    searchLocation,
    selectCandidate,
  } = useLocationContext();

  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Synchronize URL query parameter if present and differing from active location
  useEffect(() => {
    if (urlQuery && (!activeLocation || activeLocation.name.toLowerCase() !== urlQuery.toLowerCase())) {
      searchLocation(urlQuery);
    }
  }, [urlQuery]);

  // Keep URL search param synced to active location
  useEffect(() => {
    if (activeLocation && searchParams.get('q') !== activeLocation.name) {
      setSearchParams({ q: activeLocation.name }, { replace: true });
    }
  }, [activeLocation, setSearchParams]);

  // Build the 9-domain intelligence dataset for current active location
  const allDomainData = buildDomainIntelligence(
    activeLocation,
    weatherData,
    airQualityData,
    worldBankData,
    hydrologyData,
    seismicData
  );
  const activeDomainData = allDomainData.find((d) => d.domainId === currentModule.id);

  const getModuleIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-brand-600' };
    switch (iconName) {
      case 'CloudSun':
        return <CloudSun {...props} />;
      case 'Sprout':
        return <Sprout {...props} />;
      case 'Droplets':
        return <Droplets {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Leaf':
        return <Leaf {...props} />;
      case 'Mountain':
        return <Mountain {...props} />;
      case 'TrendingUp':
        return <TrendingUp {...props} />;
      case 'GraduationCap':
        return <GraduationCap {...props} />;
      case 'Truck':
      default:
        return <Truck {...props} />;
    }
  };

  const handleSearchSubmit = async (query: string) => {
    const res = await searchLocation(query);
    if (res.success) {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectCandidate = (candidate: GeocodeResult) => {
    selectCandidate(candidate);
    setIsSearchingLocation(false);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to={activeLocation ? `/explorer?q=${encodeURIComponent(activeLocation.name)}` : '/explorer'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Location Explorer</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">Domain Module</Badge>
          <span className="text-[11px] text-slate-600 font-mono">ID: {currentModule.id}</span>
        </div>
      </div>

      {/* Module Title Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              {getModuleIcon(currentModule.iconName)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {currentModule.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                {currentModule.description}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="shrink-0 flex items-center gap-2">
            <Button
              size="sm"
              variant={isSearchingLocation ? 'primary' : 'outline'}
              icon={<Search className="w-3.5 h-3.5" />}
              onClick={() => setIsSearchingLocation((prev) => !prev)}
            >
              {isSearchingLocation ? 'Close Search' : activeLocation ? 'Change Location' : 'Select Location'}
            </Button>
            {activeLocation && (
              <Link to={`/explorer?q=${encodeURIComponent(activeLocation.name)}`}>
                <Button size="sm" variant="outline" icon={<Compass className="w-3.5 h-3.5" />}>
                  View on Map
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Inline Search Bar (when toggled or no location selected) */}
        {(isSearchingLocation || !activeLocation) && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="text-xs font-semibold text-slate-700">
              {activeLocation ? 'Search a different location to analyze across all domains:' : 'Search for a target location to evaluate this domain:'}
            </div>
            <SearchInput
              size="md"
              autoNavigate={false}
              onSearch={handleSearchSubmit}
              isLoading={isGeocoding}
              placeholder="Enter city, state, or coordinates (e.g. Hyderabad, India)..."
            />

            {/* Candidates selector if multiple results returned */}
            {candidates.length > 1 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-brand-600" />
                  <span>Multiple matches found. Select target location:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidates.map((cand) => (
                    <button
                      key={cand.placeId}
                      onClick={() => handleSelectCandidate(cand)}
                      className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
                        activeLocation?.placeId === cand.placeId
                          ? 'bg-brand-50 border-brand-300 text-brand-800 font-medium shadow-2xs ring-1 ring-brand-200'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-semibold">{cand.name}</span>
                      <span className="text-slate-500 text-[11px] ml-1">
                        ({[cand.state, cand.country].filter(Boolean).join(', ') || `${cand.lat.toFixed(2)}°, ${cand.lng.toFixed(2)}°`})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Geocode error banner */}
            {geocodeError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{geocodeError}</span>
              </div>
            )}
          </div>
        )}

        {/* Location Context Banner */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <span className="font-semibold text-slate-700 shrink-0">Active Location Context:</span>
            {activeLocation ? (
              <div className="flex items-center gap-2 truncate">
                <span className="inline-flex items-center gap-1 font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 truncate">
                  <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                  <span className="truncate">{activeLocation.displayName}</span>
                </span>
                <span className="text-slate-500 font-mono text-[11px] shrink-0">
                  ({activeLocation.lat.toFixed(4)}°, {activeLocation.lng.toFixed(4)}°)
                </span>
              </div>
            ) : (
              <span className="text-slate-500 italic">None selected (Global baseline view)</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500 shrink-0">
            {activeLocation ? (
              isLoadingTelemetry ? (
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                  <span>Querying Telemetry...</span>
                </span>
              ) : (
                <StatusPill status="measured" customLabel="Active Across All Domains" />
              )
            ) : (
              <StatusPill status="unavailable" customLabel="Awaiting Location" />
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Error Banner */}
      {telemetryError && activeLocation && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Telemetry Notice: {telemetryError}</span>
        </div>
      )}

      {/* Domain Status Alert Banner for unintegrated / pending domains */}
      {activeDomainData?.status === 'unavailable' && (
        <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200/90 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Data Integration Pending — Technical Dataset Requirements</span>
            </div>
            <StatusPill status="unavailable" customLabel="Integration Pending (Phase 5 Target)" />
          </div>

          <p className="text-xs text-amber-900/90 leading-relaxed max-w-4xl">
            AtlasIQ strictly enforces empirical data integrity. The analytical indicators for{' '}
            <strong>{currentModule.title}</strong> require spatial raster datasets or authenticated endpoints that are
            not yet integrated with the client interface. Indicators are explicitly preserved in an{' '}
            <em>Integration Pending</em> state; no zeroes, regional averages, or synthetic estimations are substituted.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
            {activeDomainData.metrics.map((m) => (
              <div key={m.id} className="p-3 bg-white/90 border border-amber-200/80 rounded-lg space-y-1.5 shadow-2xs">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span className="truncate">{m.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({m.unit})</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-medium text-slate-600">Authoritative Provider:</span> {m.source}
                </div>
                <div className="text-[11px] text-amber-950 bg-amber-100/70 p-1.5 rounded border border-amber-300/60 leading-snug">
                  <span className="font-semibold text-amber-900">Missing Dependency: </span>
                  <span>{m.unavailableReason || 'Spatial layer query service'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relevant Indicators Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            {currentModule.shortTitle} Indicators & Analytical Metrics
          </h2>
          <span className="text-xs text-slate-600">
            {activeLocation
              ? `Calculated for ${activeLocation.name}`
              : 'Select a location to query live telemetry'}
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeDomainData && activeDomainData.metrics.length > 0 ? (
            activeDomainData.metrics.map((metric) => (
              <MetricCard
                key={metric.id}
                label={metric.name}
                subtext={metric.qualityNotes || metric.source}
                value={metric.value}
                unit={metric.unit}
                status={metric.classification}
                description={metric.unavailableReason ? `Unavailable: ${metric.unavailableReason}` : metric.qualityNotes || metric.source}
                source={metric.source}
                geographicScope={metric.geographicScope}
                timestamp={metric.observationTime || metric.retrievedAt}
              />
            ))
          ) : (
            currentModule.sampleIndicators.map((ind, idx) => (
              <MetricCard
                key={idx}
                label={ind.name}
                subtext={ind.description}
                value={null}
                unit={ind.unit}
                status={ind.status}
                description={ind.description}
              />
            ))
          )}
        </div>
      </div>

      {/* Visualization Canvas Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <span>{currentModule.shortTitle} Telemetry & Comparative Analytics</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            Powered by Recharts & Open Telemetry
          </span>
        </div>

        <DomainVisualization
          moduleId={currentModule.id}
          activeLocation={activeLocation}
          weatherData={weatherData}
          airQualityData={airQualityData}
          worldBankData={worldBankData}
          hydrologyData={hydrologyData}
          seismicData={seismicData}
          isLoading={isLoadingTelemetry}
        />
      </div>

      {/* Empty State Card if no location is selected */}
      {!activeLocation && (
        <EmptyState
          title={`Search for a location to evaluate ${currentModule.shortTitle.toLowerCase()} intelligence.`}
          description={`Location-specific metrics for ${currentModule.title} require spatial boundary definition.`}
          actionText="Open Location Explorer"
          actionLink="/explorer"
          promptNote="Open-Meteo weather and Copernicus CAMS air quality models are connected. Selecting a location in any domain persists across all 9 domains."
        />
      )}

      {/* Telemetry Provenance & Reporting Methodology */}
      <Card variant="subtle" className="text-xs text-slate-600 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Database className="w-4 h-4 text-brand-600" />
            <span>Telemetry Provenance & Reporting Methodology</span>
          </div>
          <span className="text-[11px] text-slate-600 font-mono">Quality Standard ISO-14044</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong className="text-slate-800 block mb-1">Authoritative Data Providers</strong>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {currentModule.plannedDataSources.map((ds, i) => (
                <li key={i}>{ds}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong className="text-slate-800 block mb-1">Temporal Baseline & Refresh Cadence</strong>
            <p className="text-slate-600 leading-relaxed">
              {currentModule.reportingPeriod}. When queried, raw records undergo spatial interpolation and quality assurance checks before indicator calculation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
