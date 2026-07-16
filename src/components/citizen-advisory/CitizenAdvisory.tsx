import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Shield, Globe, Phone, RefreshCw } from 'lucide-react';
import { getAdvisory } from '../../services/api';
import type { CitizenAdvisory as AdvisoryData } from '../../types';

interface CitizenAdvisoryProps {
  cityId: string;
}

export default function CitizenAdvisory({ cityId }: CitizenAdvisoryProps) {
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'bn' | 'te'>('en');

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Users size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Citizen Health Advisory</h2>
          <p className="text-sm text-slate-500">Public guidance and emergency information</p>
        </div>
      </div>

      {/* Emergency Banner */}
      {advisory.emergency.active && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
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
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: advisory.color }}>
                  {advisory.category} — AQI {advisory.aqi}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{getMessage()}</p>
            </div>
            <div className="flex items-center gap-0.5 bg-white rounded-lg border border-slate-200 p-0.5 shrink-0">
              {(['en', 'hi', 'bn', 'te'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    language === l ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : l === 'bn' ? 'বাং' : 'తె'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Precautions */}
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
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-1">हिन्दी (Hindi)</p>
              <p className="text-xs text-slate-500 leading-relaxed">{advisory.multilingual.hi}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-1">বাংলা (Bengali)</p>
              <p className="text-xs text-slate-500 leading-relaxed">{advisory.multilingual.bn}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-1">తెలుగు (Telugu)</p>
              <p className="text-xs text-slate-500 leading-relaxed">{advisory.multilingual.te}</p>
            </div>
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
              <p className="font-semibold text-slate-700">1800-XXX-XXXX</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Health Helpline</span>
              <p className="font-semibold text-slate-700">1800-XXX-XXXX</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Ambulance</span>
              <p className="font-semibold text-slate-700">108</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Disaster Mgmt</span>
              <p className="font-semibold text-slate-700">112</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
