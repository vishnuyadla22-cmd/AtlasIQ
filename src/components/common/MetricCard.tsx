import React from 'react';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { DataStatus } from '../../types';
import { HelpCircle, Globe, MapPin } from 'lucide-react';

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
  geographicScope?: string;
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
  geographicScope,
  icon,
  className = '',
}) => {
  // Validate value: treat null, undefined, '', NaN as absent
  const isValidNumber = typeof value === 'number' && !Number.isNaN(value);
  const isValidString = typeof value === 'string' && value.trim().length > 0 && value.trim() !== 'NaN' && value.trim() !== 'null';
  const hasValue = isValidNumber || isValidString;

  const isNational = geographicScope && /national/i.test(geographicScope);

  // Format value display cleanly
  const formattedValue = React.useMemo(() => {
    if (!hasValue) return null;
    if (typeof value === 'number') {
      return Number.isInteger(value)
        ? value.toLocaleString()
        : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return value;
  }, [value, hasValue]);

  return (
    <Card
      className={`h-full flex flex-col justify-between p-4 sm:p-5 transition-all duration-150 hover:shadow-xs border border-slate-200/90 bg-white rounded-xl ${className}`}
    >
      {/* 1. Header: Label, Description & Geographic Scope */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5">
              <span
                className="text-xs font-bold uppercase tracking-wider text-slate-700 leading-snug line-clamp-2"
                title={label}
              >
                {label}
              </span>
              {description && (
                <span
                  title={description}
                  className="text-slate-400 hover:text-slate-600 cursor-help shrink-0 mt-0.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {subtext && (
              <p
                className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed"
                title={subtext}
              >
                {subtext}
              </p>
            )}
          </div>

          {icon && (
            <div className="text-slate-400 p-1.5 bg-slate-50 rounded-lg shrink-0 border border-slate-100">
              {icon}
            </div>
          )}
        </div>

        {geographicScope && (
          <div className="pt-0.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                isNational
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title={`Spatial coverage: ${geographicScope}`}
            >
              {isNational ? (
                <Globe className="w-2.5 h-2.5 shrink-0 text-amber-700" />
              ) : (
                <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
              )}
              <span className="truncate max-w-[200px]">{geographicScope}</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Metric Value Area — Vertically aligned with consistent baseline */}
      <div className="my-3 py-2.5 border-y border-slate-100/90 flex flex-col justify-center min-h-[56px]">
        {hasValue ? (
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none whitespace-nowrap">
              {formattedValue}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap">
                {unit}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
              <span className="text-sm sm:text-base font-semibold text-slate-400 italic leading-snug">
                Integration Pending
              </span>
              {unit && (
                <span className="text-xs text-slate-400 font-normal">
                  ({unit})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer: Status Badge, Reference Timestamp & Source */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <StatusPill
            status={status}
            customLabel={
              statusLabel || (status === 'unavailable' ? 'Integration Pending' : undefined)
            }
          />
          {timestamp && (
            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap ml-auto">
              {timestamp}
            </span>
          )}
        </div>

        {source && (
          <div className="text-[11px] text-slate-500 leading-tight break-words">
            <span className="text-slate-400 font-medium">Source: </span>
            <span className="text-slate-600 line-clamp-2" title={source}>
              {source}
            </span>
          </div>
        )}

        {!hasValue && status === 'unavailable' && description && (
          <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-md text-[11px] text-slate-600 leading-relaxed break-words">
            <span className="font-semibold text-slate-700">Requirement: </span>
            <span>{description.replace(/^Unavailable:\s*/i, '')}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
