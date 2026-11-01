import React, { useState } from 'react';
import {
  GitCompare,
  MapPin,
  Filter,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { StatusPill } from '../components/common/StatusPill';

export const CompareLocationsPage: React.FC = () => {
  const [locA, setLocA] = useState('');
  const [locB, setLocB] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Indicators' },
    { id: 'climate', name: 'Climate & Weather' },
    { id: 'water', name: 'Water Security' },
    { id: 'energy', name: 'Renewable Potential' },
    { id: 'economy', name: 'Economic Baseline' },
    { id: 'infrastructure', name: 'Logistics Access' },
  ];

  const comparisonMetrics = [
    { name: 'Mean Annual Temperature', unit: '°C', category: 'climate' },
    { name: 'Annual Precipitation', unit: 'mm/yr', category: 'climate' },
    { name: 'Baseline Water Stress Ratio', unit: 'ratio', category: 'water' },
    { name: 'Photovoltaic Potential (PVOUT)', unit: 'kWh/kWp', category: 'energy' },
    { name: 'Regional GDP Per Capita', unit: 'USD (PPP)', category: 'economy' },
    { name: 'Freight Terminal Proximity', unit: 'km', category: 'infrastructure' },
  ];

  const filteredMetrics = activeCategory === 'all'
    ? comparisonMetrics
    : comparisonMetrics.filter(m => m.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
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
              Side-by-side structural evaluation of environmental resilience, resource stress, and infrastructure readiness.
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 block text-center">
              Comparative Engine: Phase 3
            </span>
          </div>
        </div>
      </div>

      {/* Selectors Card */}
      <Card className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Target Comparison Pair
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Location Primary (A)</span>
            </label>
            <input
              type="text"
              value={locA}
              onChange={(e) => setLocA(e.target.value)}
              placeholder="e.g. Phoenix, Arizona, USA"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Location Comparative (B)</span>
            </label>
            <input
              type="text"
              value={locB}
              onChange={(e) => setLocB(e.target.value)}
              placeholder="e.g. Valencia, Spain"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Side-by-Side Comparison Table Structure */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Comparative Indicator Matrix
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Coverage:</span>
            <Badge variant="default" size="sm">0% Populated (Phase 1 Template)</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-2/5">Indicator & Dimension</th>
                <th className="py-3 px-4 w-3/10 border-l border-slate-200">
                  <span className="text-slate-800">{locA || 'Location A (Unset)'}</span>
                </th>
                <th className="py-3 px-4 w-3/10 border-l border-slate-200">
                  <span className="text-slate-800">{locB || 'Location B (Unset)'}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMetrics.map((metric, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{metric.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Unit: {metric.unit}</div>
                  </td>
                  <td className="py-3.5 px-4 border-l border-slate-200 text-slate-400 font-mono">
                    <div className="flex items-center justify-between">
                      <span>—</span>
                      <StatusPill status="unavailable" showIcon={false} />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 border-l border-slate-200 text-slate-400 font-mono">
                    <div className="flex items-center justify-between">
                      <span>—</span>
                      <StatusPill status="unavailable" showIcon={false} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State / Notice */}
      <EmptyState
        title="Input two locations to generate side-by-side intelligence."
        description="Once dual locations are resolved through Prompt 2 geocoding, Phase 3 will populate radar benchmarks and deviation deltas."
        promptNote="Prompt 3 will introduce normalized comparative radar visualizations and automated divergence scoring."
      />
    </div>
  );
};
