import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { ArrowRight } from 'lucide-react';
import { Badge } from './Badge';

export interface CategoryCardProps {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  indicatorCount?: number;
  badge?: string;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  path,
  icon,
  indicatorCount,
  badge,
  className = '',
}) => {
  return (
    <Link to={path} className="group block focus:outline-none">
      <Card
        variant="interactive"
        className={`h-full flex flex-col justify-between group-focus:ring-2 group-focus:ring-brand-500 group-focus:ring-offset-2 ${className}`}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
              {icon}
            </div>
            <div className="flex items-center gap-1.5">
              {badge && <Badge variant="teal" size="sm">{badge}</Badge>}
              {indicatorCount !== undefined && (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {indicatorCount} indicators
                </span>
              )}
            </div>
          </div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-brand-600">
          <span>Explore intelligence</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
};
