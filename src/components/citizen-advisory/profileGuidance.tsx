// Profile-specific general precautions: a transparent lookup table (profile +
// CPCB category), written for this project. Not CPCB text, not AI-generated and
// not medical advice; shown in English only.

import React from 'react';
import { User, Baby, Wind, HardHat, Heart } from 'lucide-react';

export type ProfileKey = 'general' | 'child_elderly' | 'respiratory' | 'outdoor_worker' | 'fitness';

export interface ProfileConfig {
  id: ProfileKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const PROFILES: ProfileConfig[] = [
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
export function getProfileGuidance(profile: ProfileKey, category: string | null): { summary: string; precautions: string[] } | null {
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
