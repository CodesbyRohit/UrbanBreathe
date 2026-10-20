import React from 'react';
import { RefreshCw, CloudOff } from 'lucide-react';

/** Placeholder blocks shown while a view loads. */
export function LoadingPanel({ label = 'Loading…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="panel p-5" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="skeleton w-48 h-4 mb-4" aria-hidden="true" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton w-full h-14 mb-3 last:mb-0" aria-hidden="true" />
      ))}
    </div>
  );
}

interface ErrorPanelProps {
  title?: string;
  message: string | null;
  onRetry?: () => void;
}

/** Failure state: says what failed and that nothing was substituted. */
export function ErrorPanel({ title = 'Data unavailable', message, onRetry }: ErrorPanelProps) {
  return (
    <div className="panel p-8 flex flex-col items-center text-center gap-2" role="alert">
      <CloudOff size={28} className="text-slate-400" aria-hidden="true" />
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-sm text-slate-600 max-w-md">{message || 'The request failed.'}</p>
      <p className="text-xs text-slate-500">No substitute or cached values are shown in its place.</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-2">
          <RefreshCw size={12} aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}

/** Non-blocking banner: a refresh failed but earlier data is still shown. */
export function StaleBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="notice notice-caution items-center" role="status">
      <CloudOff size={14} className="shrink-0" aria-hidden="true" />
      <p className="flex-1">Refresh failed ({message}). Showing the previously loaded values — check their timestamps.</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn-secondary">Retry</button>}
    </div>
  );
}
