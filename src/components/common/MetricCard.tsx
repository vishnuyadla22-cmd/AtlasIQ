import React from 'react';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { DataStatus } from '../../types';
import { HelpCircle } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value?: string | number | null;
  unit?: string;
  status?: DataStatus;
  statusLabel?: string;
  description?: string;
  subtext?: string;
  source?: string;
  timestamp?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  status = 'unavailable',
  statusLabel,
  description,
  subtext,
  source,
  timestamp,
  icon,
  className = '',
}) => {
  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <Card className={`flex flex-col justify-between min-h-[148px] ${className}`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</span>
            {description && (
              <span title={description} className="text-slate-400 hover:text-slate-600 cursor-help shrink-0">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-500 truncate" title={subtext}>{subtext}</p>}
        </div>
        {icon && <div className="text-slate-400 p-1.5 bg-slate-50 rounded-lg shrink-0">{icon}</div>}
      </div>

      {/* Metric Value & Responsive Status Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-baseline justify-between flex-wrap gap-x-2 gap-y-1">
          {hasValue ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-none">{value}</span>
              {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-300 leading-none">—</span>
              {unit && <span className="text-xs text-slate-400 font-medium">({unit})</span>}
            </div>
          )}

          <div className="shrink-0">
            <StatusPill status={status} customLabel={statusLabel} />
          </div>
        </div>

        {/* Source & Timestamp footer if provided */}
        {(source || timestamp) && (
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            {source && <span className="truncate">Src: {source}</span>}
            {timestamp && <span className="truncate">{timestamp}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
