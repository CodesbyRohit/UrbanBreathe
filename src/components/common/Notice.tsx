import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface NoticeProps {
  tone?: 'caution' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Inline note for limitations and caveats (role="note", not an alert). */
export default function Notice({ tone = 'info', title, children, className = '' }: NoticeProps) {
  const Icon = tone === 'caution' ? AlertTriangle : Info;
  return (
    <div className={`notice notice-${tone} ${className}`} role="note">
      <Icon size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}
