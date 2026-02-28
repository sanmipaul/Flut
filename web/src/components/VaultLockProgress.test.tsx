import React from 'react';
import { render, screen } from '@testing-library/react';
import VaultLockProgress from './VaultLockProgress';

const lockedProps = {
  createdAt: 100,
  unlockHeight: 200,
  currentBlockHeight: 150,
  isWithdrawn: false,
};

const unlockedProps = {
  createdAt: 100,
  unlockHeight: 200,
  currentBlockHeight: 250,
  isWithdrawn: false,
};

const withdrawnProps = {
  createdAt: 100,
  unlockHeight: 200,
  currentBlockHeight: 250,
  isWithdrawn: true,
};

describe('VaultLockProgress', () => {
  it('renders the Lock Progress title', () => {
    render(<VaultLockProgress {...lockedProps} />);
    expect(screen.getByText('Lock Progress')).toBeDefined();
  });

  it('shows "Locked" badge when vault is locked', () => {
    render(<VaultLockProgress {...lockedProps} />);
    expect(screen.getByText('Locked')).toBeDefined();
  });

  it('shows "Unlocked" badge when vault is unlocked', () => {
    render(<VaultLockProgress {...unlockedProps} />);
    expect(screen.getByText('Unlocked')).toBeDefined();
  });

  it('shows "Withdrawn" badge when vault is withdrawn', () => {
    render(<VaultLockProgress {...withdrawnProps} />);
    expect(screen.getByText('Withdrawn')).toBeDefined();
  });

  it('renders a progressbar with correct aria-valuenow', () => {
    render(<VaultLockProgress {...lockedProps} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
  });

  it('aria-valuemin is 0 and aria-valuemax is 100', () => {
    render(<VaultLockProgress {...lockedProps} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('shows percentage label', () => {
    render(<VaultLockProgress {...lockedProps} />);
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('fill width style reflects percentage', () => {
    render(<VaultLockProgress {...lockedProps} />);
    const fill = document.querySelector('.vault-lock-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('renders three milestone markers', () => {
    render(<VaultLockProgress {...lockedProps} />);
    const milestones = document.querySelectorAll('.vault-lock-progress__milestone');
    expect(milestones.length).toBe(3);
  });

  it('applies --reached class to milestones that are passed', () => {
    // At 50%, only the 25% milestone should be reached
    render(<VaultLockProgress {...lockedProps} />);
    const reached = document.querySelectorAll('.vault-lock-progress__milestone--reached');
    expect(reached.length).toBe(1);
  });

  it('applies vault-lock-progress--locked class when locked', () => {
    render(<VaultLockProgress {...lockedProps} />);
    expect(document.querySelector('.vault-lock-progress--locked')).not.toBeNull();
  });

  it('applies vault-lock-progress--unlocked class when unlocked', () => {
    render(<VaultLockProgress {...unlockedProps} />);
    expect(document.querySelector('.vault-lock-progress--unlocked')).not.toBeNull();
  });

  it('applies vault-lock-progress--withdrawn class when withdrawn', () => {
    render(<VaultLockProgress {...withdrawnProps} />);
    expect(document.querySelector('.vault-lock-progress--withdrawn')).not.toBeNull();
  });

  it('shows blocks remaining text when locked', () => {
    render(<VaultLockProgress {...lockedProps} />);
    expect(screen.getByText(/blocks remaining/i)).toBeDefined();
  });

  it('shows ready to withdraw message when unlocked', () => {
    render(<VaultLockProgress {...unlockedProps} />);
    expect(screen.getByText(/ready to withdraw/i)).toBeDefined();
  });

  it('shows funds withdrawn message when withdrawn', () => {
    render(<VaultLockProgress {...withdrawnProps} />);
    expect(screen.getByText(/funds withdrawn/i)).toBeDefined();
  });

  it('adds pulse class when nearly unlocked (>=90%)', () => {
    render(
      <VaultLockProgress
        createdAt={100}
        unlockHeight={200}
        currentBlockHeight={195}
        isWithdrawn={false}
      />
    );
    expect(document.querySelector('.vault-lock-progress__fill--pulse')).not.toBeNull();
  });

  it('does not add pulse class when below 90%', () => {
    render(<VaultLockProgress {...lockedProps} />);
    expect(document.querySelector('.vault-lock-progress__fill--pulse')).toBeNull();
  });

  it('compact mode renders a progressbar', () => {
    render(<VaultLockProgress {...lockedProps} compact />);
    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('compact mode applies --compact class', () => {
    render(<VaultLockProgress {...lockedProps} compact />);
    expect(document.querySelector('.vault-lock-progress--compact')).not.toBeNull();
  });

  it('compact mode shows percentage', () => {
    render(<VaultLockProgress {...lockedProps} compact />);
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('compact mode does not show milestone markers', () => {
    render(<VaultLockProgress {...lockedProps} compact />);
    expect(document.querySelectorAll('.vault-lock-progress__milestone').length).toBe(0);
  });

  it('milestone markers have data-milestone attribute', () => {
    render(<VaultLockProgress {...lockedProps} />);
    const markers = document.querySelectorAll('[data-milestone]');
    expect(markers.length).toBe(3);
    expect(markers[0].getAttribute('data-milestone')).toBe('25');
    expect(markers[1].getAttribute('data-milestone')).toBe('50');
    expect(markers[2].getAttribute('data-milestone')).toBe('75');
  });

  it('milestone markers have a title attribute with block info', () => {
    render(<VaultLockProgress {...lockedProps} />);
    const marker25 = document.querySelector('[data-milestone="25"]');
    expect(marker25?.getAttribute('title')).toContain('25%');
  });
});
