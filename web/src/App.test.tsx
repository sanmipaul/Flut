import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App — VaultAnalyticsDashboard integration', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Flut/i)).toBeDefined();
  });

  it('renders the Analytics toggle in the sidebar', () => {
    render(<App />);
    expect(screen.getByText('Analytics')).toBeDefined();
  });

  it('analytics toggle is collapsed by default', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: /analytics/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders the sidebar heading', () => {
    render(<App />);
    expect(screen.getByText('Your Vaults')).toBeDefined();
  });

  it('renders the New Vault button', () => {
    render(<App />);
    expect(screen.getByText('New Vault')).toBeDefined();
  });

  it('shows empty vault state below analytics panel', () => {
    render(<App />);
    expect(screen.getByText(/No vaults yet/i)).toBeDefined();
  });
});
