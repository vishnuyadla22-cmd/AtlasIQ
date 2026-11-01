import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'teal' | 'amber' | 'emerald' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200/80',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    slate: 'bg-slate-800 text-slate-100 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
