import React from 'react';
import { Card } from './Card';
import { Search, MapPin, Info } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'search' | 'location' | 'info' | React.ReactNode;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  promptNote?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Search for a location to explore its available intelligence.',
  description = 'AtlasIQ indexes multi-dimensional geographic, climatic, and infrastructure data once an active location is selected.',
  icon = 'location',
  actionText = 'Go to Location Explorer',
  actionLink = '/explorer',
  onAction,
  promptNote = 'Real-time geocoding & multi-source planetary data integrations will be connected in Prompt 2.',
  className = '',
}) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    switch (icon) {
      case 'search':
        return <Search className="w-8 h-8 text-brand-600" />;
      case 'info':
        return <Info className="w-8 h-8 text-slate-500" />;
      case 'location':
      default:
        return <MapPin className="w-8 h-8 text-brand-600" />;
    }
  };

  return (
    <Card variant="subtle" className={`text-center py-10 px-6 sm:px-12 flex flex-col items-center max-w-2xl mx-auto border-dashed ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
        {description}
      </p>

      {promptNote && (
        <div className="mt-4 px-3 py-1.5 bg-brand-50/80 border border-brand-200/50 rounded-lg text-xs text-brand-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{promptNote}</span>
        </div>
      )}

      {(actionText && (actionLink || onAction)) && (
        <div className="mt-6">
          {actionLink ? (
            <Link to={actionLink}>
              <Button size="sm" variant="primary">
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="primary" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
