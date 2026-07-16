import React from 'react';
import { Activity, Search, TrendingUp, Settings, FileText, Users } from 'lucide-react';
import type { NavSection } from '../../utils/constants';
import { NAV_ITEMS } from '../../utils/constants';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity size={18} />,
  Search: <Search size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  Settings: <Settings size={18} />,
  FileText: <FileText size={18} />,
  Users: <Users size={18} />,
};

interface SidebarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-screen">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-sm">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">UrbanBreathe</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Command Centre</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className={isActive ? 'text-brand-500' : 'text-slate-400'}>
                {iconMap[item.icon]}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          System Online
        </div>
      </div>
    </aside>
  );
}
