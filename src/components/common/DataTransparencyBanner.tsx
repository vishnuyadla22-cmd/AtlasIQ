import React from 'react';
import { Card } from './Card';
import { ShieldCheck, CheckCircle2, Calculator, Layers, AlertCircle } from 'lucide-react';

export const DataTransparencyBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Card variant="subtle" className={`border-slate-200/90 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">AtlasIQ Data Integrity & Transparency Framework</h4>
            <p className="text-xs text-slate-500">Every indicator clearly states its verification tier and analytical origin.</p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
          Scientific Standard
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 text-xs">
        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/70 border border-slate-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1">
              Measured Data
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Direct telemetry from verified ground stations, sensors, and remote sensing satellites.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/70 border border-slate-100">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1">
              Statistical Estimate
              <Calculator className="w-3 h-3 text-blue-600" />
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Algorithmic spatial interpolation, regional regressions, and demographic census estimates.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/70 border border-slate-100">
          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1">
              Simulation / Model
              <Layers className="w-3 h-3 text-purple-600" />
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Prospective climatic projections, hydrological balance equations, and economic scenarios.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/70 border border-slate-100">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mt-1.5" />
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1">
              Awaiting Location
              <AlertCircle className="w-3 h-3 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Unpopulated metric awaiting user search or unindexed regional telemetry.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
