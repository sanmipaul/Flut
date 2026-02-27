/**
 * VaultHistoryItem
 *
 * Renders a single event in the vault transaction timeline.
 * Each item shows:
 *   - an icon representing the event kind
 *   - a short description
 *   - the block height
 *   - a relative or formatted timestamp
 *   - an optional transaction hash (with copy affordance)
 */
import React from 'react';
import type { VaultEvent } from '../types/VaultEvent';
import { EVENT_ICON, EVENT_LABEL, EVENT_SEVERITY } from '../types/VaultEvent';

export interface VaultHistoryItemProps {
  event: VaultEvent;
}

/** Format a block height into a human-readable label */
function formatBlock(blockHeight: number): string {
  return `Block #${blockHeight.toLocaleString()}`;
}

/** Format a Unix ms timestamp into a locale date-time string */
function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Shorten a tx hash for display */
function truncateTx(txId: string): string {
  if (txId.length <= 14) return txId;
  return `${txId.slice(0, 8)}…${txId.slice(-6)}`;
}

const VaultHistoryItem: React.FC<VaultHistoryItemProps> = ({ event }) => {
  const severity = EVENT_SEVERITY[event.kind];
  const icon = EVENT_ICON[event.kind];
  const label = EVENT_LABEL[event.kind];

  return (
    <li
      className={`history-item history-item--${severity}`}
      aria-label={`${label}: ${event.description}`}
    >
      <span className="history-item__dot" aria-hidden="true" />

      <div className="history-item__body">
        <div className="history-item__header">
          <span className="history-item__icon" aria-hidden="true">
            {icon}
          </span>
          <strong className="history-item__label">{label}</strong>
          <span className="history-item__block">{formatBlock(event.blockHeight)}</span>
        </div>

        <p className="history-item__description">{event.description}</p>

        <div className="history-item__footer">
          <time
            className="history-item__time"
            dateTime={new Date(event.timestamp).toISOString()}
          >
            {formatTimestamp(event.timestamp)}
          </time>
          {event.txId && (
            <span className="history-item__tx">
              Tx:{' '}
              <code title={event.txId}>{truncateTx(event.txId)}</code>
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default VaultHistoryItem;
