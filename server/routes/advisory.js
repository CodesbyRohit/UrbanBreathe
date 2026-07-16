import { Router } from 'express';
import { getAQICategory, getHealthAdvisory } from '../utils/calculations.js';
import { getFallbackData } from '../services/openMeteoService.js';

const router = Router();

const ADVISORY_LEVELS = {
  Good: { color: '#16a34a', icon: 'check-circle', precautions: [], sensitive: [] },
  Satisfactory: { color: '#65a30d', icon: 'alert-circle', precautions: ['Monitor any symptoms'], sensitive: ['Children', 'Elderly'] },
  Moderate: { color: '#eab308', icon: 'alert-triangle', precautions: ['Reduce prolonged outdoor exertion', 'Close windows during peak hours'], sensitive: ['Children', 'Elderly', 'Asthma patients'] },
  Poor: { color: '#f97316', icon: 'alert-triangle', precautions: ['Avoid prolonged outdoor activity', 'Wear N95 masks outdoors', 'Use air purifiers indoors'], sensitive: ['Children', 'Elderly', 'Pregnant women', 'Heart patients'] },
  'Very Poor': { color: '#ef4444', icon: 'x-circle', precautions: ['Avoid all outdoor physical activity', 'Keep windows sealed', 'Run air purifiers at max', 'Wear N95 masks if outdoors'], sensitive: ['General population', 'Children', 'Elderly', 'All vulnerable groups'] },
  Severe: { color: '#7c3aed', icon: 'x-circle', precautions: ['Stay indoors', 'Use HEPA purifiers', 'Seek medical help if symptomatic', 'Avoid any outdoor movement'], sensitive: ['ALL POPULATION GROUPS'] },
};

router.get('/:cityId', (req, res) => {
  try {
    const { cityId } = req.params;
    const data = getFallbackData(cityId);
    const category = getAQICategory(data.pm25 ? Math.min(500, Math.round(data.pm25 * 1.5)) : 150);
    const advisory = {
      cityId,
      aqi: data.pm25 ? Math.min(500, Math.round(data.pm25 * 1.5)) : 150,
      category: category.label,
      color: category.color,
      healthAdvisory: getHealthAdvisory(category.label),
      level: ADVISORY_LEVELS[category.label] || ADVISORY_LEVELS.Moderate,
      precautions: ADVISORY_LEVELS[category.label]?.precautions || [],
      sensitiveGroups: ADVISORY_LEVELS[category.label]?.sensitive || [],
      multilingual: {
        hi: getHindiAdvisory(category.label),
        bn: getBengaliAdvisory(category.label),
        te: getTeluguAdvisory(category.label),
      },
      emergency: data.aqi > 300 ? {
        active: true,
        message: 'HEALTH EMERGENCY — Severe air quality detected. Government has activated emergency protocols.',
        helpline: '1800-XXX-XXXX',
      } : { active: false },
    };
    res.json(advisory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getHindiAdvisory(category) {
  const map = {
    Good: 'वायु गुणवत्ता संतोषजनक है। किसी सावधानी की आवश्यकता नहीं है।',
    Satisfactory: 'वायु गुणवत्ता स्वीकार्य है। संवेदनशील व्यक्ति लक्षणों पर नज़र रखें।',
    Moderate: 'लंबे समय तक बाहरी गतिविधि कम करें। व्यस्त समय में खिड़कियां बंद रखें।',
    Poor: 'बाहरी गतिविधि से बचें। बाहर N95 मास्क पहनें। घर में एयर प्यूरीफायर का उपयोग करें।',
    'Very Poor': 'सभी बाहरी शारीरिक गतिविधि से बचें। खिड़कियां बंद रखें। एयर प्यूरीफायर चलाएं।',
    Severe: 'स्वास्थ्य आपातकाल। घर के अंदर रहें। HEPA प्यूरीफायर का उपयोग करें। लक्षण दिखने पर चिकित्सा सहायता लें।',
  };
  return map[category] || map.Moderate;
}

function getBengaliAdvisory(category) {
  const map = {
    Good: 'বাতাসের মান সন্তোষজনক। কোনো সতর্কতার প্রয়োজন নেই।',
    Satisfactory: 'বাতাসের মান গ্রহণযোগ্য। সংবেদনশীল ব্যক্তিরা লক্ষণগুলি পর্যবেক্ষণ করুন।',
    Moderate: 'দীর্ঘক্ষণ বাইরে থাকা কমিয়ে দিন। ব্যস্ত সময়ে জানালা বন্ধ রাখুন।',
    Poor: 'বাইরে যাওয়া এড়িয়ে চলুন। বাইরে N95 মাস্ক পরুন। বাড়িতে এয়ার পিউরিফায়ার ব্যবহার করুন।',
    'Very Poor': 'বাইরের যেকোনো শারীরিক কার্যকলাপ এড়িয়ে চলুন। জানালা বন্ধ রাখুন।',
    Severe: 'স্বাস্থ্য জরুরি অবস্থা। বাড়ির ভিতরে থাকুন। HEPA পিউরিফায়ার ব্যবহার করুন।',
  };
  return map[category] || map.Moderate;
}

function getTeluguAdvisory(category) {
  const map = {
    Good: 'గాలి నాణ్యత సంతృప్తికరంగా ఉంది. ఎలాంటి జాగ్రత్త అవసరం లేదు.',
    Satisfactory: 'గాలి నాణ్యత ఆమోదయోగ్యంగా ఉంది. సున్నితమైన వ్యక్తులు లక్షణాలను పర్యవేక్షించండి.',
    Moderate: 'బయట ఎక్కువసేపు ఉండటం తగ్గించండి. పీక్ అవర్స్లో కిటికీలు మూసివేయండి.',
    Poor: 'బయట కార్యకలాపాలు నివారించండి. N95 మాస్క్ ధరించండి. ఇంట్లో ఎయిర్ ప్యూరిఫైయర్ ఉపయోగించండి.',
    'Very Poor': 'బయట ఎలాంటి శారీరక కార్యకలాపాలు నివారించండి. కిటికీలు మూసివేయండి.',
    Severe: 'ఆరోగ్య అత్యవసర పరిస్థితి. ఇండోర్లో ఉండండి. HEPA ప్యూరిఫైయర్ ఉపయోగించండి.',
  };
  return map[category] || map.Moderate;
}

export default router;
