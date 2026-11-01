import React, { useState } from 'react';
import {
  Scale,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ResourceGapAnalysisPage: React.FC = () => {
  const [sourceLocation, setSourceLocation] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('water');

  const categories = [
    { id: 'water', name: 'Freshwater & Aquifer Supply', unit: 'million m³/yr' },
    { id: 'energy', name: 'Renewable Electricity Potential', unit: 'GWh/yr' },
    { id: 'biomass', name: 'Agricultural Biomass & Grain', unit: 'metric tons/yr' },
    { id: 'minerals', name: 'Critical Construction Aggregates', unit: 'kilo-tonnes' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Cross-Regional Optimization Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Resource Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Model spatial deficits, cross-basin water stress, and inter-regional resource allocation bottlenecks between origin and target geographies.
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 block text-center">
              Calculation Engine: Phase 5
            </span>
          </div>
        </div>

        {/* Explicit Honest Notice */}
        <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-lg text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Workflow Specification Mode: </strong>
            Resource-gap calculation models and transfer feasibility algorithms are intentionally deferred to Phase 5. The interface below represents the structural schema and analytical parameters for user evaluation. No transfer feasibility is asserted at this time.
          </div>
        </div>
      </div>

      {/* Configuration Form / Selectors */}
      <Card className="space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Analysis Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Source Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Source Geography (Origin)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              placeholder="e.g. Upper Tana Basin, Kenya"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500">Region with potential resource surplus or watershed origin</p>
          </div>

          {/* Target Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Target Geography (Demand Center)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              placeholder="e.g. Nairobi Metropolitan Area"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500">Consuming population node, industrial zone, or agricultural cluster</p>
          </div>

          {/* Resource Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Resource Category</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.unit})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">Commodity balance equation to evaluate</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            disabled
            className="opacity-60 cursor-not-allowed"
            icon={<Scale className="w-3.5 h-3.5" />}
          >
            Compute Spatial Gap (Available in Phase 5)
          </Button>
        </div>
      </Card>

      {/* Supply vs Demand Comparison Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Supply Area */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Origin Telemetry</span>
              <h3 className="text-sm font-bold text-slate-900">
                {sourceLocation ? sourceLocation : 'Select Source Geography'}
              </h3>
            </div>
            <Badge variant="default" size="sm">Available Supply</Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Sustainable Yield Baseline:</span>
              <span className="font-mono text-slate-500">—</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Local Retention Requirement:</span>
              <span className="font-mono text-slate-500">—</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Gross Exportable Margin:</span>
              <span className="font-mono text-slate-500">—</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 italic">
            Awaiting Phase 5 hydrological and ecological reserve calculations.
          </div>
        </Card>

        {/* Target Demand Area */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Destination Telemetry</span>
              <h3 className="text-sm font-bold text-slate-900">
                {targetLocation ? targetLocation : 'Select Target Geography'}
              </h3>
            </div>
            <Badge variant="default" size="sm">Demand Load</Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Annual Municipal Demand:</span>
              <span className="font-mono text-slate-500">—</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Industrial & Commercial Load:</span>
              <span className="font-mono text-slate-500">—</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Net Unmet Deficit:</span>
              <span className="font-mono text-slate-500">—</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 italic">
            Awaiting Phase 5 demographic consumption coefficients.
          </div>
        </Card>
      </div>

      {/* Preliminary Gap Summary Area */}
      <Card variant="subtle" className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Preliminary Resource Balance Summary</h3>
          </div>
          <span className="text-xs font-mono text-slate-600">Delta Model</span>
        </div>

        <div className="py-6 text-center space-y-2">
          <div className="text-xs text-slate-600 max-w-md mx-auto">
            Once both regions and the resource commodity are defined and calculated in Phase 5, this view will show the net surplus/deficit differential, conveyance friction, and environmental impact score.
          </div>
          <div className="text-xs font-mono text-slate-600">
            Net Differential: [Source Sustainable Supply] - [Target Projected Demand] = [Pending Calculation]
          </div>
        </div>
      </Card>

      {/* Assumptions and Limitations Section */}
      <Card variant="subtle" className="text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-slate-800 border-b border-slate-200/80 pb-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Assumptions & Methodological Limitations</span>
        </div>

        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>
            <strong>Ecological Minimums:</strong> All theoretical supply transfers enforce a mandatory ecological baseflow retention (minimum 30% of natural discharge).
          </li>
          <li>
            <strong>Conveyance Constraints:</strong> Physical pipeline, aqueduct, or transmission losses are not zero; real transport yields decrease with Euclidean distance and topographic elevation gradients.
          </li>
          <li>
            <strong>Non-Endorsement:</strong> Mathematical deficits indicate planning risks and do not imply legal water rights or municipal infrastructure authorizations.
          </li>
        </ul>
      </Card>
    </div>
  );
};
