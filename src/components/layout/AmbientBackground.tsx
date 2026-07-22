import React from 'react';

interface AmbientBackgroundProps {
  variant?: 'intro' | 'dashboard';
}

/**
 * Minimal ambient background effect.
 * - 'intro': Static dark gradient (no animations, no particles, no SVG)
 * - 'dashboard': Static subtle blue gradient
 * Both variants are GPU-friendly — no animations, no extra DOM nodes, no canvas.
 */
export default function AmbientBackground({ variant = 'intro' }: AmbientBackgroundProps) {
  if (variant === 'dashboard') {
    return <div className="dashboard-ambient" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 intro-gradient" aria-hidden="true" />
  );
}
