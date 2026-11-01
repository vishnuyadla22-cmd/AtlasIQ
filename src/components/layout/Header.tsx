import React from 'react';
import { Menu, Globe2, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileNav: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileNav,
  title,
  subtitle,
}) => {
  const location = useLocation();

  // If title is not passed, determine from current pathname
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Platform Overview', subtitle: 'Global geospatial indicators & analytical framework' };
    if (path === '/explorer') return { title: 'Location Explorer', subtitle: 'Integrated multi-sector intelligence dashboard' };
    if (path.startsWith('/intelligence/climate')) return { title: 'Climate & Weather Intelligence', subtitle: 'Precipitation, thermal regimes, and historical hazard risk' };
    if (path.startsWith('/intelligence/agriculture')) return { title: 'Agriculture & Soil Intelligence', subtitle: 'Agro-ecological suitability and crop viability metrics' };
    if (path.startsWith('/intelligence/water')) return { title: 'Water Resources & Aquifers', subtitle: 'Groundwater anomalies, hydrological stress, and basin reserves' };
    if (path.startsWith('/intelligence/energy')) return { title: 'Energy & Power Infrastructure', subtitle: 'Solar irradiance, wind density, and clean grid potential' };
    if (path.startsWith('/intelligence/environment')) return { title: 'Environment & Biodiversity', subtitle: 'Air particulate matter, forest canopy, and ecological health' };
    if (path.startsWith('/intelligence/natural-resources')) return { title: 'Natural Resources & Geology', subtitle: 'Critical mineral occurrences and geological baselines' };
    if (path.startsWith('/intelligence/economy')) return { title: 'Living Cost & Regional Economy', subtitle: 'Purchasing power, housing indices, and economic specializations' };
    if (path.startsWith('/intelligence/healthcare-education')) return { title: 'Healthcare & Education', subtitle: 'Public health capacities, physician access, and educational attainment' };
    if (path.startsWith('/intelligence/infrastructure')) return { title: 'Transportation & Logistics', subtitle: 'Freight corridors, transit density, and gigabit digital access' };
    if (path.startsWith('/analysis/resource-gap')) return { title: 'Resource Gap Analysis', subtitle: 'Supply versus demand variance between regions' };
    if (path.startsWith('/analysis/compare')) return { title: 'Location Comparison', subtitle: 'Multi-attribute comparative intelligence evaluation' };
    if (path.startsWith('/analysis/simulator')) return { title: 'Scenario Simulator', subtitle: 'Prospective climatic and developmental scenario projections' };
    if (path.startsWith('/assistant')) return { title: 'AI Location Assistant', subtitle: 'Natural language queries over verified location data' };
    return { title: 'AtlasIQ Intelligence', subtitle: 'Every Place. Deeper Intelligence.' };
  };

  const currentInfo = getPageInfo();
  const displayTitle = title || currentInfo.title;
  const displaySubtitle = subtitle || currentInfo.subtitle;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left: Mobile Toggle + Title & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand indicator */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <Globe2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Atlas<span className="text-brand-600">IQ</span></span>
          <span className="text-slate-300">|</span>
        </div>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-xs text-slate-600 hidden sm:block truncate">
            {displaySubtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions & status */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <Link
          to="/explorer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-brand-600" />
          <span>Quick Explorer</span>
        </Link>

        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-medium text-slate-600 hidden sm:inline">Engine Standby</span>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            Phase 4
          </span>
        </div>
      </div>
    </header>
  );
};
