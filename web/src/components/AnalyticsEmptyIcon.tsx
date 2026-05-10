import React from 'react';

export const AnalyticsEmptyIcon: React.FC<{ className?: string }> = ({ className = 'h-16 w-16' }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="4" y="40" width="12" height="20" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="20" y="28" width="12" height="32" rx="2" fill="currentColor" opacity="0.25" />
    <rect x="36" y="16" width="12" height="44" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="52" y="8" width="8" height="52" rx="2" fill="currentColor" opacity="0.1" />
    <line x1="4" y1="62" x2="60" y2="62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
  </svg>
);
