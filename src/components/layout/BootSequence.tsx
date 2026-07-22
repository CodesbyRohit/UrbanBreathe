import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getSpeechService } from '../../services/speechService';

const STATUS_LINES: {
  displayText: string;
  speechText?: string;
  delay: number;
}[] = [
  {
    displayText: 'INITIALIZING URBANBREATHE...',
    speechText: 'Initializing UrbanBreathe.',
    delay: 200,
  },
  {
    displayText: 'CONNECTING TO ATMOSPHERIC SENSORS ACROSS 10 CITIES...',
    speechText: 'Connecting to atmospheric sensors across 10 cities.',
    delay: 600,
  },
  {
    displayText: 'SOURCE CONTRIBUTION ANALYSIS ENGINE: ONLINE',
    speechText: 'Source contribution analysis engine, online.',
    delay: 1100,
  },
  {
    displayText: 'ANOMALY DETECTION: CALIBRATED',
    speechText: 'Anomaly detection, calibrated.',
    delay: 1500,
  },
  {
    displayText: 'WELCOME, COMMANDER.',
    speechText: 'Welcome, commander.',
    delay: 2000,
  },
];

const STORAGE_KEY = 'urbanbreathe_boot_played';
const VOICE_MUTED_KEY = 'urbanbreathe_voice_muted';

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [typewriterChars, setTypewriterChars] = useState<number[]>([]);
  const [fadingOut, setFadingOut] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const typewriterCharsRef = useRef<number[]>([]);
  const spokenLinesRef = useRef<Set<number>>(new Set());
  const audioInitRef = useRef(false);
  const completedRef = useRef(false);

  // Check if already played this session
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const played = sessionStorage.getItem(STORAGE_KEY);
    if (played) {
      setShouldShow(false);
      onComplete();
      return;
    }
  }, [onComplete]);

  // ─── Speech Synthesis ──────────────────────────────────────────────────────

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(() => {
    const stored = sessionStorage.getItem(VOICE_MUTED_KEY);
    if (stored !== null) return stored === 'true';
    // If the speech service was initialised earlier (via InitGate), default to ON
    if (getSpeechService().initialized) return false;
    return true;
  });
  const voiceMutedRef = useRef(voiceMuted);
  voiceMutedRef.current = voiceMuted;

  useEffect(() => {
    setVoiceSupported(getSpeechService().supported);
  }, []);

  // Speak the given index's line — always cancels first, never reuses objects.
  async function speakLine(index: number) {
    if (voiceMutedRef.current) return;
    if (spokenLinesRef.current.has(index)) return;
    spokenLinesRef.current.add(index);

    const line = STATUS_LINES[index];
    await getSpeechService().speak(line.speechText ?? line.displayText);
  }

  // Toggle voice on/off.
  const toggleVoice = useCallback(() => {
    const willMute = !voiceMuted;
    setVoiceMuted(willMute);
    sessionStorage.setItem(VOICE_MUTED_KEY, String(willMute));
    voiceMutedRef.current = willMute;

    if (willMute) {
      getSpeechService().cancel();
    } else {
      // Unmuting: queue any completed lines that haven't been spoken yet.
      for (let i = 0; i < STATUS_LINES.length; i++) {
        const chars = typewriterChars[i] ?? 0;
        if (chars >= STATUS_LINES[i].displayText.length && !spokenLinesRef.current.has(i)) {
          speakLine(i);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMuted, typewriterChars]);

  // ─── Animation Logic ───────────────────────────────────────────────────────

  // Animate status lines
  useEffect(() => {
    if (!shouldShow) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    STATUS_LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
        // Start typewriter effect
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          charIndex++;
          setTypewriterChars(prev => {
            const updated = [...prev];
            updated[index] = charIndex;
            return updated;
          });
          typewriterCharsRef.current[index] = charIndex;
          if (charIndex >= line.displayText.length) {
            clearInterval(typeInterval);
            // Speak completed line
            speakLine(index);
          }
        }, 20);
        timers.push(typeInterval as unknown as ReturnType<typeof setTimeout>);
      }, line.delay);
      timers.push(timer);
    });

    // Auto-complete after all lines shown
    const completeTimer = setTimeout(() => {
      handleComplete();
    }, 2700);
    timers.push(completeTimer);

    return () => timers.forEach(t => clearTimeout(t));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  // Rotating ring animation
  useEffect(() => {
    if (!shouldShow || !ringRef.current) return;
    let startTime: number | null = null;
    const duration = 2500;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const circumference = 2 * Math.PI * 48;
      const offset = circumference - (progress * circumference);
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(offset);
      }
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [shouldShow]);

  const handleComplete = () => {
    if (skipped || completedRef.current) return;
    completedRef.current = true;
    setFadingOut(true);
    setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      onComplete();
    }, 500);
  };

  const handleSkip = () => {
    if (skipped || fadingOut) return;
    setSkipped(true);
    // Immediately cancel any in-progress speech
    getSpeechService().cancel();
    sessionStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  };

  // ─── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      getSpeechService().cancel();
    };
  }, []);

  if (!shouldShow) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleSkip}
      role="dialog"
      aria-label="System boot sequence"
    >
      {/* Scanning lines effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="w-full h-px bg-white animate-scan-line" />
      </div>

      {/* Rotating HUD Ring */}
      <div className="relative mb-12" aria-hidden="true">
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-pulse-soft">
          {/* Outer ring */}
          <circle
            cx="60" cy="60" r="48"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Animated ring segment */}
          <circle
            ref={ringRef}
            cx="60" cy="60" r="48"
            fill="none"
            stroke="#3b91e8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 48}`}
            strokeDashoffset={`${2 * Math.PI * 48}`}
            transform="rotate(-90 60 60)"
            style={{ filter: 'drop-shadow(0 0 6px rgba(59, 145, 232, 0.5))' }}
          />
          {/* Inner decorative dots */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <circle
              key={i}
              cx={60 + 40 * Math.cos((angle * Math.PI) / 180)}
              cy={60 + 40 * Math.sin((angle * Math.PI) / 180)}
              r="2"
              fill="#3b91e8"
              opacity={0.6}
            />
          ))}
          {/* Center dot */}
          <circle cx="60" cy="60" r="3" fill="#3b91e8" opacity={0.8} />
        </svg>
      </div>

      {/* Status Lines */}
      <div className="space-y-3 font-mono text-sm">
        {STATUS_LINES.map((line, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ${
              visibleLines.includes(index)
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-4'
            }`}
          >
            {visibleLines.includes(index) && (
              <span className="flex items-center gap-2">
                <span className="text-brand-400">
                  {line.displayText.substring(0, typewriterChars[index] || 0)}
                  {(typewriterChars[index] || 0) < line.displayText.length && (
                    <span className="inline-block w-2 h-4 bg-brand-400 animate-pulse ml-0.5 align-middle" />
                  )}
                </span>
                {typewriterChars[index] >= line.displayText.length && (
                  <span className="text-teal-400 text-xs">[OK]</span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bottom controls: skip hint + voice toggle */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-6 md:bottom-8 flex items-center gap-3">
        {/* Skip hint */}
        <p className="text-[11px] text-slate-600 font-mono animate-fade-in px-4 py-2 bg-slate-900/80 rounded-full backdrop-blur-sm whitespace-nowrap" style={{ animationDelay: '1.5s' }}>
          Tap or press any key to skip
        </p>

        {/* Voice toggle — only shown if Web Speech API is supported */}
        {voiceSupported && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // don't trigger skip
              toggleVoice();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-mono backdrop-blur-sm transition-all duration-200 ${
              voiceMuted
                ? 'bg-slate-900/80 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80'
                : 'bg-brand-900/60 text-brand-300 hover:text-brand-200 hover:bg-brand-800/60'
            }`}
            aria-label={voiceMuted ? 'Enable voice briefing' : 'Mute voice briefing'}
            title={voiceMuted ? 'Enable voice briefing' : 'Mute voice briefing'}
          >
            {voiceMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
