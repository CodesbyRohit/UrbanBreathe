import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import { getSpeechService } from '../../services/speechService';
import AmbientBackground from './AmbientBackground';

const SYSTEM_MODULES = [
  { label: 'Satellite Network', status: 'CONNECTED', delay: 300 },
  { label: 'AQI Sensors', status: 'ONLINE', delay: 700 },
  { label: 'Weather Models', status: 'SYNCED', delay: 1100 },
  { label: 'Forecast Engine', status: 'ACTIVE', delay: 1500 },
  { label: 'Decision Intelligence', status: 'INITIALIZED', delay: 1900 },
  { label: 'Emergency Network', status: 'STANDBY', delay: 2300 },
  { label: 'Smart City Nodes', status: 'LINKED', delay: 2700 },
  { label: 'Citizen Advisory', status: 'READY', delay: 3100 },
];

const BOOT_DURATION = 3700;
const FADE_DURATION = 800;
const VOICE_MUTED_KEY = 'urbanbreathe_voice_muted';

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [bootPhase, setBootPhase] = useState<'initial' | 'running' | 'completing'>('running');
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ─── Voice: ALWAYS default to unmuted on every fresh load ───────────────

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(() => {
    const stored = sessionStorage.getItem(VOICE_MUTED_KEY);
    if (stored !== null) return stored === 'true';
    return false; // Always unmuted by default
  });
  const voiceMutedRef = useRef(voiceMuted);
  voiceMutedRef.current = voiceMuted;

  useEffect(() => {
    setVoiceSupported(getSpeechService().supported);
  }, []);

  // ─── Boot Sequence (no sessionStorage caching — plays every time) ───────
  // Note: The welcome message ("Initializing UrbanBreathe command centre.")
  // is spoken in InitGate's init() call, which happens synchronously inside
  // the user gesture. This means subsequent async speak() calls here will
  // work because Chrome's audio pipeline is already unlocked.

  useEffect(() => {
    if (completedRef.current) return;
    setBootPhase('running');

    SYSTEM_MODULES.forEach((mod, index) => {
      const timer = setTimeout(() => {
        setActiveModule(index);
        const completeTimer = setTimeout(() => {
          setCompletedModules(prev => [...prev, index]);
          setProgress(((index + 1) / SYSTEM_MODULES.length) * 100);
          setActiveModule(null);

          // Speak module status
          if (!voiceMutedRef.current) {
            getSpeechService().speak(`${mod.label} ${mod.status}`);
          }
        }, 200);
        timersRef.current.push(completeTimer);
      }, mod.delay);
      timersRef.current.push(timer);
    });

    const completeTimer = setTimeout(() => handleComplete(), BOOT_DURATION);
    timersRef.current.push(completeTimer);

    return () => timersRef.current.forEach(t => clearTimeout(t));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setBootPhase('completing');

    if (!voiceMutedRef.current) {
      getSpeechService().speak('Welcome, commander.');
    }

    setTimeout(() => onComplete(), FADE_DURATION);
  };

  const handleSkip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    getSpeechService().cancel();
    onComplete();
  };

  const toggleVoice = useCallback(() => {
    const willMute = !voiceMuted;
    setVoiceMuted(willMute);
    sessionStorage.setItem(VOICE_MUTED_KEY, String(willMute));
    voiceMutedRef.current = willMute;
    if (willMute) getSpeechService().cancel();
  }, [voiceMuted]);

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      getSpeechService().cancel();
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none transition-opacity duration-${FADE_DURATION} ${
        bootPhase === 'completing' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleSkip}
      role="dialog"
      aria-label="System boot sequence"
    >
      {/* Background */}
      <AmbientBackground variant="intro" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6" onClick={(e) => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="w-full mb-10">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
            <span>INITIALIZING</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-px bg-slate-800 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* System modules */}
        <div className="w-full space-y-0">
          {SYSTEM_MODULES.map((mod, index) => {
            const isCompleted = completedModules.includes(index);
            const isActive = activeModule === index;
            const isPending = !isCompleted && !isActive;

            return (
              <div
                key={mod.label}
                className={`
                  flex items-center justify-between py-2 px-3 rounded-lg
                  transition-all duration-300
                  ${isCompleted
                    ? 'text-slate-300 opacity-100'
                    : isActive
                      ? 'text-brand-300 bg-brand-950/30'
                      : 'text-slate-700 opacity-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      w-2 h-2 rounded-full shrink-0
                      transition-all duration-300
                      ${isCompleted
                        ? 'bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.5)]'
                        : isActive
                          ? 'bg-brand-400 animate-pulse-soft'
                          : 'bg-slate-700'
                      }
                    `}
                  />
                  <span className={`text-sm font-mono tracking-wide ${isActive ? 'animate-pulse-soft' : ''}`}>
                    {mod.label}
                  </span>
                </div>
                <span
                  className={`
                    text-[10px] font-mono tracking-wider
                    transition-all duration-300
                    ${isCompleted ? 'text-teal-400' : isActive ? 'text-brand-400' : 'text-slate-700'}
                  `}
                >
                  {isCompleted ? mod.status : isActive ? '▼' : '○'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom controls */}
        <div className="w-full flex items-center justify-between mt-10">
          {voiceSupported && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono
                transition-all duration-200 backdrop-blur-sm
                ${voiceMuted
                  ? 'text-slate-600 hover:text-slate-400 bg-slate-900/50'
                  : 'text-brand-400 bg-brand-950/30 hover:bg-brand-950/50'
                }
              `}
              aria-label={voiceMuted ? 'Enable voice' : 'Mute voice'}
            >
              {voiceMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              <span>{voiceMuted ? 'MUTED' : 'VOICE ON'}</span>
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); handleSkip(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono text-slate-600 hover:text-slate-400 bg-slate-900/50 hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
            aria-label="Skip boot sequence"
          >
            <SkipForward size={12} />
            <span>SKIP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
