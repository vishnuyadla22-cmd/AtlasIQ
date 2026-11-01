import React from 'react';
import { DataStatus } from '../../types';

interface StatusPillProps {
  status: DataStatus;
  customLabel?: string;
  showIcon?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  customLabel,
  showIcon = true,
  className = '',
}) => {
  const configs: Record<DataStatus, { label: string; bg: string; text: string; dot: string; title: string }> = {
    measured: {
      label: 'Measured Data',
      bg: 'bg-emerald-50 border-emerald-200/80',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      title: 'Directly verified from meteorological sensors or observational data networks'
    },
    forecast: {
      label: 'Short-Term Forecast',
      bg: 'bg-sky-50 border-sky-200/80',
      text: 'text-sky-800',
      dot: 'bg-sky-500',
      title: 'Numerical meteorological model prediction (Open-Meteo forecast)'
    },
    estimated: {
      label: 'Statistical Estimate',
      bg: 'bg-blue-50 border-blue-200/80',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
      title: 'Derived via regional interpolation or regression models'
    },
    simulation: {
      label: 'Simulation / Model',
      bg: 'bg-purple-50 border-purple-200/80',
      text: 'text-purple-800',
      dot: 'bg-purple-500',
      title: 'Generated through prospective climatic or socioeconomic projection models'
    },
    awaiting_geocoding: {
      label: 'Awaiting Geocoding',
      bg: 'bg-amber-50 border-amber-200/80',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      title: 'Location query entered; coordinates have not yet been resolved'
    },
    geocoding: {
      label: 'Resolving Coordinates...',
      bg: 'bg-brand-50 border-brand-200/80',
      text: 'text-brand-800',
      dot: 'bg-brand-500 animate-pulse',
      title: 'Querying OpenStreetMap Nominatim for geographic boundary coordinates'
    },
    unavailable: {
      label: 'Awaiting Location Input',
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      title: 'Select a location to populate empirical metrics'
    }
  };

  const current = configs[status] || configs.unavailable;
  const label = customLabel || current.label;

  return (
    <span
      title={current.title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium leading-none shrink-0 ${current.bg} ${current.text} ${className}`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />}
      <span className="truncate">{label}</span>
    </span>
  );
};
