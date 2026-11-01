import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl border transition-all duration-150';

  const variantStyles = {
    default: 'bg-white border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]',
    subtle: 'bg-slate-50/70 border-slate-200/80',
    outline: 'bg-transparent border-slate-200',
    interactive: 'bg-white border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:border-brand-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] cursor-pointer',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
