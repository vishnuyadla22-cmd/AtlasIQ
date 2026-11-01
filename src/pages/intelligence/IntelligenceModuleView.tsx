import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Compass,
  Database,
  Layers,
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
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { MetricCard } from '../../components/common/MetricCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { INTELLIGENCE_MODULES } from '../../data/modules';
import { ModuleId } from '../../types';

interface IntelligenceModuleViewProps {
  moduleIdOverride?: ModuleId;
}

export const IntelligenceModuleView: React.FC<IntelligenceModuleViewProps> = ({
  moduleIdOverride,
}) => {
  const { moduleId: routeModuleId } = useParams<{ moduleId: string }>();
  const activeModuleId = (moduleIdOverride || routeModuleId) as ModuleId;

  const currentModule = INTELLIGENCE_MODULES.find((m) => m.id === activeModuleId) || INTELLIGENCE_MODULES[0];

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

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/explorer"
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

          <div className="shrink-0 flex items-center gap-2">
            <Link to="/explorer">
              <Button size="sm" variant="outline" icon={<Compass className="w-3.5 h-3.5" />}>
                Select Location
              </Button>
            </Link>
          </div>
        </div>

        {/* Location Context Banner */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-700">Active Location Context:</span>
            <span className="text-slate-500 italic">None selected (Global baseline view)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Planned Indicators:</span>
            <span className="font-semibold text-slate-800">{currentModule.indicatorCount} metrics</span>
          </div>
        </div>
      </div>

      {/* Relevant Indicators Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Key Indicators & Analytical Metrics
          </h2>
          <span className="text-xs text-slate-600">Awaiting location resolution in Prompt 2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentModule.sampleIndicators.map((ind, idx) => (
            <MetricCard
              key={idx}
              label={ind.name}
              subtext={ind.description}
              value={null}
              unit={ind.unit}
              status={ind.status}
              description={ind.description}
            />
          ))}
        </div>
      </div>

      {/* Visualization Canvas Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            Time-Series & Spatial Visualizations
          </span>
          <span className="text-slate-500 font-mono text-[11px]">Recharts & Vector Choropleths Target</span>
        </div>

        <div className="w-full h-64 sm:h-72 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Visualization Module Standby
          </h3>
          <p className="text-xs text-slate-600 max-w-md leading-relaxed">
            Time-series trend charts and regional distribution histograms for <strong>{currentModule.shortTitle}</strong> will render here once live telemetry is integrated in Prompt 2.
          </p>
          <div className="pt-2 text-[11px] text-slate-600 font-mono">
            Status: Engine ready · No fabricated measurements rendered
          </div>
        </div>
      </div>

      {/* Empty State Card */}
      <EmptyState
        title={`Search for a location to evaluate ${currentModule.shortTitle.toLowerCase()} intelligence.`}
        description={`Location-specific metrics for ${currentModule.title} require spatial boundary definition.`}
        actionText="Open Location Explorer"
        actionLink="/explorer"
        promptNote="Prompt 2 connects live open APIs (Open-Meteo, WRI Aqueduct, World Bank, OSM)."
      />

      {/* Source and Reporting Period Information */}
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
