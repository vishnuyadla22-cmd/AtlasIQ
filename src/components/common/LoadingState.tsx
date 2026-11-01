import React from 'react';
import { Card } from './Card';

interface LoadingStateProps {
  type?: 'card' | 'grid' | 'fullPage';
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'card',
  count = 3,
  className = '',
}) => {
  if (type === 'card') {
    return (
      <Card className={`animate-pulse space-y-3 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-5 bg-slate-200 rounded-full w-16"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      </Card>
    );
  }

  if (type === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-5 bg-slate-200 rounded-full w-16"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-2/5"></div>
            <div className="h-3 bg-slate-100 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full py-12 flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-xs font-medium text-slate-500 animate-pulse">Loading location intelligence...</p>
    </div>
  );
};
