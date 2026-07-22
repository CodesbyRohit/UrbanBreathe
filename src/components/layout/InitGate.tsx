import React, { useEffect, useState, useRef } from 'react';
import { getSpeechService } from '../../services/speechService';

const STORAGE_KEY = 'urbanbreathe_boot_played';

interface InitGateProps {
  onTap: () => void;
}

export default function InitGate({ onTap }: InitGateProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const tappedRef = useRef(false);

  // If boot has already played this session, skip the gate immediately
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      onTap();
    }
  }, [onTap]);

  const handleTap = () => {
    if (fadingOut || tappedRef.current) return;
    tappedRef.current = true;

    // Initialise the speech engine synchronously inside the user gesture.
    // This primes Chrome's speech engine and begins loading voices so that
    // BootSequence's timer-driven speak() calls work reliably.
    getSpeechService().init();

    setFadingOut(true);
    setTimeout(() => {
      onTap();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 cursor-pointer transition-opacity duration-200 select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleTap}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTap(); }}
      role="button"
      tabIndex={0}
      aria-label="INITIALIZE SYSTEM — Tap anywhere to begin"
    >
      {/* Scanning lines effect — matching BootSequence */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="w-full h-px bg-white animate-scan-line" />
      </div>

      {/* Command centre radar icon */}
      <div className="relative mb-8" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" className="animate-pulse-soft">
          {/* Concentric rings — command centre aesthetic */}
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <circle
            cx="32" cy="32" r="20"
            fill="none"
            stroke="#3b91e8"
            strokeWidth="1.5"
            opacity={0.6}
          />
          <circle
            cx="32" cy="32" r="10"
            fill="none"
            stroke="#3b91e8"
            strokeWidth="1"
            opacity={0.3}
          />
          {/* Center dot */}
          <circle cx="32" cy="32" r="3" fill="#3b91e8" opacity={0.8} />
        </svg>
      </div>

      {/* Initialize prompt */}
      <div className="font-mono text-center">
        <p className="text-sm text-brand-400 tracking-[0.15em] animate-pulse-soft">
          [ INITIALIZE SYSTEM ]
        </p>
        <p className="text-[10px] text-slate-600 mt-4 tracking-wider">
          TAP ANYWHERE TO BEGIN
        </p>
      </div>
    </div>
  );
}
