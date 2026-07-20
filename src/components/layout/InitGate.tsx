import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'urbanbreathe_boot_played';
const AUDIO_UNLOCKED_KEY = 'urbanbreathe_audio_unlocked';

interface InitGateProps {
  onTap: () => void;
}

export default function InitGate({ onTap }: InitGateProps) {
  const [fadingOut, setFadingOut] = useState(false);

  // If boot has already played this session, skip the gate immediately
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      onTap();
    }
  }, [onTap]);

  const handleTap = () => {
    if (fadingOut) return;

    // Pre-unlock speechSynthesis so BootSequence voice plays automatically.
    // Must be called synchronously inside a user gesture (this click handler).
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const unlock = new SpeechSynthesisUtterance(' ');
      window.speechSynthesis.speak(unlock);
      window.speechSynthesis.cancel(); // killed before any audio frame is queued
    }
    sessionStorage.setItem(AUDIO_UNLOCKED_KEY, 'true');

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
