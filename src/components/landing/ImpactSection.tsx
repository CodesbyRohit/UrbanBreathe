import React from 'react';
import { Heart, FileText, AlertTriangle, Search, ArrowRight } from 'lucide-react';
import type { NavSection } from '../../utils/constants';

interface ImpactSectionProps {
  activeAnomalies: number;
  onNavigate: (section: NavSection) => void;
}

interface ImpactCard {
  icon: React.ReactNode;
  title: string;
  metric: string;
  description: string;
  detail: string;
  navSection: NavSection;
  color: string;
  bgColor: string;
}

export default function ImpactSection({ activeAnomalies, onNavigate }: ImpactSectionProps) {
  const cards: ImpactCard[] = [
    {
      icon: <Heart size={20} />,
      title: 'Public Health',
      metric: 'Evidence-Based',
      description: 'Hospital admissions averted through policy simulation',
      detail: 'Run custom intervention scenarios in the Policy Simulator to measure real health impact — admissions averted, exposure reduced, cost-benefit analysis.',
      navSection: 'simulator',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-100 hover:border-teal-300',
    },
    {
      icon: <FileText size={20} />,
      title: 'Operational Efficiency',
      metric: 'Seconds vs Hours',
      description: 'Executive Brief generated in seconds vs hours of manual reporting',
      detail: 'One-click government-ready situational reports with source attribution, forecast, and prioritized recommendations.',
      navSection: 'brief',
      color: 'text-brand-600',
      bgColor: 'bg-brand-50 border-brand-100 hover:border-brand-300',
    },
    {
      icon: <AlertTriangle size={20} />,
      title: 'Early Warning',
      metric: `${activeAnomalies} Active`,
      description: `${activeAnomalies} anomalous event${activeAnomalies !== 1 ? 's' : ''} detected — actionable alerts, not just raw data`,
      detail: 'Real-time anomaly detection flags unexpected AQI deviations >40% from diurnal models, with severity and direction.',
      navSection: 'dashboard',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-100 hover:border-red-300',
    },
    {
      icon: <Search size={20} />,
      title: 'Explainability',
      metric: 'AI Confidence Scored',
      description: 'AI source attribution with confidence scoring, not black-box predictions',
      detail: 'Every source contribution includes confidence scores, seasonal context, and transparent methodology — no black boxes.',
      navSection: 'sources',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-100 hover:border-purple-300',
    },
  ];

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Impact</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <button
            key={card.title}
            onClick={() => onNavigate(card.navSection)}
            className={`group text-left rounded-xl border p-5 transition-all duration-200 animate-fade-in ${card.bgColor} ${
              card.bgColor
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.bgColor.split(' ')[0]}`}>
              <span className={card.color}>{card.icon}</span>
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-sm font-bold text-[#1e293b]">{card.title}</h3>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                card.title === 'Early Warning' && activeAnomalies > 0
                  ? 'bg-red-200 text-red-800'
                  : 'bg-white/60 text-[#334155]'
              }`}>
                {card.metric}
              </span>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed mb-3">{card.description}</p>
            
            <p className="text-[11px] text-[#475569] leading-relaxed mb-3">{card.detail}</p>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#334155] group-hover:text-brand-600 transition-colors">
              Open {card.title === 'Early Warning' ? 'Live Monitoring' : 
                     card.title === 'Operational Efficiency' ? 'Executive Brief' :
                     card.title === 'Explainability' ? 'Source Attribution' : 'Policy Simulator'}
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
