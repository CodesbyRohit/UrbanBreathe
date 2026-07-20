import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Shield, Globe, Phone, RefreshCw, Languages, User, Baby, Wind, HardHat, Heart } from 'lucide-react';
import { getAdvisory } from '../../services/api';
import type { CitizenAdvisory as AdvisoryData } from '../../types';

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
 * Rule-based guidance lookup: profile + AQI category → specific precautions.
 * All rules are transparent if/else logic, not a black-box model.
 */
function getProfileGuidance(profile: ProfileKey, aqi: number): { summary: string; precautions: string[] } {
  const isHazardous = aqi > 300;
  const isVeryPoor = aqi > 200 && aqi <= 300;
  const isModerate = aqi > 100 && aqi <= 200;
  const isGood = aqi <= 100;

  switch (profile) {
    case 'general':
      if (isHazardous) return {
        summary: 'Limit outdoor activity. Keep windows closed. Use air purifiers if available.',
        precautions: ['Avoid prolonged outdoor exposure', 'Keep windows and doors sealed', 'Use N95 or better mask if going out', 'Run air purifiers on recirculate mode'],
      };
      if (isVeryPoor) return {
        summary: 'Reduce prolonged outdoor exertion. Sensitive individuals may experience symptoms.',
        precautions: ['Minimize outdoor activity during peak hours (6-10 AM)', 'Wear a mask outdoors', 'Keep windows closed in traffic-heavy hours', 'Monitor for coughing or throat irritation'],
      };
      if (isModerate) return {
        summary: 'Air quality is acceptable for most. Some sensitive individuals may experience mild effects.',
        precautions: ['Ventilate home during cooler hours (late evening)', 'Reduce outdoor exercise if sensitive', 'Keep medications accessible if prone to allergies'],
      };
      return {
        summary: 'Air quality poses little to no risk. Enjoy normal activities.',
        precautions: ['Enjoy normal outdoor activities', 'Ventilate indoor spaces', 'Practice general wellness habits'],
      };

    case 'child_elderly':
      if (isHazardous) return {
        summary: 'CRITICAL: Keep children and elderly indoors. This is a health emergency for vulnerable age groups.',
        precautions: ['Do not allow outdoor play or walks', 'Keep indoor air clean — use purifiers or wet cloths on windows', 'Monitor for respiratory distress (wheezing, coughing)', 'Have emergency contacts ready', 'Ensure adequate hydration'],
      };
      if (isVeryPoor) return {
        summary: 'High risk for children and elderly. Limit outdoor exposure to essential only.',
        precautions: ['Keep children indoors — no outdoor play', 'Elderly should avoid morning walks', 'Use masks if outdoor trips are necessary', 'Keep prescribed inhalers/medications accessible', 'Monitor breathing difficulty'],
      };
      if (isModerate) return {
        summary: 'Moderate risk. Supervise outdoor time for children. Elderly should stay indoors during peak pollution hours.',
        precautions: ['Limit outdoor play for children to 30 minutes', 'Elderly: avoid outdoor activity 6-10 AM', 'Keep windows closed near traffic-heavy roads', 'Run humidifiers to ease breathing'],
      };
      return {
        summary: 'Low risk. Normal activities can resume. Maintain usual precautions.',
        precautions: ['Outdoor play and walks are safe', 'Keep regular meal and hydration schedules', 'Maintain routine health checks'],
      };

    case 'respiratory':
      if (isHazardous) return {
        summary: 'EMERGENCY: Stay indoors. This is a severe health risk for anyone with respiratory conditions.',
        precautions: ['Do not go outdoors unless absolutely necessary', 'Use rescue inhaler or nebulizer as prescribed', 'Keep windows and doors sealed', 'Run HEPA air purifier continuously', 'Call doctor if symptoms worsen', 'Wear N95 mask even indoors if ventilation is poor'],
      };
      if (isVeryPoor) return {
        summary: 'High risk. Limit outdoor exposure. Keep rescue medication accessible at all times.',
        precautions: ['Stay indoors as much as possible', 'Use prescribed preventer medication regularly', 'Carry rescue inhaler at all times', 'Avoid physical exertion', 'Monitor peak flow if asthmatic', 'Use air purifier in bedroom'],
      };
      if (isModerate) return {
        summary: 'Moderate risk. Outdoor activity may trigger symptoms. Take precautions.',
        precautions: ['Take preventer medication before going out', 'Carry rescue inhaler', 'Avoid outdoor exercise', 'Keep windows closed at night if AQI is elevated', 'Monitor symptoms and rest if needed'],
      };
      return {
        summary: 'Low risk. Continue regular medication routine.',
        precautions: ['Continue prescribed medication routine', 'Normal daily activities are safe', 'Keep inhaler accessible as routine', 'Monitor air quality updates daily'],
      };

    case 'outdoor_worker':
      if (isHazardous) return {
        summary: 'CRITICAL: Stop outdoor work if possible. If essential, use full PPE including N95 mask and eye protection.',
        precautions: ['Stop non-essential outdoor work', 'If work must continue: full PPE (N95 mask, safety goggles)', 'Take breaks every 30 minutes in clean-air zones', 'Drink plenty of water to help clear airways', 'Monitor coworkers for signs of distress', 'Report any breathing difficulty immediately'],
      };
      if (isVeryPoor) return {
        summary: 'High risk for outdoor workers. Use N95 masks and take frequent breaks.',
        precautions: ['Wear N95 mask at all times outdoors', 'Take 10-minute break every hour in indoor/clean area', 'Increase water intake', 'Rotate workers to limit individual exposure', 'Watch for coughing, wheezing, eye irritation'],
      };
      if (isModerate) return {
        summary: 'Moderate risk. Use protective equipment and limit continuous outdoor exposure.',
        precautions: ['Wear mask during outdoor work', 'Take periodic breaks in shaded/ventilated areas', 'Stay hydrated', 'Reduce heavy physical exertion during peak hours'],
      };
      return {
        summary: 'Low risk. Standard outdoor work precautions recommended.',
        precautions: ['Standard outdoor work is safe', 'Stay hydrated during physical work', 'Use sunscreen and protective gear as usual'],
      };

    case 'fitness':
      if (isHazardous) return {
        summary: 'CRITICAL: Do not exercise outdoors. Move workouts indoors immediately. Air quality is dangerous for physical activity.',
        precautions: ['Move all workouts indoors — gym, home, or indoor track', 'Avoid running, cycling, or outdoor sports', 'Use indoor cardio equipment if available', 'Reduce workout intensity if indoors (air quality affects indoor too)', 'Monitor breathing and heart rate closely'],
      };
      if (isVeryPoor) return {
        summary: 'High risk for outdoor exercise. Shift to indoor workouts. If you must go out, reduce intensity by 50%.',
        precautions: ['Choose indoor gym or home workout instead of outdoor run', 'If running outdoors: limit to 20 minutes, reduce pace', 'Run in parks away from traffic', 'Morning (before 6 AM) or late evening (after 9 PM) are marginally better', 'Wear mask during warm-up and cool-down'],
      };
      if (isModerate) return {
        summary: 'Moderate risk. Outdoor exercise is possible with reduced intensity. Choose low-traffic routes and time.',
        precautions: ['Outdoor exercise OK but reduce duration by 30%', 'Choose parks or trails away from traffic', 'Avoid roadside running or cycling', 'Morning hours (5-7 AM) are best', 'Monitor breathing — slow down if you feel discomfort'],
      };
      return {
        summary: 'Low risk. Normal exercise routine recommended. Enjoy outdoor activities.',
        precautions: ['Normal outdoor exercise is safe', 'Standard warm-up and hydration', 'Enjoy outdoor sports and activities', 'Maintain regular fitness routine'],
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
            <p className="text-sm text-slate-500">Public guidance and emergency information</p>
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
            <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-auto">AQI {advisory.aqi}</span>
          </div>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed font-medium">
            {getProfileGuidance(activeProfile, advisory.aqi).summary}
          </p>
        </div>
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {getProfileGuidance(activeProfile, advisory.aqi).precautions.map((p, i) => (
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

      {/* Emergency Banner */}
      {advisory.emergency.active && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up shadow-lg">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5 animate-pulse-soft" />
          <div>
            <h3 className="text-sm font-bold text-red-800">HEALTH EMERGENCY — SEVERE AIR QUALITY</h3>
            <p className="text-xs text-red-700 mt-1">{advisory.emergency.message}</p>
            <p className="text-xs text-red-600 mt-1 font-medium">Helpline: {advisory.emergency.helpline}</p>
          </div>
        </div>
      )}

      {/* Main Advisory Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6" style={{ backgroundColor: advisory.color + '08' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} style={{ color: advisory.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono" style={{ color: advisory.color }}>
                  {advisory.category} — AQI {advisory.aqi}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{getMessage()}</p>
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
                <p className="text-xs text-slate-500 leading-relaxed">{advisory.multilingual[lang.code]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={14} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Emergency Contacts</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Pollution Control</span>
              <p className="font-semibold font-mono text-slate-700">1800-111-222</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Health Helpline</span>
              <p className="font-semibold font-mono text-slate-700">1800-111-333</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Ambulance</span>
              <p className="font-semibold font-mono text-slate-700">108</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Disaster Mgmt</span>
              <p className="font-semibold font-mono text-slate-700">112</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
