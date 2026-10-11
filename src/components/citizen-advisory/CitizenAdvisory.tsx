import React, { useState, useEffect } from 'react';
import { Users, Shield, Globe, Phone, RefreshCw, Languages, User, Baby, Wind, HardHat, Heart, Info } from 'lucide-react';
import { getAdvisory } from '../../services/api';
import type { CitizenAdvisory as AdvisoryData } from '../../types';
import DataBasisBadge from '../common/DataBasisBadge';
import { formatIndex } from '../../utils/provenance';

interface CitizenAdvisoryProps {
  cityId: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
] as const;

/**
 * Rule-based profile personalization.
 * Each profile + AQI category maps to specific guidance.
 * This is a transparent lookup table — not AI-generated content.
 */
type ProfileKey = 'general' | 'child_elderly' | 'respiratory' | 'outdoor_worker' | 'fitness';

interface ProfileConfig {
  id: ProfileKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PROFILES: ProfileConfig[] = [
  { id: 'general', label: 'General', icon: <User size={16} />, description: 'Default guidance for all ages' },
  { id: 'child_elderly', label: 'Child / Elderly', icon: <Baby size={16} />, description: 'Children under 12 and adults over 65' },
  { id: 'respiratory', label: 'Respiratory', icon: <Wind size={16} />, description: 'Asthma, COPD, or chronic respiratory conditions' },
  { id: 'outdoor_worker', label: 'Outdoor Worker', icon: <HardHat size={16} />, description: 'Construction, traffic, field workers' },
  { id: 'fitness', label: 'Fitness / Athlete', icon: <Heart size={16} />, description: 'Outdoor exercise, runners, athletes' },
];

/**
 * Rule-based guidance lookup: profile + CPCB category → general precautions.
 * Transparent lookup table, not AI-generated content and not medical advice.
 * Categories are grouped as: Good/Satisfactory, Moderate, Poor, Very Poor/Severe.
 */
function getProfileGuidance(profile: ProfileKey, category: string | null): { summary: string; precautions: string[] } | null {
  if (!category) return null;
  const level = category === 'Very Poor' || category === 'Severe' ? 'high'
    : category === 'Poor' ? 'poor'
    : category === 'Moderate' ? 'moderate'
    : 'low';

  switch (profile) {
    case 'general':
      if (level === 'high') return {
        summary: 'Limit outdoor activity. Keep windows closed. Use air purifiers if available.',
        precautions: ['Avoid prolonged outdoor exposure', 'Keep windows and doors closed', 'Use a well-fitted N95 mask if going out', 'Use air purifiers if available'],
      };
      if (level === 'poor') return {
        summary: 'Reduce prolonged outdoor exertion. People with heart or lung conditions may feel discomfort.',
        precautions: ['Reduce time spent outdoors when levels are high', 'Wear a mask outdoors', 'Keep windows closed near busy roads', 'Watch for coughing or throat irritation'],
      };
      if (level === 'moderate') return {
        summary: 'Acceptable for most people. Sensitive individuals may experience mild effects.',
        precautions: ['Reduce prolonged outdoor exertion if you are sensitive', 'Keep medicines accessible if you have asthma or allergies'],
      };
      return {
        summary: 'Air quality poses little risk. Normal activities are fine.',
        precautions: ['Normal outdoor activities are fine', 'Ventilate indoor spaces'],
      };

    case 'child_elderly':
      if (level === 'high') return {
        summary: 'High risk for children and older adults. Keep outdoor exposure to a minimum.',
        precautions: ['Avoid outdoor play and walks', 'Use air purifiers indoors if available', 'Watch for breathing difficulty, wheezing or coughing', 'Keep emergency contacts ready'],
      };
      if (level === 'poor') return {
        summary: 'Elevated risk for children and older adults. Limit outdoor exposure.',
        precautions: ['Limit outdoor play', 'Older adults should avoid strenuous outdoor activity', 'Use masks if outdoor trips are necessary', 'Keep prescribed medicines accessible'],
      };
      if (level === 'moderate') return {
        summary: 'Some risk for children and older adults with heart or lung conditions.',
        precautions: ['Supervise and shorten outdoor play if symptoms appear', 'Older adults: avoid strenuous outdoor activity when levels are highest', 'Keep windows closed near busy roads'],
      };
      return {
        summary: 'Low risk. Normal activities can continue.',
        precautions: ['Outdoor play and walks are fine', 'Maintain routine health checks'],
      };

    case 'respiratory':
      if (level === 'high') return {
        summary: 'Serious risk for people with respiratory conditions. Stay indoors as far as possible.',
        precautions: ['Go outdoors only if necessary', 'Use rescue medication as prescribed', 'Keep windows and doors closed', 'Use a HEPA air purifier if available', 'Contact your doctor if symptoms worsen'],
      };
      if (level === 'poor') return {
        summary: 'High risk. Limit outdoor exposure and keep rescue medication with you.',
        precautions: ['Stay indoors as much as possible', 'Take preventer medication as prescribed', 'Carry rescue medication', 'Avoid physical exertion', 'Use an air purifier if available'],
      };
      if (level === 'moderate') return {
        summary: 'Moderate risk. Outdoor activity may trigger symptoms.',
        precautions: ['Carry rescue medication', 'Avoid strenuous outdoor exercise', 'Monitor symptoms and rest if needed'],
      };
      return {
        summary: 'Low risk. Continue your usual medication routine.',
        precautions: ['Continue prescribed medication', 'Keep your inhaler accessible as usual'],
      };

    case 'outdoor_worker':
      if (level === 'high') return {
        summary: 'High risk for outdoor workers. Reduce outdoor work where possible and use protection.',
        precautions: ['Postpone non-essential outdoor work', 'Wear a well-fitted N95 mask', 'Take regular breaks in indoor or cleaner-air areas', 'Report breathing difficulty immediately'],
      };
      if (level === 'poor') return {
        summary: 'Elevated risk for outdoor workers. Use masks and take breaks.',
        precautions: ['Wear a well-fitted N95 mask outdoors', 'Take regular breaks indoors', 'Rotate tasks to limit individual exposure', 'Watch for coughing, wheezing or eye irritation'],
      };
      if (level === 'moderate') return {
        summary: 'Moderate risk. Limit continuous heavy exertion outdoors.',
        precautions: ['Wear a mask during dusty or heavy work', 'Take periodic breaks', 'Reduce heavy exertion when levels are highest'],
      };
      return {
        summary: 'Low risk. Standard outdoor work precautions apply.',
        precautions: ['Standard outdoor work is fine', 'Stay hydrated during physical work'],
      };

    case 'fitness':
      if (level === 'high') return {
        summary: 'Do not exercise outdoors. Move workouts indoors.',
        precautions: ['Move workouts indoors', 'Avoid outdoor running, cycling and sports', 'Reduce intensity (indoor air is also affected)', 'Stop if you feel breathing discomfort'],
      };
      if (level === 'poor') return {
        summary: 'High risk for outdoor exercise. Prefer indoor workouts.',
        precautions: ['Prefer indoor workouts', 'If exercising outdoors, keep it short and light', 'Choose routes away from traffic'],
      };
      if (level === 'moderate') return {
        summary: 'Outdoor exercise is possible at reduced intensity.',
        precautions: ['Reduce duration and intensity', 'Choose parks or routes away from traffic', 'Slow down if you feel discomfort'],
      };
      return {
        summary: 'Low risk. Normal exercise routine is fine.',
        precautions: ['Normal outdoor exercise is fine', 'Standard warm-up and hydration'],
      };
  }
}

export default function CitizenAdvisory({ cityId }: CitizenAdvisoryProps) {
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'bn' | 'te'>('en');
  const [activeProfile, setActiveProfile] = useState<ProfileKey>('general');

  const fetchAdvisory = () => {
    setLoading(true);
    setError(null);
    getAdvisory(cityId)
      .then(setAdvisory)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdvisory(); }, [cityId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="skeleton w-48 h-4 mb-4" />
          <div className="skeleton w-full h-20 mb-3" />
          <div className="skeleton w-full h-16" />
        </div>
      </div>
    );
  }

  if (error || !advisory) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-slate-500">{error || 'Unable to load advisory.'}</p>
          <button onClick={fetchAdvisory} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors mx-auto">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const getMessage = () => {
    if (language === 'en') return advisory.healthAdvisory;
    return advisory.multilingual[language] || advisory.healthAdvisory;
  };

  const guidance = getProfileGuidance(activeProfile, advisory.category);
  const aqiText = formatIndex(advisory.aqi, advisory.aqiIsLowerBound);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Users size={18} className="text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Citizen Health Advisory</h2>
            <p className="text-sm text-slate-500">General guidance based on a NAQI estimate from modelled data</p>
          </div>
        </div>

        {/* Prominent language switcher - top level control */}
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
          <Languages size={14} className="text-slate-400 ml-1" />
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                language === l.code
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title={l.label}
              aria-label={`Switch to ${l.label}`}
              aria-pressed={language === l.code}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {/* Profile selector — rule-based personalization */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={14} className="text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-700">Profile-Based Personalization</h3>
          <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-auto">Rule-based</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-3">Select your profile for tailored guidance based on current AQI. This uses a transparent lookup table — not AI-generated content.</p>
        <div className="flex flex-wrap gap-2">
          {PROFILES.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProfile(p.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                activeProfile === p.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
              title={p.description}
              aria-label={`${p.label}: ${p.description}`}
              aria-pressed={activeProfile === p.id}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile-based personalized guidance */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4" style={{ backgroundColor: advisory.color + '08' }}>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} style={{ color: advisory.color }} />
            <span className="text-xs font-semibold uppercase tracking-wider font-mono" style={{ color: advisory.color }}>
              {activeProfile === 'general' ? 'General Guidance' : `${PROFILES.find(p => p.id === activeProfile)?.label || 'Personalized'} Guidance`}
            </span>
            <span className="text-[9px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded ml-auto">NAQI est. {aqiText}</span>
          </div>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed font-medium">
            {guidance ? guidance.summary : 'Not enough valid data for guidance right now. Please check the official CPCB station AQI.'}
          </p>
        </div>
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(guidance?.precautions ?? []).map((p, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg">
                <Shield size={14} className="text-brand-500 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Language indicator */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Globe size={12} />
        <span>
          Viewing in <strong className="text-slate-600">{currentLang.label}</strong>
          {language !== 'en' && (
            <button
              onClick={() => setLanguage('en')}
              className="ml-2 text-brand-500 hover:text-brand-600 underline underline-offset-2"
            >
              View in English
            </button>
          )}
        </span>
      </div>


      {/* Main Advisory Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6" style={{ backgroundColor: advisory.color + '08' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} style={{ color: advisory.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono" style={{ color: advisory.color }}>
                  {advisory.category ?? 'No estimate'} — NAQI est. {aqiText}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{getMessage()}</p>
              {advisory.healthStatement && (
                <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                  <strong>CPCB health statement:</strong> {advisory.healthStatement}
                  <span className="block text-[10px] text-slate-500 mt-0.5">{advisory.healthStatementSource}</span>
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DataBasisBadge provenance={advisory.provenance} />
                <span className="text-[10px] text-slate-500">{advisory.naqiLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Standard precautions (hidden when a specific profile is active since profile guidance covers it) */}
        {activeProfile === 'general' && (
          <div className="px-6 py-5 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Recommended Precautions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {advisory.precautions.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg">
                  <Shield size={14} className="text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700">{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sensitive Groups */}
        <div className="px-6 py-5 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Sensitive Population</h3>
          <div className="flex flex-wrap gap-2">
            {advisory.sensitiveGroups.map((g, i) => (
              <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-100">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Multilingual Advisories */}
        <div className="px-6 py-5 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Regional Language Advisories</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LANGUAGES.filter(l => l.code !== 'en').map(lang => (
              <div
                key={lang.code}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                  language === lang.code
                    ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-500/20'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
                onClick={() => setLanguage(lang.code)}
              >
                <p className="text-xs font-semibold text-slate-600 mb-1">{lang.native} ({lang.label})</p>
                <p className="text-xs text-slate-500 leading-relaxed">{advisory.multilingual[lang.code] ?? 'Not available'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={14} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Emergency contact</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {advisory.emergencyContacts.map(c => (
              <div key={c.number} className="bg-white rounded-lg p-3 border border-slate-200">
                <span className="text-slate-500 block mb-0.5">{c.label}</span>
                <p className="font-semibold font-mono text-slate-700">{c.number}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{advisory.contactsNote}</p>
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-slate-500">
        <Info size={12} className="shrink-0 mt-0.5" /> {advisory.disclaimer} {advisory.multilingualNote}
      </p>
    </div>
  );
}
