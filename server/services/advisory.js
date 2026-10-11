// Citizen advisory built on the NAQI-method estimate.
//
// The previous advisory used AQI = PM2.5 × 1.5 from static values, showed
// placeholder helpline numbers (1800-111-222 / 1800-111-333) as real contacts,
// and could claim "Government has activated emergency protocols". Those are
// removed. The primary health text is CPCB's own statement per category
// (CUPS/82/2014-15, Table 3.12); precautions are general guidance.

import { CPCB_HEALTH_STATEMENTS } from '../domain/naqi.js';
import { describeNaqi, provenanceOf } from './cityAirQuality.js';

export const ADVISORY_LANGUAGES = ['en', 'hi', 'bn', 'te'];

export const CATEGORY_COLORS = {
  Good: '#15803d',
  Satisfactory: '#4d7c0f',
  Moderate: '#854d0e',
  Poor: '#c2410c',
  'Very Poor': '#b91c1c',
  Severe: '#6d28d9',
};
const UNAVAILABLE_COLOR = '#475569';

const PRECAUTIONS = {
  Good: [],
  Satisfactory: ['Sensitive individuals should watch for symptoms'],
  Moderate: ['Reduce prolonged outdoor exertion', 'Close windows during peak traffic hours'],
  Poor: ['Avoid prolonged outdoor activity', 'Wear a well-fitted N95 mask outdoors', 'Use air purifiers indoors if available'],
  'Very Poor': ['Avoid outdoor physical activity', 'Keep windows closed', 'Use air purifiers if available', 'Wear a well-fitted N95 mask if going outdoors'],
  Severe: ['Stay indoors as far as possible', 'Avoid outdoor exertion', 'Use HEPA air purifiers if available', 'Seek medical advice if symptoms appear'],
};

const SENSITIVE_GROUPS = {
  Good: [],
  Satisfactory: ['Children', 'Older adults'],
  Moderate: ['Children', 'Older adults', 'People with asthma or other lung disease', 'People with heart disease'],
  Poor: ['Children', 'Older adults', 'Pregnant women', 'People with heart or lung disease'],
  'Very Poor': ['Everyone on prolonged exposure', 'People with heart or lung disease', 'Children', 'Older adults'],
  Severe: ['Everyone, including healthy people', 'People with heart or lung disease'],
};

// Precautionary guidance per category. Existing project translations; the
// unsupported "health emergency" sentence was removed from the Severe text.
const GUIDANCE = {
  en: {
    Good: 'Air quality is satisfactory. No precautions needed.',
    Satisfactory: 'Air quality is acceptable. Sensitive individuals should monitor symptoms.',
    Moderate: 'Reduce prolonged outdoor exertion. Close windows during peak hours.',
    Poor: 'Avoid prolonged outdoor activity. Wear N95 masks outdoors. Use air purifiers indoors.',
    'Very Poor': 'Avoid all outdoor physical activity. Keep windows sealed. Run air purifiers at max.',
    Severe: 'Stay indoors. Use HEPA purifiers. Seek medical help if symptoms appear.',
  },
  hi: {
    Good: 'वायु गुणवत्ता संतोषजनक है। किसी सावधानी की आवश्यकता नहीं है।',
    Satisfactory: 'वायु गुणवत्ता स्वीकार्य है। संवेदनशील व्यक्ति लक्षणों पर नज़र रखें।',
    Moderate: 'लंबे समय तक बाहरी गतिविधि कम करें। व्यस्त समय में खिड़कियां बंद रखें।',
    Poor: 'बाहरी गतिविधि से बचें। बाहर N95 मास्क पहनें। घर में एयर प्यूरीफायर का उपयोग करें।',
    'Very Poor': 'सभी बाहरी शारीरिक गतिविधि से बचें। खिड़कियां बंद रखें। एयर प्यूरीफायर चलाएं।',
    Severe: 'घर के अंदर रहें। HEPA प्यूरीफायर का उपयोग करें। लक्षण दिखने पर चिकित्सा सहायता लें।',
  },
  bn: {
    Good: 'বাতাসের মান সন্তোষজনক। কোনো সতর্কতার প্রয়োজন নেই।',
    Satisfactory: 'বাতাসের মান গ্রহণযোগ্য। সংবেদনশীল ব্যক্তিরা লক্ষণগুলি পর্যবেক্ষণ করুন।',
    Moderate: 'দীর্ঘক্ষণ বাইরে থাকা কমিয়ে দিন। ব্যস্ত সময়ে জানালা বন্ধ রাখুন।',
    Poor: 'বাইরে যাওয়া এড়িয়ে চলুন। বাইরে N95 মাস্ক পরুন। বাড়িতে এয়ার পিউরিফায়ার ব্যবহার করুন।',
    'Very Poor': 'বাইরের যেকোনো শারীরিক কার্যকলাপ এড়িয়ে চলুন। জানালা বন্ধ রাখুন।',
    Severe: 'বাড়ির ভিতরে থাকুন। HEPA পিউরিফায়ার ব্যবহার করুন।',
  },
  te: {
    Good: 'గాలి నాణ్యత సంతృప్తికరంగా ఉంది. ఎలాంటి జాగ్రత్త అవసరం లేదు.',
    Satisfactory: 'గాలి నాణ్యత ఆమోదయోగ్యంగా ఉంది. సున్నితమైన వ్యక్తులు లక్షణాలను పర్యవేక్షించండి.',
    Moderate: 'బయట ఎక్కువసేపు ఉండటం తగ్గించండి. పీక్ అవర్స్లో కిటికీలు మూసివేయండి.',
    Poor: 'బయట కార్యకలాపాలు నివారించండి. N95 మాస్క్ ధరించండి. ఇంట్లో ఎయిర్ ప్యూరిఫైయర్ ఉపయోగించండి.',
    'Very Poor': 'బయట ఎలాంటి శారీరక కార్యకలాపాలు నివారించండి. కిటికీలు మూసివేయండి.',
    Severe: 'ఇండోర్లో ఉండండి. HEPA ప్యూరిఫైయర్ ఉపయోగించండి.',
  },
};

const INSUFFICIENT_MESSAGE =
  'Not enough valid data to estimate air quality for this city right now. Please check the official CPCB station AQI.';

export const EMERGENCY_CONTACTS = [
  { label: 'National emergency number (ERSS)', number: '112' },
];
export const CONTACTS_NOTE = 'For pollution complaints and local health helplines, check your state or city administration.';

export const ADVISORY_DISCLAIMER =
  'General guidance, not medical advice. Based on a NAQI-method estimate from modelled data — consult the official CPCB station AQI where available.';

export function buildAdvisory(ctx, lang = 'en') {
  const naqi = describeNaqi(ctx);
  const category = naqi.status === 'ok' ? naqi.category : null;
  const multilingual = Object.fromEntries(
    ADVISORY_LANGUAGES.filter(l => l !== 'en').map(l => [l, category ? GUIDANCE[l][category] : null]),
  );

  return {
    cityId: ctx.city.id,
    status: naqi.status,
    reasons: naqi.reasons,
    aqi: naqi.value,
    aqiIsLowerBound: naqi.isLowerBound,
    category,
    naqiLabel: naqi.label,
    color: category ? CATEGORY_COLORS[category] : UNAVAILABLE_COLOR,
    healthStatement: category ? CPCB_HEALTH_STATEMENTS[category] : null,
    healthStatementSource: 'CPCB National Air Quality Index (CUPS/82/2014-15), Table 3.12',
    healthAdvisory: category ? GUIDANCE.en[category] : INSUFFICIENT_MESSAGE,
    lang,
    message: category ? GUIDANCE[lang][category] : (lang === 'en' ? INSUFFICIENT_MESSAGE : null),
    precautions: category ? PRECAUTIONS[category] : [],
    sensitiveGroups: category ? SENSITIVE_GROUPS[category] : [],
    multilingual,
    multilingualNote: 'Translations cover the precautionary guidance only; the CPCB health statement is shown in English.',
    emergencyContacts: EMERGENCY_CONTACTS,
    contactsNote: CONTACTS_NOTE,
    disclaimer: ADVISORY_DISCLAIMER,
    provenance: provenanceOf(ctx),
    generatedAt: ctx.now.toISOString(),
  };
}
