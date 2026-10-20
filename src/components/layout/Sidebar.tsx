import React, { useEffect } from 'react';
import { Activity, Search, TrendingUp, SlidersHorizontal, BarChart3, FileText, Users, BookOpen, X } from 'lucide-react';
import type { NavSection } from '../../utils/constants';
import { NAV_ITEMS } from '../../utils/constants';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity size={18} />,
  Search: <Search size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  SlidersHorizontal: <SlidersHorizontal size={18} />,
  BarChart3: <BarChart3 size={18} />,
  FileText: <FileText size={18} />,
  Users: <Users size={18} />,
  BookOpen: <BookOpen size={18} />,
};

interface SidebarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, isOpen, onClose }: SidebarProps) {
  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} aria-hidden="true" />}

      {/* Desktop: always visible. Mobile: off-canvas drawer; `invisible` when
          closed keeps its links out of the tab order. */}
      <aside
        className={`no-print fixed md:sticky top-0 left-0 z-40 h-screen w-64 md:w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible md:visible md:translate-x-0'}`}
        aria-label="Sidebar"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center" aria-hidden="true">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900">UrbanBreathe</span>
            <p className="text-xs text-slate-500">Air-quality estimates · India</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden ml-auto p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="Close navigation menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={e => { e.preventDefault(); onSectionChange(item.id); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={isActive ? 'text-brand-600' : 'text-slate-500'} aria-hidden="true">{iconMap[item.icon]}</span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-3 border-t border-slate-100 text-xs leading-snug text-slate-500">
          Data: CAMS model via{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-700">
            Open-Meteo
          </a>{' '}
          (CC BY 4.0). Not official CPCB station AQI.
        </div>
      </aside>
    </>
  );
}
