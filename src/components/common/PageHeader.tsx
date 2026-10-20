import React from 'react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Badges and actions shown on the right (wrap below on small screens). */
  children?: React.ReactNode;
}

/** Consistent heading block for every view: one h2 per view. */
export default function PageHeader({ icon, title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 no-print">{children}</div>}
    </div>
  );
}
