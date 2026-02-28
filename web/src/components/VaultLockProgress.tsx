/**
 * VaultLockProgress
 *
 * A visual progress indicator for a vault's lock period. Shows:
 *   - A gradient progress bar with an animated fill
 *   - Milestone markers at 25 %, 50 %, and 75 %
 *   - Percentage complete and time remaining labels
 *   - A coloured status badge (locked / unlocked / withdrawn)
 *
 * Uses the `useLockProgress` hook for all calculations.
 */
import React from 'react';
import { useLockProgress } from '../hooks/useLockProgress';

export interface VaultLockProgressProps {
  createdAt: number;
  unlockHeight: number;
  currentBlockHeight: number;
  isWithdrawn: boolean;
  /** When true, renders a compact single-line variant for sidebars */
  compact?: boolean;
}

const MILESTONES = [25, 50, 75];

const STATUS_LABEL: Record<string, string> = {
  locked: 'Locked',
  unlocked: 'Unlocked',
  withdrawn: 'Withdrawn',
};

const VaultLockProgress: React.FC<VaultLockProgressProps> = ({
  createdAt,
  unlockHeight,
  currentBlockHeight,
  isWithdrawn,
  compact = false,
}) => {
  const progress = useLockProgress({ createdAt, unlockHeight, currentBlockHeight, isWithdrawn });
  const { percentComplete, blocksRemaining, totalLockBlocks, timeRemaining, status } = progress;

  const isNearlyUnlocked = status === 'locked' && percentComplete >= 90;

  if (compact) {
    return (
      <div className={`vault-lock-progress vault-lock-progress--compact vault-lock-progress--${status}`}>
        <div
          className="vault-lock-progress__track"
          role="progressbar"
          aria-valuenow={percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Lock progress: ${percentComplete}% complete`}
          title={`${timeRemaining} • ${percentComplete}%`}
        >
          <div
            className={`vault-lock-progress__fill ${isNearlyUnlocked ? 'vault-lock-progress__fill--pulse' : ''}`}
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <span className="vault-lock-progress__pct vault-lock-progress__pct--compact">
          {percentComplete}%
        </span>
      </div>
    );
  }

  return (
    <div className={`vault-lock-progress vault-lock-progress--${status}`}>
      <div className="vault-lock-progress__header">
        <span className="vault-lock-progress__title">Lock Progress</span>
        <span className={`vault-lock-progress__badge vault-lock-progress__badge--${status}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Progress track */}
      <div
        className="vault-lock-progress__track"
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Lock progress: ${percentComplete}% complete`}
      >
        <div
          className={`vault-lock-progress__fill ${isNearlyUnlocked ? 'vault-lock-progress__fill--pulse' : ''}`}
          style={{ width: `${percentComplete}%` }}
          data-testid="lock-progress-fill"
        />

        {/* Milestone markers */}
        {MILESTONES.map((milestone) => (
          <span
            key={milestone}
            className={`vault-lock-progress__milestone ${percentComplete >= milestone ? 'vault-lock-progress__milestone--reached' : ''}`}
            style={{ left: `${milestone}%` }}
            aria-hidden="true"
            title={`${milestone}%`}
          />
        ))}
      </div>

      {/* Labels row */}
      <div className="vault-lock-progress__labels">
        <span className="vault-lock-progress__pct">{percentComplete}%</span>
        <span className="vault-lock-progress__time">{timeRemaining}</span>
      </div>

      {/* Block detail row */}
      <div className="vault-lock-progress__blocks">
        {status === 'locked' ? (
          <span>
            {blocksRemaining.toLocaleString()} of {totalLockBlocks.toLocaleString()} blocks remaining
          </span>
        ) : status === 'unlocked' ? (
          <span>Lock period complete — ready to withdraw</span>
        ) : (
          <span>Funds withdrawn</span>
        )}
      </div>
    </div>
  );
};

export default VaultLockProgress;
