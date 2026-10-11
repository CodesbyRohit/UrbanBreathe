import React from 'react';
import { Heart, FileText, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import type { NavSection } from '../../utils/constants';

interface ImpactSectionProps {
  onNavigate: (section: NavSection) => void;
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  metric: string;
  description: string;
  navSection: NavSection;
  navLabel: string;
  color: string;
  bgColor: string;
}

export default function ImpactSection({ onNavigate }: ImpactSectionProps) {
  const cards: FeatureCard[] = [
    {
      icon: <Heart size={20} />,
      title: 'Health guidance',
      metric: 'CPCB statements',
      description: 'Category-based guidance using CPCB health statements, with profile-specific precautions in four languages.',
      navSection: 'advisory',
      navLabel: 'Citizen Advisory',
      color: 'text-teal-700',
      bgColor: 'bg-teal-50 border-teal-100 hover:border-teal-300',
    },
    {
      icon: <FileText size={20} />,
      title: 'Situation brief',
      metric: 'Sources & limits stated',
      description: 'A printable summary built from the same data, listing its data basis and limitations.',
      navSection: 'brief',
      navLabel: 'Executive Brief',
      color: 'text-brand-700',
      bgColor: 'bg-brand-50 border-brand-100 hover:border-brand-300',
    },
    {
      icon: <TrendingUp size={20} />,
      title: 'Model forecast',
      metric: 'Not yet evaluated',
      description: '72-hour CAMS model outlook with NAQI-method estimates. Accuracy has not been evaluated.',
      navSection: 'forecast',
      navLabel: 'Model Forecast',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-100 hover:border-orange-300',
    },
    {
      icon: <BookOpen size={20} />,
      title: 'Transparent method',
      metric: 'CPCB NAQI',
      description: 'Index computed with the CPCB method from 24-h / 8-h means; source context shows indicators, not attribution.',
      navSection: 'sources',
      navLabel: 'Source Context',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50 border-purple-100 hover:border-purple-300',
    },
  ];

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">What you can do here</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <button
            key={card.title}
            onClick={() => onNavigate(card.navSection)}
            className={`group text-left rounded-xl border p-5 transition-all duration-200 animate-fade-in ${card.bgColor}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/60">
              <span className={card.color}>{card.icon}</span>
            </div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-[#1e293b]">{card.title}</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-white/60 text-[#334155]">
                {card.metric}
              </span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed mb-3">{card.description}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#334155] group-hover:text-brand-700 transition-colors">
              Open {card.navLabel}
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
