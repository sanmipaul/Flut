import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VaultAnalyticsDashboard from './VaultAnalyticsDashboard';
import type { AnalyticsVaultInput } from '../types/VaultAnalytics';

const locked: AnalyticsVaultInput = {
  vaultId: 1,
  amount: 1000,
  unlockHeight: 300,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 200,
};

const unlocked: AnalyticsVaultInput = {
  vaultId: 2,
  amount: 500,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 250,
};

const withdrawn: AnalyticsVaultInput = {
  vaultId: 3,
  amount: 750,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: true,
  currentBlockHeight: 300,
};

const vaults = [locked, unlocked, withdrawn];

describe('VaultAnalyticsDashboard — render', () => {
  it('renders an Analytics toggle button', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    expect(screen.getByText('Analytics')).toBeDefined();
  });

  it('body is hidden by default', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    const body = document.getElementById('analytics-panel-body');
    expect(body?.hidden).toBe(true);
  });

  it('body is visible when defaultExpanded=true', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    const body = document.getElementById('analytics-panel-body');
    expect(body?.hidden).toBe(false);
  });

  it('toggle button has aria-expanded=false by default', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggle button has aria-expanded=true when defaultExpanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows "Active STX" metric when expanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    expect(screen.getByText('Active STX')).toBeDefined();
  });

  it('shows "Total vaults" metric when expanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    expect(screen.getByText('Total vaults')).toBeDefined();
  });

  it('shows "Avg. amount" metric when expanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    expect(screen.getByText('Avg. amount')).toBeDefined();
  });

  it('shows Status distribution section when expanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    expect(screen.getByText('Status distribution')).toBeDefined();
  });

  it('shows Lock durations section when expanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    expect(screen.getByText('Lock durations')).toBeDefined();
  });

  it('shows Average, Longest, Shortest duration rows when expanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    expect(screen.getByText('Average')).toBeDefined();
    expect(screen.getByText('Longest')).toBeDefined();
    expect(screen.getByText('Shortest')).toBeDefined();
  });

  it('shows empty message when vaults list is empty and expanded', () => {
    render(<VaultAnalyticsDashboard vaults={[]} defaultExpanded />);
    expect(screen.getByText(/No vaults to analyse/i)).toBeDefined();
  });

  it('has role="region" with accessible label', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    expect(screen.getByRole('region', { name: /vault analytics/i })).toBeDefined();
  });
});

describe('VaultAnalyticsDashboard — interactions', () => {
  it('expands body on toggle click', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(btn);
    const body = document.getElementById('analytics-panel-body');
    expect(body?.hidden).toBe(false);
  });

  it('collapses body on second toggle click', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(btn);
    const body = document.getElementById('analytics-panel-body');
    expect(body?.hidden).toBe(true);
  });

  it('toggle icon changes from ▼ to ▲ when expanded', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    expect(btn.textContent).toContain('▼');
    fireEvent.click(btn);
    expect(btn.textContent).toContain('▲');
  });

  it('aria-expanded updates to "true" after click', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('metric values appear after expanding', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(btn);
    expect(screen.getByText('Active STX')).toBeDefined();
  });
});

describe('VaultAnalyticsDashboard — distribution bar', () => {
  it('renders at least one distribution segment when vaults exist', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    const segments = document.querySelectorAll('.analytics-distribution__segment');
    expect(segments.length).toBeGreaterThan(0);
  });

  it('locked segment has a title with "Locked"', () => {
    render(<VaultAnalyticsDashboard vaults={[locked]} defaultExpanded />);
    const lockedSeg = document.querySelector('.analytics-distribution__segment--locked');
    expect(lockedSeg?.getAttribute('title')).toContain('Locked');
  });

  it('withdrawn segment has a title with "Withdrawn"', () => {
    render(<VaultAnalyticsDashboard vaults={[withdrawn]} defaultExpanded />);
    const wdSeg = document.querySelector('.analytics-distribution__segment--withdrawn');
    expect(wdSeg?.getAttribute('title')).toContain('Withdrawn');
  });

  it('distribution bar has an accessible aria-label', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    const bar = document.querySelector('[aria-label*="Locked"]');
    expect(bar).not.toBeNull();
  });

  it('renders legend items for each status', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    const legend = document.querySelector('.analytics-distribution__legend');
    expect(legend).not.toBeNull();
    expect(legend?.querySelectorAll('.analytics-distribution__legend-item').length).toBe(3);
  });
});

describe('VaultAnalyticsDashboard — metric sub-text', () => {
  it('shows "withdrawn" sub-text on Avg. amount when there are withdrawn vaults', () => {
    render(<VaultAnalyticsDashboard vaults={[locked, withdrawn]} defaultExpanded />);
    expect(screen.getByText(/withdrawn/i)).toBeDefined();
  });

  it('does not show withdrawn sub-text when no vaults are withdrawn', () => {
    render(<VaultAnalyticsDashboard vaults={[locked]} defaultExpanded />);
    const cards = document.querySelectorAll('.analytics-metric-card__sub');
    const hasWithdrawn = Array.from(cards).some((el) => el.textContent?.includes('withdrawn'));
    expect(hasWithdrawn).toBe(false);
  });

  it('total vaults metric shows correct count', () => {
    render(<VaultAnalyticsDashboard vaults={vaults} defaultExpanded />);
    expect(screen.getByText('3')).toBeDefined();
  });

  it('locked count appears in sub-text of total vaults card', () => {
    render(<VaultAnalyticsDashboard vaults={[locked, unlocked, withdrawn]} defaultExpanded />);
    expect(screen.getByText(/1 vault locked/i)).toBeDefined();
  });
});
