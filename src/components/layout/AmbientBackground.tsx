import React, { useMemo } from 'react';

interface AmbientBackgroundProps {
  variant?: 'intro' | 'dashboard';
}

/**
 * GPU-friendly ambient background effect.
 * Uses CSS transforms and opacity transitions — no canvas, no heavy JS.
 * Two variants: 'intro' (dark, with grid + particles) and 'dashboard' (subtle gradients).
 */
export default function AmbientBackground({ variant = 'intro' }: AmbientBackgroundProps) {
  // Generate stable particle positions (memoized once)
  const particles = useMemo(() => {
    if (variant !== 'intro') return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${(i * 3.3 + 7) % 100}%`,
      top: `${(i * 7.1 + 3) % 100}%`,
      delay: `${(i * 0.4) % 4}s`,
      duration: `${6 + (i % 5) * 2}s`,
      size: i % 3 === 0 ? 3 : 2,
      opacity: 0.2 + (i % 5) * 0.1,
    }));
  }, [variant]);

  if (variant === 'dashboard') {
    return <div className="dashboard-ambient" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 intro-gradient scan-overlay" aria-hidden="true">
      {/* Moving grid */}
      <div className="absolute inset-0 grid-overlay opacity-50 animate-grid-scroll" />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `particleFloat ${p.duration} ${p.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Digital Earth glow */}
      <div
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(59, 145, 232, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(59, 145, 232, 0.03) 0%, transparent 30%)
          `,
          animation: 'glowPulse 4s ease-in-out infinite',
        }}
      />

      {/* City network connections (decorative arcs) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Horizontal scan line */}
        <line x1="0" y1="300" x2="800" y2="300" stroke="#3b91e8" strokeWidth="0.5" className="city-line" style={{ animationDelay: '0.5s' }} />
        {/* Vertical scan line */}
        <line x1="400" y1="0" x2="400" y2="600" stroke="#3b91e8" strokeWidth="0.5" className="city-line" style={{ animationDelay: '1s' }} />
        {/* Diagonal connections */}
        <line x1="100" y1="100" x2="700" y2="500" stroke="#3b91e8" strokeWidth="0.3" className="city-line" style={{ animationDelay: '1.5s' }} />
        <line x1="700" y1="100" x2="100" y2="500" stroke="#3b91e8" strokeWidth="0.3" className="city-line" style={{ animationDelay: '2s' }} />
        {/* Arc */}
        <path d="M 200 400 Q 400 200 600 400" fill="none" stroke="#3b91e8" strokeWidth="0.4" className="city-line" style={{ animationDelay: '2.5s' }} />
        <path d="M 300 150 Q 400 300 500 150" fill="none" stroke="#3b91e8" strokeWidth="0.4" className="city-line" style={{ animationDelay: '3s' }} />
      </svg>
    </div>
  );
}
