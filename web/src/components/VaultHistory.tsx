/**
 * VaultHistory
 *
 * Collapsible panel that displays the chronological transaction history
 * for a single vault. Shows an empty state when no events have been recorded
 * and allows the user to expand/collapse the panel.
 *
 * Props:
 *   vaultId  – the vault whose events to display
 *   events   – pre-filtered list of VaultEvent records (newest first)
 *   loading  – shows a loading skeleton when true
 */
import React, { useState, useEffect, useRef } from 'react';
import type { VaultEvent } from '../types/VaultEvent';
import VaultHistoryItem from './VaultHistoryItem';

export interface VaultHistoryProps {
  vaultId: number;
  events: VaultEvent[];
  loading?: boolean;
}

const VaultHistory: React.FC<VaultHistoryProps> = ({
  vaultId,
  events,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) {
        // Only collapse if focus is inside this section
        if (sectionRef.current?.contains(document.activeElement)) {
          setExpanded(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expanded]);

  return (
    <section
      className="vault-history"
      aria-labelledby={`history-heading-${vaultId}`}
      ref={sectionRef}
    >
      <header className="vault-history__header">
        <h3 id={`history-heading-${vaultId}`} className="vault-history__title">
          Transaction History
          {events.length > 0 && (
            <span className="vault-history__count" aria-label={`${events.length} events`}>
              {events.length}
            </span>
          )}
        </h3>
        <button
          type="button"
          className="vault-history__toggle"
          aria-expanded={expanded}
          aria-controls={`history-list-${vaultId}`}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </header>

      {expanded && (
        <div id={`history-list-${vaultId}`}>
          {loading ? (
            <div className="vault-history__loading" aria-busy="true" aria-live="polite">
              <span className="vault-history__skeleton" />
              <span className="vault-history__skeleton vault-history__skeleton--short" />
              <span className="vault-history__skeleton" />
            </div>
          ) : events.length === 0 ? (
            <p className="vault-history__empty">
              No events recorded yet. Actions like creating the vault,
              setting a beneficiary, or withdrawing will appear here.
            </p>
          ) : (
            <ol className="vault-history__list" reversed>
              {events.map((event) => (
                <VaultHistoryItem key={event.id} event={event} />
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
};

export default VaultHistory;
