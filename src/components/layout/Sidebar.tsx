import React from 'react';
import { Activity, Search, TrendingUp, Settings, Shield, BarChart3, FileText, Users, X } from 'lucide-react';
import type { NavSection } from '../../utils/constants';
import { NAV_ITEMS } from '../../utils/constants';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity size={18} />,
  Search: <Search size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  Settings: <Settings size={18} />,
  Shield: <Shield size={18} />,
  BarChart3: <BarChart3 size={18} />,
  FileText: <FileText size={18} />,
  Users: <Users size={18} />,
};

interface SidebarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, isOpen, onToggle }: SidebarProps) {
  const handleSectionChange = (id: NavSection) => {
    onSectionChange(id);
    // Close mobile sidebar on navigation
    if (window.innerWidth < 768) onToggle();
  };

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-sm">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900">UrbanBreathe</span>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Command Centre</p>
          </div>
          <button
            onClick={onToggle}
            className="md:hidden ml-auto p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label}${isActive ? ' (active)' : ''}`}
            >
              <span className={isActive ? 'text-brand-500' : 'text-slate-400'}>
                {iconMap[item.icon]}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" aria-hidden="true" />
          System Online
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - desktop always visible, mobile as overlay */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen
          w-64 md:w-56 bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
