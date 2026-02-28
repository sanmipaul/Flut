/**
 * VaultCountdown
 *
 * Live countdown display for a vault's remaining lock time.
 * Shows DD : HH : MM : SS digit cards while locking, a status badge when
 * unlocked or withdrawn, and an "imminent" pulse animation under one hour.
 *
 * All time-keeping is delegated to useCountdown; this component is purely
 * presentational.
 */
import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { padTwo } from '../utils/countdownUtils';
import type { UseCountdownInput } from '../types/Countdown';

export type VaultCountdownProps = UseCountdownInput;

// ---------------------------------------------------------------------------
// Small helper — one digit unit card
// ---------------------------------------------------------------------------

interface DigitCardProps {
  value: number;
  label: string;
  pad?: boolean;
}

const DigitCard: React.FC<DigitCardProps> = ({ value, label, pad = true }) => (
  <div className="countdown-unit">
    <span className="countdown-unit__value">{pad ? padTwo(value) : value}</span>
    <span className="countdown-unit__label">{label}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

const Sep: React.FC = () => <span className="countdown-sep" aria-hidden="true">:</span>;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const VaultCountdown: React.FC<VaultCountdownProps> = (props) => {
  const { units, phase, ariaLabel } = useCountdown(props);
  const { days, hours, minutes, seconds } = units;

  if (phase === 'withdrawn') {
    return (
      <div className="vault-countdown vault-countdown--withdrawn">
        <span className="vault-countdown__badge vault-countdown__badge--withdrawn">
          Withdrawn
        </span>
      </div>
    );
  }

  if (phase === 'unlocked') {
    return (
      <div className="vault-countdown vault-countdown--unlocked">
        <span className="vault-countdown__badge vault-countdown__badge--unlocked">
          Unlocked — ready to withdraw
        </span>
      </div>
    );
  }

  const isImminent = phase === 'imminent';

  return (
    <div
      className={`vault-countdown vault-countdown--${phase}`}
      role="timer"
      aria-label={`Time remaining: ${ariaLabel}`}
      aria-live="off"
      // aria-live="off" keeps screen readers quiet on every tick — the
      // static ariaLabel on the container provides the accessible summary.
    >
      <p className="vault-countdown__heading">Time remaining (estimated)</p>

      <div className={`vault-countdown__digits ${isImminent ? 'vault-countdown__digits--imminent' : ''}`}>
        {days > 0 && (
          <>
            <DigitCard value={days} label="days" pad={false} />
            <Sep />
          </>
        )}
        <DigitCard value={hours} label="hrs" />
        <Sep />
        <DigitCard value={minutes} label="min" />
        <Sep />
        <DigitCard value={seconds} label="sec" />
      </div>

      {isImminent && (
        <p className="vault-countdown__imminent-note" role="status">
          Unlocking very soon!
        </p>
      )}

      <p className="vault-countdown__disclaimer">
        Estimates based on ~10 min/block average
      </p>
    </div>
  );
};

export default VaultCountdown;
