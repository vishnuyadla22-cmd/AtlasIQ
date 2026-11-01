import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  MapPin,
  CloudSun,
  Sprout,
  Droplets,
  Zap,
  Leaf,
  Mountain,
  TrendingUp,
  GraduationCap,
  Truck,
  Scale,
  GitCompare,
  Sliders,
  Bot,
  ChevronLeft,
  ChevronRight,
  Globe2,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
  onNavigate?: () => void; // for mobile drawer close
}

interface NavGroup {
  label: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Explore',
    items: [
      { name: 'Overview', path: '/', icon: Compass },
      { name: 'Location Explorer', path: '/explorer', icon: MapPin },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'Climate & Weather', path: '/intelligence/climate', icon: CloudSun },
      { name: 'Agriculture', path: '/intelligence/agriculture', icon: Sprout },
      { name: 'Water Resources', path: '/intelligence/water', icon: Droplets },
      { name: 'Energy & Power', path: '/intelligence/energy', icon: Zap },
      { name: 'Environment', path: '/intelligence/environment', icon: Leaf },
      { name: 'Natural Resources', path: '/intelligence/natural-resources', icon: Mountain },
    ],
  },
  {
    label: 'Regional Insights',
    items: [
      { name: 'Living Cost & Economy', path: '/intelligence/economy', icon: TrendingUp },
      { name: 'Healthcare & Education', path: '/intelligence/healthcare-education', icon: GraduationCap },
      { name: 'Infrastructure', path: '/intelligence/infrastructure', icon: Truck },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { name: 'Resource Gap Analysis', path: '/analysis/resource-gap', icon: Scale },
      { name: 'Compare Locations', path: '/analysis/compare', icon: GitCompare },
      { name: 'Scenario Simulator', path: '/analysis/simulator', icon: Sliders },
    ],
  },
  {
    label: 'Assistant',
    items: [
      { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'Phase 4' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  className = '',
  onNavigate,
}) => {
  return (
    <aside
      className={`h-full flex flex-col bg-white border-r border-slate-200 transition-all duration-300 select-none ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } ${className}`}
      aria-label="Sidebar navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
          title="AtlasIQ Home"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Globe2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none">
                Atlas<span className="text-brand-600">IQ</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-tight mt-0.5 truncate">
                Location Intelligence
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Groups Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {group.label}
              </div>
            ) : (
              <div className="h-2 border-t border-slate-100 my-2 mx-1" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-brand-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />

                        {!isCollapsed && (
                          <div className="flex items-center justify-between flex-1 truncate">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Collapsed Tooltip Flyout */}
                        {isCollapsed && (
                          <div className="fixed left-[76px] hidden group-hover:flex items-center px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md shadow-lg z-50 pointer-events-none whitespace-nowrap">
                            {item.name}
                            {item.badge && (
                              <span className="ml-1.5 text-[9px] px-1 rounded bg-slate-700 text-slate-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Platform Version</span>
              <span className="text-brand-600 font-mono">v0.2-p2</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              AtlasIQ Geospatial Intelligence · Phase 2
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-[10px] text-slate-500 font-mono" title="Phase 2">
            P2
          </div>
        )}
      </div>
    </aside>
  );
};
