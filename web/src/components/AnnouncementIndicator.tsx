/**
 * AnnouncementIndicator
 *
 * Visual indicator showing when screen reader announcements are active.
 * Useful for developers and power users to understand when announcements
 * are being made to assistive technologies.
 */
import React, { useState, useEffect } from 'react';
import { useLiveAnnouncer } from '../hooks/useLiveAnnouncer';

interface AnnouncementIndicatorProps {
  /** Position of the indicator (default: 'bottom-right') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Whether to show the indicator (default: false) */
  enabled?: boolean;
}

export const AnnouncementIndicator: React.FC<AnnouncementIndicatorProps> = ({
  position = 'bottom-right',
  enabled = false,
}) => {
  const { message } = useLiveAnnouncer();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message && enabled) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message, enabled]);

  if (!enabled || !visible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }[position];

  return (
    <div
      className={`fixed ${positionClasses} z-50 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}
      role="status"
      aria-live="off"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};
