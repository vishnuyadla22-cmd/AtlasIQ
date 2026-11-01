import React, { useEffect } from 'react';
import { X, Globe2 } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-200 ease-in-out">
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Globe2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900">
                Atlas<span className="text-brand-600">IQ</span>
              </span>
              <span className="text-[10px] text-slate-600">Location Intelligence</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reuse the Sidebar nav groups */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar
            isCollapsed={false}
            onToggleCollapse={() => {}}
            className="border-none w-full h-full"
            onNavigate={onClose}
          />
        </div>
      </div>
    </div>
  );
};
