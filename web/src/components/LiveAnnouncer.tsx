/**
 * SSR-safe LiveAnnouncer component
 *
 * Provides server-side rendering compatible aria-live region for
 * screen reader announcements. Only renders on client-side after
 * hydration to avoid hydration mismatches.
 *
 * Usage:
 *   <LiveAnnouncer message={message} politeness="polite" />
 */
import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface LiveAnnouncerProps {
  /** The message to announce to screen readers */
  message: string;
  /** Politeness level for the announcement (default: 'polite') */
  politeness?: 'polite' | 'assertive' | 'off';
  /** Optional CSS class for styling */
  className?: string;
}

/**
 * SSR-safe component that renders an aria-live region only on the client.
 * Prevents hydration mismatches between server and client renders.
 */
export const LiveAnnouncer: FC<LiveAnnouncerProps> = ({
  message,
  politeness = 'polite',
  className = '',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || politeness === 'off') {
    return null;
  }

  return (
    <div
      className={`sr-only ${className}`.trim()}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    >
      {message}
    </div>
  );
};

/**
 * Props for the SSRSafeAnnouncement component
 */
export interface SSRSafeAnnouncementProps {
  /** The announcement message */
  message: string;
  /** Optional politeness level */
  politeness?: 'polite' | 'assertive';
}

/**
 * Server-Safe Announcement component
 *
 * Wrapper component that ensures announcements work correctly
 * in both SSR and client environments. Uses dynamic import
 * pattern for SSR compatibility.
 */
export const SSRSafeAnnouncement: FC<SSRSafeAnnouncementProps> = ({
  message,
  politeness = 'polite',
}) => {
  return <LiveAnnouncer message={message} politeness={politeness} />;
};
