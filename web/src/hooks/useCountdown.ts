/**
 * useCountdown
 *
 * Ticks once per second and derives a CountdownState from the vault's
 * block-height data. The interval is cleared when the vault reaches the
 * unlocked or withdrawn phase to avoid unnecessary re-renders.
 *
 * The block-based time estimate is inherently approximate (Stacks averages
 * ~10 min/block). The countdown represents an estimate, not a guarantee.
 */
import { useState, useEffect, useRef } from 'react';
import type { CountdownState, UseCountdownInput, CountdownPhase } from '../types/Countdown';
import { blocksToSeconds, secondsToUnits, buildAriaLabel } from '../utils/countdownUtils';

const ONE_HOUR_IN_SECONDS = 3_600;

function deriveState(
  blocksRemaining: number,
  isWithdrawn: boolean,
  elapsedSeconds: number,
): CountdownState {
  if (isWithdrawn) {
    const units = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return { units, totalSecondsRemaining: 0, phase: 'withdrawn', ariaLabel: 'Withdrawn' };
  }

  const estimatedTotal = blocksToSeconds(blocksRemaining);
  // Subtract real-world seconds elapsed since component mounted to give a
  // live feel without needing real block height updates.
  const totalSecondsRemaining = Math.max(0, estimatedTotal - elapsedSeconds);

  if (totalSecondsRemaining === 0) {
    const units = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return { units, totalSecondsRemaining: 0, phase: 'unlocked', ariaLabel: 'Unlocked' };
  }

  const phase: CountdownPhase =
    totalSecondsRemaining < ONE_HOUR_IN_SECONDS ? 'imminent' : 'counting';
  const units = secondsToUnits(totalSecondsRemaining);
  return {
    units,
    totalSecondsRemaining,
    phase,
    ariaLabel: buildAriaLabel(units),
  };
}

export function useCountdown(input: UseCountdownInput): CountdownState {
  const { unlockHeight, currentBlockHeight, isWithdrawn } = input;
  const blocksRemaining = Math.max(0, unlockHeight - currentBlockHeight);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isTerminal = isWithdrawn || blocksRemaining === 0;

  useEffect(() => {
    // Reset elapsed seconds whenever the underlying block data changes.
    setElapsedSeconds(0);

    if (isTerminal) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1_000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [blocksRemaining, isTerminal]);

  return deriveState(blocksRemaining, isWithdrawn, elapsedSeconds);
}
