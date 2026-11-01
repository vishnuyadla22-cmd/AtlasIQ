import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('atlasiq_sidebar_collapsed') === 'true';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('atlasiq_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-brand-100 selection:text-brand-900 overflow-hidden">
      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Sidebar: stays stationary, inner navigation scrolls independently */}
        <aside className="hidden lg:flex flex-col shrink-0 h-full">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </aside>

        {/* Main Content Area: independently scrollable */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
