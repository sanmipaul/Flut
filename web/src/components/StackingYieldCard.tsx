/**
 * StackingYieldCard
 *
 * Displays estimated BTC stacking rewards for a vault's lock period.
 * Features:
 *   - Summary metric row: total BTC, cycle count, effective APY
 *   - Interactive APY slider (1–25%) so users can model different scenarios
 *   - Collapsible cycle-by-cycle breakdown table
 *   - Disclaimer that values are estimates only
 *
 * All data comes from useStackingYield; this component is purely presentational.
 */
import React, { useState, useId } from 'react';
import { useStackingYield } from '../hooks/useStackingYield';
import { formatBtcAmount, formatYieldPct, formatCycleCount, formatStxShort } from '../utils/formatYield';

export interface StackingYieldCardProps {
  /** Vault amount in whole STX (not microSTX). */
  stxAmount: number;
  /** unlockHeight − createdAt for this vault. */
  totalLockBlocks: number;
}

const StackingYieldCard: React.FC<StackingYieldCardProps> = ({ stxAmount, totalLockBlocks }) => {
  const { yieldResult, apyPct, setApyPct, resetApy, minApy, maxApy } = useStackingYield({
    stxAmount,
    totalLockBlocks,
  });
  const [showBreakdown, setShowBreakdown] = useState(false);

  const sliderId = useId();
  const breakdownId = useId();

  const { totalBtc, fullCycleCount, hasYield, cycles } = yieldResult;

  return (
    <section className="stacking-yield-card" aria-label="Stacking yield estimate">
      <div className="stacking-yield-card__header">
        <h3 className="stacking-yield-card__title">Stacking Yield Estimate</h3>
        <button
          type="button"
          className="stacking-yield-card__reset-btn"
          onClick={resetApy}
          aria-label="Reset APY to default (10%)"
          title="Reset to default APY"
        >
          Reset
        </button>
      </div>

      {/* APY slider */}
      <div className="stacking-yield-card__slider-row">
        <label
          htmlFor={sliderId}
          className="stacking-yield-card__slider-label"
        >
          APY rate
        </label>
        <input
          id={sliderId}
          type="range"
          className="stacking-yield-card__slider"
          min={minApy}
          max={maxApy}
          step={1}
          value={apyPct}
          onChange={(e) => setApyPct(Number(e.target.value))}
          aria-label={`APY rate: ${formatYieldPct(apyPct)}`}
          aria-valuemin={minApy}
          aria-valuemax={maxApy}
          aria-valuenow={apyPct}
          aria-valuetext={formatYieldPct(apyPct)}
        />
        <span className="stacking-yield-card__slider-value" aria-live="polite" aria-atomic="true">
          {formatYieldPct(apyPct)}
        </span>
      </div>

      {/* Summary metrics */}
      {!hasYield ? (
        <p className="stacking-yield-card__no-yield">
          Lock period is shorter than one stacking cycle (~14 days). No full cycles completed.
        </p>
      ) : (
        <>
          <dl className="stacking-yield-card__summary">
            <div className="stacking-yield-card__summary-item">
              <dt>Estimated yield</dt>
              <dd className="stacking-yield-card__highlight">{formatBtcAmount(totalBtc)}</dd>
            </div>
            <div className="stacking-yield-card__summary-item">
              <dt>Full cycles</dt>
              <dd>{formatCycleCount(fullCycleCount)}</dd>
            </div>
            <div className="stacking-yield-card__summary-item">
              <dt>Principal</dt>
              <dd>{formatStxShort(stxAmount)}</dd>
            </div>
          </dl>

          {/* Collapsible cycle breakdown */}
          <button
            type="button"
            className="stacking-yield-card__breakdown-toggle"
            aria-expanded={showBreakdown}
            aria-controls={breakdownId}
            onClick={() => setShowBreakdown((p) => !p)}
          >
            Cycle breakdown {showBreakdown ? '▲' : '▼'}
          </button>

          <div id={breakdownId} hidden={!showBreakdown}>
            <table className="stacking-yield-card__table" aria-label="Per-cycle reward breakdown">
              <thead>
                <tr>
                  <th scope="col">Cycle</th>
                  <th scope="col">Reward</th>
                  <th scope="col">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((cycle) => (
                  <tr key={cycle.cycleNumber}>
                    <td>{cycle.cycleNumber}</td>
                    <td>{formatBtcAmount(cycle.estimatedBtc)}</td>
                    <td>{formatBtcAmount(cycle.cumulativeBtc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="stacking-yield-card__disclaimer" role="note">
        Estimates only. Actual rewards depend on miner fees, total STX stacked network-wide,
        and BTC/STX price at the time of each cycle.
      </p>
    </section>
  );
};

export default StackingYieldCard;
