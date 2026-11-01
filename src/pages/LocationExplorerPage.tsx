import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Layers,
  CloudSun,
  Droplets,
  Zap,
  Sprout,
  Leaf,
  Info,
  Calendar,
  Database,
} from 'lucide-react';
import { SearchInput } from '../components/common/SearchInput';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';
import { StatusPill } from '../components/common/StatusPill';
import { Badge } from '../components/common/Badge';

export const LocationExplorerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Location Explorer</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Target location coordinates, geospatial boundary telemetry, and cross-sector intelligence metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 font-medium">Integration status:</span>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              Prompt 2: Map & Weather
            </span>
          </div>
        </div>

        {/* Location search bar */}
        <SearchInput initialValue={query} autoNavigate={false} size="md" />
      </div>

      {/* Query notification if query was submitted */}
      {query && (
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Query target: <strong className="font-semibold">{query}</strong>. In Prompt 2, Open-Meteo & Nominatim geocoding will resolve coordinates and live sensor data for this location.
            </span>
          </div>
          <Badge variant="brand" size="sm">Awaiting Prompt 2</Badge>
        </div>
      )}

      {/* Map Container Area & Location Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map Container (Reserved for Leaflet in Prompt 2) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              Geospatial Map Canvas
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Map Component Target · 500px Height</span>
          </div>

          <div
            id="map-container-target"
            className="w-full h-[400px] sm:h-[480px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
          >
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            <div className="relative z-10 max-w-md flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-brand-600">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Leaflet & Tile Provider Container
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This container is reserved for the interactive Leaflet map, vector polygon overlays, and OpenStreetMap raster tiles to be wired in <strong>Prompt 2</strong>.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center">
                <Badge variant="default" size="sm">Lat/Lng Centering</Badge>
                <Badge variant="default" size="sm">Bounding Box Polygon</Badge>
                <Badge variant="default" size="sm">Choropleth Layers</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Location Metadata Summary Area */}
        <div className="space-y-4">
          <div className="text-xs text-slate-600 px-1 font-semibold text-slate-700">
            Location Profile & Parameters
          </div>

          <Card className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">Active Selection</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {query ? query : 'No Location Selected'}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusPill status="unavailable" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Coordinates:</span>
                <span className="font-mono text-slate-500 font-medium">—</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Administrative Region:</span>
                <span className="text-slate-500 font-medium">—</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Elevation:</span>
                <span className="text-slate-500 font-medium">—</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Climate Zone (Köppen):</span>
                <span className="text-slate-500 font-medium">—</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Hydrological Basin:</span>
                <span className="text-slate-500 font-medium">—</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-brand-600" />
                Data Source Index
              </div>
              <p className="leading-snug">
                Coordinates and elevation will be derived from USGS SRTM and Open-Meteo elevation endpoints.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Summary-Card Positions for Core Sectors */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Core Sector Intelligence Indicators
          </h2>
          <span className="text-xs text-slate-600">Awaiting location resolution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Climate & Weather"
            subtext="Mean Surface Temp"
            value={null}
            unit="°C"
            status="unavailable"
            icon={<CloudSun className="w-4 h-4" />}
            description="Mean surface air temperature averaged across annual climate baselines"
          />
          <MetricCard
            label="Water Resources"
            subtext="Baseline Water Stress"
            value={null}
            unit="ratio"
            status="unavailable"
            icon={<Droplets className="w-4 h-4" />}
            description="Ratio of total annual withdrawals to renewable water reserves"
          />
          <MetricCard
            label="Energy Potential"
            subtext="Solar PV Yield"
            value={null}
            unit="kWh/kWp"
            status="unavailable"
            icon={<Zap className="w-4 h-4" />}
            description="Expected annual electricity generation per installed kW peak"
          />
          <MetricCard
            label="Agriculture"
            subtext="Soil Organic Carbon"
            value={null}
            unit="g/kg"
            status="unavailable"
            icon={<Sprout className="w-4 h-4" />}
            description="Topsoil organic matter content determining fertility and water retention"
          />
          <MetricCard
            label="Environment"
            subtext="Air Quality (PM2.5)"
            value={null}
            unit="µg/m³"
            status="unavailable"
            icon={<Leaf className="w-4 h-4" />}
            description="Concentration of fine atmospheric particulate matter"
          />
        </div>
      </div>

      {/* Empty State Banner (Honest empty state as requested) */}
      <EmptyState
        title="Search for a location to explore its available intelligence."
        description="AtlasIQ requires an active target region or coordinate to query meteorological records, aquifer levels, and renewable yields."
        promptNote="Prompt 2 will implement live Nominatim geocoding and the Open-Meteo historical/forecast client."
      />

      {/* Data Source & Reporting Period Section */}
      <Card variant="subtle" className="text-xs text-slate-600 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Reporting Periods & Source Governance</span>
          </div>
          <span className="text-[11px] text-slate-600 font-mono">Telemetry Standard ISO-19115</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600">
          <div>
            <strong className="text-slate-800 block mb-1">Climatic Baseline</strong>
            30-year climatological normal (1991–2020) via Copernicus Climate Change Service & NOAA NCEI.
          </div>
          <div>
            <strong className="text-slate-800 block mb-1">Hydrological Telemetry</strong>
            WRI Aqueduct 4.0 water risk framework and NASA GRACE-FO terrestrial water storage tracking.
          </div>
          <div>
            <strong className="text-slate-800 block mb-1">Renewables & Energy</strong>
            Global Solar Atlas & Global Wind Atlas validated models provided by World Bank Group & DTU.
          </div>
        </div>
      </Card>
    </div>
  );
};
