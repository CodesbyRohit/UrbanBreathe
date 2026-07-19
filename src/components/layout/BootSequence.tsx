import React, { useState, useEffect, useRef } from 'react';

const STATUS_LINES = [
  { text: 'INITIALIZING URBANBREATHE...', delay: 200 },
  { text: 'CONNECTING TO ATMOSPHERIC SENSORS ACROSS 10 CITIES...', delay: 600 },
  { text: 'AI SOURCE ATTRIBUTION ENGINE: ONLINE', delay: 1100 },
  { text: 'ANOMALY DETECTION: CALIBRATED', delay: 1500 },
  { text: 'WELCOME, COMMANDER.', delay: 2000 },
];

const STORAGE_KEY = 'urbanbreathe_boot_played';

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
          if (charIndex >= line.text.length) {
            clearInterval(typeInterval);
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
      const rotation = progress * 720;
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

      {/* Skip hint */}
      <p className="absolute bottom-8 text-[11px] text-slate-600 font-mono animate-fade-in" style={{ animationDelay: '1.5s' }}>
        Click anywhere or press any key to skip
      </p>
    </div>
  );
}
