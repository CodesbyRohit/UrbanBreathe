import React, { useState, useRef, useCallback } from 'react';
import { getSpeechService } from '../../services/speechService';
import AmbientBackground from './AmbientBackground';

interface InitGateProps {
  onTap: () => void;
}

export default function InitGate({ onTap }: InitGateProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tappedRef = useRef(false);
  const spokenRef = useRef(false);

  const handleTap = useCallback(() => {
    if (fadingOut || tappedRef.current) return;
    tappedRef.current = true;

    // Initialise speech engine inside user gesture.
    // Pass the welcome text so it's spoken SYNCHRONOUSLY within the gesture.
    // This is critical for Chrome Incognito where voice data is not cached
    // and an async speak() would fire outside the gesture — Chrome silently
    // blocks non-gesture speech.
    if (!spokenRef.current) {
      spokenRef.current = true;
      getSpeechService().init('Initializing UrbanBreathe command centre.');
    } else {
      getSpeechService().init();
    }

    setFadingOut(true);
    setTimeout(() => onTap(), 600);
  }, [fadingOut, onTap]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !fadingOut && !tappedRef.current) {
      tappedRef.current = true;
      if (!spokenRef.current) {
        spokenRef.current = true;
        getSpeechService().init('Initializing UrbanBreathe command centre.');
      } else {
        getSpeechService().init();
      }
      setFadingOut(true);
      setTimeout(() => onTap(), 600);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ cursor: fadingOut ? 'default' : 'pointer' }}
      onClick={handleTap}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="INITIALIZE COMMAND CENTRE"
    >
      {/* Immersive background */}
      <AmbientBackground variant="intro" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Holographic ring button */}
        <div
          className="holographic-ring flex items-center justify-center mb-10"
          style={{ width: 140, height: 140 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-full transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle, ${
                hovered
                  ? 'rgba(59, 145, 232, 0.15) 0%, rgba(59, 145, 232, 0.05) 50%, transparent 70%'
                  : 'rgba(59, 145, 232, 0.08) 0%, transparent 60%'
              })`,
              transition: 'background 0.3s ease',
            }}
          />

          {/* Center SVG — animated radar rings */}
          <div className="relative flex items-center justify-center" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" className="animate-float">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#1e293b" strokeWidth="1" />
              <circle
                cx="28" cy="28" r="16"
                fill="none"
                stroke="#3b91e8"
                strokeWidth="1.5"
                opacity={0.6}
                className="animate-spin-slow"
                style={{ transformOrigin: 'center' }}
              />
              <circle cx="28" cy="28" r="8" fill="none" stroke="#3b91e8" strokeWidth="1" opacity={0.3} />
              <circle cx="28" cy="28" r="3" fill="#60aeef" opacity={0.9}>
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>

        {/* Title text */}
        <div className="font-mono text-center">
          <p className="text-sm text-brand-400 tracking-[0.15em] animate-pulse-soft">
            [ INITIALIZE COMMAND CENTRE ]
          </p>
          <p className="text-[10px] text-slate-500 mt-4 tracking-wider animate-fade-in" style={{ animationDelay: '0.5s' }}>
            TAP ANYWHERE TO BEGIN
          </p>
        </div>

        {/* Bottom status */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-slate-700 font-mono tracking-wider animate-fade-in" style={{ animationDelay: '1s' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse-soft" />
          SYSTEM STANDBY
        </div>
      </div>
    </div>
  );
}
