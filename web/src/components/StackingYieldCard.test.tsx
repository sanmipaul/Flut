import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StackingYieldCard from './StackingYieldCard';
import { BLOCKS_PER_CYCLE, DEFAULT_APY_PCT } from '../types/StackingYield';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** 6 full stacking cycles — should produce yield. */
const VALID_PROPS = {
  stxAmount: 10_000,
  totalLockBlocks: BLOCKS_PER_CYCLE * 6,
};

/** Less than one cycle — no yield. */
const SHORT_PROPS = {
  stxAmount: 10_000,
  totalLockBlocks: BLOCKS_PER_CYCLE - 1,
};

// ---------------------------------------------------------------------------
// Render — basic structure
// ---------------------------------------------------------------------------

describe('StackingYieldCard — structure', () => {
  it('renders the card section with accessible label', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByRole('region', { name: /stacking yield estimate/i })).toBeDefined();
  });

  it('renders the title "Stacking Yield Estimate"', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByText('Stacking Yield Estimate')).toBeDefined();
  });

  it('renders a Reset button', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByRole('button', { name: /reset apy/i })).toBeDefined();
  });

  it('renders the APY slider', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByRole('slider')).toBeDefined();
  });

  it('slider has correct initial value (DEFAULT_APY_PCT)', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(Number(slider.value)).toBe(DEFAULT_APY_PCT);
  });

  it('renders the disclaimer with role="note"', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByRole('note')).toBeDefined();
  });

  it('disclaimer mentions "Estimates only"', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByRole('note').textContent).toMatch(/estimates only/i);
  });
});

// ---------------------------------------------------------------------------
// No-yield state
// ---------------------------------------------------------------------------

describe('StackingYieldCard — no yield state', () => {
  it('shows no-yield message when lock period is shorter than one cycle', () => {
    render(<StackingYieldCard {...SHORT_PROPS} />);
    expect(screen.getByText(/shorter than one stacking cycle/i)).toBeDefined();
  });

  it('does not render summary metrics when hasYield=false', () => {
    render(<StackingYieldCard {...SHORT_PROPS} />);
    expect(screen.queryByText(/estimated yield/i)).toBeNull();
  });

  it('does not render cycle breakdown toggle when hasYield=false', () => {
    render(<StackingYieldCard {...SHORT_PROPS} />);
    expect(screen.queryByText(/cycle breakdown/i)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Yield state — summary metrics
// ---------------------------------------------------------------------------

describe('StackingYieldCard — yield summary', () => {
  it('renders "Estimated yield" label', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByText('Estimated yield')).toBeDefined();
  });

  it('renders "Full cycles" label', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByText('Full cycles')).toBeDefined();
  });

  it('renders "Principal" label', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByText('Principal')).toBeDefined();
  });

  it('does not show no-yield message when hasYield=true', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.queryByText(/shorter than one stacking cycle/i)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// APY slider interactions
// ---------------------------------------------------------------------------

describe('StackingYieldCard — slider interactions', () => {
  it('slider label shows current APY percentage', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const valueEl = screen.getByText(`${DEFAULT_APY_PCT}.0% APY`);
    expect(valueEl).toBeDefined();
  });

  it('slider value updates when dragged', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText('20.0% APY')).toBeDefined();
  });

  it('Reset button restores apyPct to default', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText('20.0% APY')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /reset apy/i }));
    expect(screen.getByText(`${DEFAULT_APY_PCT}.0% APY`)).toBeDefined();
  });

  it('slider aria-valuenow matches current apyPct', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '15' } });
    expect(slider.getAttribute('aria-valuenow')).toBe('15');
  });

  it('slider aria-valuetext reflects the formatted APY', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-valuetext')).toContain('APY');
  });
});

// ---------------------------------------------------------------------------
// Cycle breakdown toggle
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Accessibility attributes
// ---------------------------------------------------------------------------

describe('StackingYieldCard — accessibility', () => {
  it('no-yield message has role="status" for screen reader announcement', () => {
    render(<StackingYieldCard {...SHORT_PROPS} />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('no-yield message has aria-live="polite"', () => {
    render(<StackingYieldCard {...SHORT_PROPS} />);
    const msg = screen.getByRole('status');
    expect(msg.getAttribute('aria-live')).toBe('polite');
  });

  it('slider has aria-describedby pointing to the disclaimer', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const slider = screen.getByRole('slider');
    const describedBy = slider.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const disclaimer = document.getElementById(describedBy as string);
    expect(disclaimer).not.toBeNull();
    expect(disclaimer?.getAttribute('role')).toBe('note');
  });

  it('disclaimer paragraph has an id attribute', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const disclaimer = screen.getByRole('note');
    expect(disclaimer.id).toBeTruthy();
  });

  it('slider aria-label includes "APY rate"', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-label')).toContain('APY rate');
  });

  it('breakdown toggle aria-expanded starts as false', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const toggle = screen.getByText(/cycle breakdown/i);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('breakdown toggle aria-controls points to the breakdown container', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const toggle = screen.getByText(/cycle breakdown/i);
    const controlsId = toggle.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    const container = document.getElementById(controlsId as string);
    expect(container).not.toBeNull();
  });
});

describe('StackingYieldCard — cycle breakdown', () => {
  it('breakdown toggle button is shown for valid yield', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    expect(screen.getByText(/cycle breakdown/i)).toBeDefined();
  });

  it('breakdown table is hidden by default', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const toggle = screen.getByText(/cycle breakdown/i);
    // aria-expanded should be false
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking breakdown toggle shows the table', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const toggle = screen.getByText(/cycle breakdown/i);
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('breakdown table has Cycle, Reward, Cumulative columns', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    fireEvent.click(screen.getByText(/cycle breakdown/i));
    expect(screen.getByText('Cycle')).toBeDefined();
    expect(screen.getByText('Reward')).toBeDefined();
    expect(screen.getByText('Cumulative')).toBeDefined();
  });

  it('clicking toggle again hides the table', () => {
    render(<StackingYieldCard {...VALID_PROPS} />);
    const toggle = screen.getByText(/cycle breakdown/i);
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
