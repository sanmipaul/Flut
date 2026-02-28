import React from 'react';
import { render, screen } from '@testing-library/react';
import VaultCountdown from './VaultCountdown';
import type { VaultCountdownProps } from './VaultCountdown';

const lockedProps: VaultCountdownProps = {
  createdAt: 100,
  unlockHeight: 400,
  currentBlockHeight: 100,  // 300 blocks = ~50 hours remaining
  isWithdrawn: false,
};

const imminentProps: VaultCountdownProps = {
  createdAt: 100,
  unlockHeight: 105,
  currentBlockHeight: 101, // 4 blocks = 2400 s < 3600 s → imminent
  isWithdrawn: false,
};

const unlockedProps: VaultCountdownProps = {
  createdAt: 100,
  unlockHeight: 200,
  currentBlockHeight: 250,
  isWithdrawn: false,
};

const withdrawnProps: VaultCountdownProps = {
  createdAt: 100,
  unlockHeight: 200,
  currentBlockHeight: 300,
  isWithdrawn: true,
};

describe('VaultCountdown — render', () => {
  it('renders "Time remaining" heading when counting', () => {
    render(<VaultCountdown {...lockedProps} />);
    expect(screen.getByText(/Time remaining/i)).toBeDefined();
  });

  it('renders a timer role element when counting', () => {
    render(<VaultCountdown {...lockedProps} />);
    expect(screen.getByRole('timer')).toBeDefined();
  });

  it('renders digit unit labels: hrs, min, sec', () => {
    render(<VaultCountdown {...lockedProps} />);
    expect(screen.getByText('hrs')).toBeDefined();
    expect(screen.getByText('min')).toBeDefined();
    expect(screen.getByText('sec')).toBeDefined();
  });

  it('renders "days" label when many blocks remain', () => {
    render(<VaultCountdown {...lockedProps} />);
    expect(screen.getByText('days')).toBeDefined();
  });

  it('renders disclaimer text', () => {
    render(<VaultCountdown {...lockedProps} />);
    expect(screen.getByText(/10 min\/block/i)).toBeDefined();
  });

  it('renders aria-label with "remaining" when counting', () => {
    render(<VaultCountdown {...lockedProps} />);
    const timer = screen.getByRole('timer');
    expect(timer.getAttribute('aria-label')).toContain('remaining');
  });
});

describe('VaultCountdown — unlocked state', () => {
  it('does not render a timer role', () => {
    render(<VaultCountdown {...unlockedProps} />);
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('renders "Unlocked" badge text', () => {
    render(<VaultCountdown {...unlockedProps} />);
    expect(screen.getByText(/Unlocked/i)).toBeDefined();
  });

  it('renders "ready to withdraw" in badge', () => {
    render(<VaultCountdown {...unlockedProps} />);
    expect(screen.getByText(/ready to withdraw/i)).toBeDefined();
  });

  it('applies --unlocked class to container', () => {
    render(<VaultCountdown {...unlockedProps} />);
    expect(document.querySelector('.vault-countdown--unlocked')).not.toBeNull();
  });
});

describe('VaultCountdown — withdrawn state', () => {
  it('renders "Withdrawn" badge', () => {
    render(<VaultCountdown {...withdrawnProps} />);
    expect(screen.getByText('Withdrawn')).toBeDefined();
  });

  it('does not render a timer role', () => {
    render(<VaultCountdown {...withdrawnProps} />);
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('applies --withdrawn class to container', () => {
    render(<VaultCountdown {...withdrawnProps} />);
    expect(document.querySelector('.vault-countdown--withdrawn')).not.toBeNull();
  });
});

describe('VaultCountdown — imminent state', () => {
  it('shows "Unlocking very soon!" note', () => {
    render(<VaultCountdown {...imminentProps} />);
    expect(screen.getByText(/Unlocking very soon/i)).toBeDefined();
  });

  it('applies --imminent class to digit container', () => {
    render(<VaultCountdown {...imminentProps} />);
    expect(document.querySelector('.vault-countdown__digits--imminent')).not.toBeNull();
  });

  it('has role="status" on imminent note', () => {
    render(<VaultCountdown {...imminentProps} />);
    expect(screen.getByRole('status')).toBeDefined();
  });
});

describe('VaultCountdown — digit card visibility', () => {
  it('does not render "days" label when < 1 day remains', () => {
    render(<VaultCountdown {...imminentProps} />);
    expect(screen.queryByText('days')).toBeNull();
  });

  it('renders "days" label when multiple days remain', () => {
    render(<VaultCountdown {...lockedProps} />);
    expect(screen.getByText('days')).toBeDefined();
  });

  it('always renders hrs, min, and sec labels', () => {
    render(<VaultCountdown {...imminentProps} />);
    expect(screen.getByText('hrs')).toBeDefined();
    expect(screen.getByText('min')).toBeDefined();
    expect(screen.getByText('sec')).toBeDefined();
  });

  it('timer aria-label updates to reflect imminent state', () => {
    render(<VaultCountdown {...imminentProps} />);
    const timer = screen.getByRole('timer');
    expect(timer.getAttribute('aria-label')).toContain('remaining');
  });
});
