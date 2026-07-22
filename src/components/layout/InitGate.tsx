import React, { useState, useRef, useCallback } from 'react';
import { getSpeechService } from '../../services/speechService';
import AmbientBackground from './AmbientBackground';

interface InitGateProps {
  onTap: () => void;
}

export default function InitGate({ onTap }: InitGateProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const tappedRef = useRef(false);
  const spokenRef = useRef(false);

  const handleTap = useCallback(() => {
    if (fadingOut || tappedRef.current) return;
    tappedRef.current = true;

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
      <AmbientBackground variant="intro" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Activation ring */}
        <div
          className="holographic-ring flex items-center justify-center mb-10"
          style={{ width: 120, height: 120 }}
        >
          {/* Center dot */}
          <div className="relative flex items-center justify-center" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#1e293b" strokeWidth="1" />
              <circle cx="20" cy="20" r="3" fill="#60aeef" opacity={0.8} />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="font-mono text-center">
          <p className="text-sm text-brand-400 tracking-[0.15em]">
            [ INITIALIZE COMMAND CENTRE ]
          </p>
          <p className="text-[10px] text-slate-500 mt-4 tracking-wider animate-fade-in">
            TAP ANYWHERE TO BEGIN
          </p>
        </div>

        {/* Bottom status */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-slate-700 font-mono tracking-wider animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          SYSTEM STANDBY
        </div>
      </div>
    </div>
  );
}
