import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Information Notice',
  message,
  onDismiss,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-900">{title}</h4>
          <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-amber-500 hover:text-amber-700 p-1 rounded-lg hover:bg-amber-100/60 transition-colors"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
