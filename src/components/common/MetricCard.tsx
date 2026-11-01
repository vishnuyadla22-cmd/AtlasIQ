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
  description?: string;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  status = 'unavailable',
  description,
  subtext,
  icon,
  className = '',
}) => {
  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <Card className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
            {description && (
              <span title={description} className="text-slate-400 hover:text-slate-600 cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
        </div>
        {icon && <div className="text-slate-400 p-1.5 bg-slate-50 rounded-lg shrink-0">{icon}</div>}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2">
        {hasValue ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
            {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-300">—</span>
            {unit && <span className="text-xs text-slate-400 font-medium">({unit})</span>}
          </div>
        )}
        <StatusPill status={status} />
      </div>
    </Card>
  );
};
