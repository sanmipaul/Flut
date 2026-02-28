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
