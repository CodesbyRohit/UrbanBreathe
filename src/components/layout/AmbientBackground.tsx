import React from 'react';

/** Static dark gradient behind the optional presentation intro (no animation). */
export default function AmbientBackground() {
  return <div className="absolute inset-0 intro-gradient" aria-hidden="true" />;
}
