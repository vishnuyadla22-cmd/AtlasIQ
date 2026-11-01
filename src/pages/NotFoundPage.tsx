import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-10 px-6 sm:px-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-wider">
            Error 404 · Unmapped Coordinate
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The requested route does not correspond to an active AtlasIQ module or spatial view.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Return to Overview
            </Button>
          </Link>
          <Link to="/explorer" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              Open Explorer
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
