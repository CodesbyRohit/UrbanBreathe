import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const STATUS_LINES = [
  { text: 'INITIALIZING URBANBREATHE...', delay: 200 },
  { text: 'CONNECTING TO ATMOSPHERIC SENSORS ACROSS 10 CITIES...', delay: 600 },
  { text: 'AI SOURCE ATTRIBUTION ENGINE: ONLINE', delay: 1100 },
  { text: 'ANOMALY DETECTION: CALIBRATED', delay: 1500 },
  { text: 'WELCOME, COMMANDER.', delay: 2000 },
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
    // If user manually toggled mute before, respect it
    if (stored !== null) return stored === 'true';
    // If audio was pre-unlocked by the Enter Command Centre click, default to ON
    if (sessionStorage.getItem('urbanbreathe_audio_unlocked') === 'true') return false;
    // First visit — start muted; the user can unmute via the toggle
    return true;
  });
  const voiceMutedRef = useRef(voiceMuted);
  voiceMutedRef.current = voiceMuted;
  const spokenLinesRef = useRef<Set<number>>(new Set());

  // Detect Web Speech API support & prime Chrome's async voice loading
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setVoiceSupported(supported);
    if (!supported) return;

    // Chrome populates voices asynchronously; the first getVoices() call
    // returns empty. Calling it once from mount and listening for
    // 'voiceschanged' ensures voices are loaded by the time the user
    // interacts with the voice toggle.
    window.speechSynthesis.getVoices();
    const onVoicesChanged = () => {
      // read once to populate Chrome's internal cache; buildUtterance
      // calls getVoices() directly for fresh results each time
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
    };
  }, []);

  // Build utterance with preferred calm voice
  function buildUtterance(text: string): SpeechSynthesisUtterance {
    const clean = text.replace(/\.{3,}$/g, '.');
    // Leading space prevents Chrome TTS from clipping/stuttering the first
    // syllable on cold-start — the engine 'warms up' on the space before
    // reaching the real word, avoiding the letter-by-letter sound.
    const utterance = new SpeechSynthesisUtterance(` ${clean}`);
    utterance.rate = 0.92;
    utterance.pitch = 0.85;
    utterance.volume = 1;
    // Read voices directly each time (Chrome populates async)
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.name.toLowerCase().includes('google uk english male')) ??
      voices.find(v => v.name.toLowerCase().includes('male')) ??
      voices.find(v =>
        ['david', 'daniel', 'james', 'mark'].some(n => v.name.toLowerCase().includes(n))
      ) ??
      voices[0];
    if (preferred) utterance.voice = preferred;
    return utterance;
  }

  // Speak the given index's line if it has completed typing and hasn't been spoken yet.
  // Called DIRECTLY from animation timers (typewriter completion).
  function speakLineIfCompleted(index: number) {
    if (voiceMutedRef.current) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const chars = typewriterCharsRef.current[index] ?? 0;
    if (chars >= STATUS_LINES[index].text.length && !spokenLinesRef.current.has(index)) {
      spokenLinesRef.current.add(index);
      window.speechSynthesis.speak(buildUtterance(STATUS_LINES[index].text));
    }
  }

  // Toggle voice — speaks DIRECTLY in click handler so cancel() + speak()
  // happen synchronously within the user gesture context.
  const toggleVoice = useCallback(() => {
    const willMute = !voiceMuted;
    setVoiceMuted(willMute);
    sessionStorage.setItem(VOICE_MUTED_KEY, String(willMute));
    voiceMutedRef.current = willMute;

    if (willMute) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      // Unmuting: queue completed lines. No cancel() here — the speech
      // queue is already empty (was cancelled on mute). A cancel() here
      // would race with the new speak() calls and can swallow audio.
      for (let i = 0; i < STATUS_LINES.length; i++) {
        const chars = typewriterChars[i] ?? 0;
        if (chars >= STATUS_LINES[i].text.length && !spokenLinesRef.current.has(i)) {
          spokenLinesRef.current.add(i);
          window.speechSynthesis.speak(buildUtterance(STATUS_LINES[i].text));
        }
      }
    }
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
          if (charIndex >= line.text.length) {
            clearInterval(typeInterval);
            // Speak completed line directly from timer callback
            speakLineIfCompleted(index);
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
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [shouldShow]);

  const handleComplete = () => {
    if (skipped) return;
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    sessionStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  };

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
                  {line.text.substring(0, typewriterChars[index] || 0)}
                  {(typewriterChars[index] || 0) < line.text.length && (
                    <span className="inline-block w-2 h-4 bg-brand-400 animate-pulse ml-0.5 align-middle" />
                  )}
                </span>
                {typewriterChars[index] >= line.text.length && (
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
