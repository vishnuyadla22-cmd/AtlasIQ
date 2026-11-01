import React from 'react';
import { Link } from 'react-router-dom';
import {
  CloudSun,
  Sprout,
  Droplets,
  Zap,
  Leaf,
  Mountain,
  TrendingUp,
  GraduationCap,
  Truck,
  Scale,
  GitCompare,
  Sliders,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SearchInput } from '../components/common/SearchInput';
import { CategoryCard } from '../components/common/CategoryCard';
import { Card } from '../components/common/Card';
import { DataTransparencyBanner } from '../components/common/DataTransparencyBanner';
import { INTELLIGENCE_MODULES } from '../data/modules';

export const OverviewPage: React.FC = () => {
  // Map module iconName to Lucide components
  const getIcon = (name: string) => {
    switch (name) {
      case 'CloudSun':
        return <CloudSun className="w-5 h-5" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5" />;
      case 'Mountain':
        return <Mountain className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'Truck':
      default:
        return <Truck className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-4 sm:pt-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
          <span>AI Location Intelligence Platform</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Every Place. <span className="text-brand-600">Deeper Intelligence.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          AtlasIQ synthesizes multi-sector geospatial indicators—from climate resilience and groundwater stress to renewable energy potential, economic health, and infrastructure access.
        </p>

        {/* Prominent Search Input */}
        <div className="pt-4">
          <SearchInput size="lg" />
        </div>
      </section>

      {/* Intelligence Categories Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Intelligence Domains
            </h2>
            <p className="text-xs text-slate-600">
              Nine specialized modules evaluating environmental, physical, and socio-economic indicators.
            </p>
          </div>
          <Link
            to="/explorer"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 shrink-0"
          >
            <span>Open unified Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTELLIGENCE_MODULES.map((module) => (
            <CategoryCard
              key={module.id}
              title={module.shortTitle}
              description={module.tagline}
              path={module.path}
              icon={getIcon(module.iconName)}
              indicatorCount={module.indicatorCount}
            />
          ))}
        </div>
      </section>

      {/* Featured Strategic Capabilities */}
      <section className="space-y-4">
        <div className="border-b border-slate-200/80 pb-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Strategic Analysis & Capabilities
          </h2>
          <p className="text-xs text-slate-600">
            Advanced decision-support tools built upon our cross-sector geospatial baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Resource Gap Analysis</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Evaluates supply versus demand discrepancies across water, energy, and food networks between regions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Phase 5</span>
              <Link to="/analysis/resource-gap" className="text-brand-600 hover:underline font-medium">View specs →</Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <GitCompare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Location Comparison</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Side-by-side benchmarking of regional resilience, infrastructural capacity, and operating costs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Phase 3</span>
              <Link to="/analysis/compare" className="text-brand-600 hover:underline font-medium">View specs →</Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Scenario Simulator</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Simulate hypothetical changes in rainfall anomalies, renewable tariffs, or population growth.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Phase 5</span>
              <Link to="/analysis/simulator" className="text-brand-600 hover:underline font-medium">View specs →</Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Location Assistant</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Synthesize qualitative regional reports and get contextual answers cited against empirical metrics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Phase 4</span>
              <Link to="/assistant" className="text-brand-600 hover:underline font-medium">Open preview →</Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Data Integrity Framework Banner */}
      <section>
        <DataTransparencyBanner />
      </section>

      {/* Professional Footer */}
      <footer className="pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-[11px]">
            A
          </div>
          <span className="font-semibold text-slate-800">AtlasIQ</span>
          <span>·</span>
          <span>Every Place. Deeper Intelligence.</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          <Link to="/explorer" className="hover:text-brand-600 transition-colors">Explorer</Link>
          <Link to="/intelligence/climate" className="hover:text-brand-600 transition-colors">Climate</Link>
          <Link to="/analysis/compare" className="hover:text-brand-600 transition-colors">Compare</Link>
          <Link to="/assistant" className="hover:text-brand-600 transition-colors">Assistant</Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Phase 1: Frontend Architecture</span>
        </div>
      </footer>
    </div>
  );
};
