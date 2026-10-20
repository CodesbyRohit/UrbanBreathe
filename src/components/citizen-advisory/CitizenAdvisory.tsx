import React, { useState } from 'react';
import { Users, Phone, Languages, ShieldCheck, Info } from 'lucide-react';
import { getAdvisory } from '../../services/api';
import { useResource } from '../../hooks/useResource';
import { useAqiColor } from '../../hooks/useTheme';
import type { City, CitizenAdvisory as AdvisoryData } from '../../types';
import { formatIndex } from '../../utils/provenance';
import PageHeader from '../common/PageHeader';
import DataBasisBadge from '../common/DataBasisBadge';
import DataFreshness from '../common/DataFreshness';
import CategoryBadge from '../common/CategoryBadge';
import { LoadingPanel, ErrorPanel, StaleBanner } from '../common/StateViews';
import { PROFILES, getProfileGuidance, type ProfileKey } from './profileGuidance';

interface CitizenAdvisoryProps {
  city: City;
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
] as const;
type LangCode = typeof LANGUAGES[number]['code'];

export default function CitizenAdvisory({ city }: CitizenAdvisoryProps) {
  // One request: the response carries the guidance in every supported language.
  const { data: advisory, loading, error, reload } = useResource<AdvisoryData>(city.id, signal => getAdvisory(city.id, 'en', signal));
  const aqiColor = useAqiColor();
  const [language, setLanguage] = useState<LangCode>('en');
  const [profile, setProfile] = useState<ProfileKey>('general');

  const header = (
    <PageHeader icon={<Users size={18} />} title={`Citizen advisory — ${city.name}`} description="CPCB health statement for the estimated category, with general precautions. Not medical advice.">
      {advisory && <DataBasisBadge provenance={advisory.provenance} />}
    </PageHeader>
  );

  if (!advisory) {
    return (
      <div className="space-y-5">
        {header}
        {loading ? <LoadingPanel label="Loading advisory" /> : <ErrorPanel title="The advisory could not be loaded" message={error} onRetry={reload} />}
      </div>
    );
  }

  const translated = language === 'en' ? advisory.healthAdvisory : advisory.multilingual[language];
  const guidanceText = translated ?? advisory.healthAdvisory;
  const guidanceLang = translated ? language : 'en';
  const profileGuidance = profile === 'general' ? null : getProfileGuidance(profile, advisory.category);
  const precautions = profile === 'general' ? advisory.precautions : profileGuidance?.precautions ?? [];

  return (
    <div className="space-y-5 max-w-4xl">
      {header}
      {error && <StaleBanner message={error} onRetry={reload} />}

      <section className="panel overflow-hidden" aria-labelledby="advisory-status">
        <div className="p-5 flex flex-wrap items-center gap-4 border-b border-slate-100">
          <div className="text-4xl font-bold tabular" style={{ color: aqiColor(advisory.aqi) }}>{formatIndex(advisory.aqi, advisory.aqiIsLowerBound)}</div>
          <div className="min-w-0">
            <h3 id="advisory-status" className="sr-only">Current category</h3>
            <CategoryBadge index={advisory.aqi} label={advisory.category} size="md" />
            <p className="text-xs text-slate-500 mt-1">{advisory.naqiLabel}</p>
            <DataFreshness referenceTime={advisory.referenceTime} retrievedAt={advisory.provenance.airQuality.retrievedAt} timeZone={city.timezone} />
          </div>
        </div>

        <div className="p-5 border-b border-slate-100">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ShieldCheck size={15} className="text-brand-600" aria-hidden="true" /> Official CPCB health statement
          </h4>
          {advisory.healthStatement ? (
            <blockquote className="mt-2 border-l-4 pl-3 text-sm text-slate-800 leading-relaxed" style={{ borderColor: aqiColor(advisory.aqi) }}>
              {advisory.healthStatement}
            </blockquote>
          ) : (
            <p className="mt-2 text-sm text-amber-700">{advisory.healthAdvisory}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">Quoted from {advisory.healthStatementSource}. Shown in English.</p>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Languages size={15} className="text-brand-600" aria-hidden="true" /> Precautionary guidance
            </h4>
            <div className="segmented" role="group" aria-label="Guidance language">
              {LANGUAGES.map(l => (
                <button key={l.code} type="button" lang={l.code} aria-pressed={language === l.code} onClick={() => setLanguage(l.code)} title={l.label}>
                  {l.native}
                </button>
              ))}
            </div>
          </div>
          <p lang={guidanceLang} className="mt-3 text-base text-slate-800 leading-relaxed">{guidanceText}</p>
          {guidanceLang !== language && (
            <p className="text-xs text-amber-700 mt-1">No {LANGUAGES.find(l => l.code === language)?.label} translation is available for this message; shown in English.</p>
          )}
          <p className="text-xs text-slate-500 mt-2">{advisory.multilingualNote} Translations are the project’s own, not official CPCB translations.</p>
        </div>
      </section>

      <section className="panel p-5" aria-labelledby="profile-heading">
        <h3 id="profile-heading" className="text-sm font-semibold text-slate-800">Precautions for your situation</h3>
        <p className="text-xs text-slate-500 mt-0.5">General precautions from a fixed lookup table (English only). Not CPCB text and not medical advice.</p>
        <div className="segmented mt-3" role="group" aria-label="Profile">
          {PROFILES.map(p => (
            <button key={p.id} type="button" aria-pressed={profile === p.id} onClick={() => setProfile(p.id)} title={p.description}>
              {p.label}
            </button>
          ))}
        </div>
        {profileGuidance && <p className="mt-3 text-sm text-slate-700">{profileGuidance.summary}</p>}
        {advisory.category === null ? (
          <p className="mt-3 text-sm text-slate-600">No category is available, so no category-specific precautions are shown.</p>
        ) : precautions.length ? (
          <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            {precautions.map(p => (
              <li key={p} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{p}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">No special precautions for this category.</p>
        )}
        {advisory.sensitiveGroups.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-700">Groups most likely to be affected</h4>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {advisory.sensitiveGroups.map(g => (
                <li key={g} className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700">{g}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="panel p-5" aria-labelledby="contacts-heading">
        <h3 id="contacts-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Phone size={15} className="text-slate-500" aria-hidden="true" /> In an emergency
        </h3>
        <ul className="mt-2 space-y-1">
          {advisory.emergencyContacts.map(c => (
            <li key={c.number} className="text-sm text-slate-700">
              {c.label}: <a href={`tel:${c.number}`} className="font-mono font-semibold text-brand-700 underline underline-offset-2">{c.number}</a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mt-2">{advisory.contactsNote}</p>
      </section>

      <p className="flex items-start gap-1.5 text-xs text-slate-500">
        <Info size={12} className="shrink-0 mt-0.5" aria-hidden="true" /> {advisory.disclaimer}
      </p>
    </div>
  );
}
