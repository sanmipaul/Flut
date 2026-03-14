import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App — smoke test', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Flut/i)).toBeDefined();
  });

  it('renders the sidebar heading', () => {
    render(<App />);
    expect(screen.getByText('Your Vaults')).toBeDefined();
  });

  it('renders the New Vault button', () => {
    render(<App />);
    expect(screen.getByText('New Vault')).toBeDefined();
  });

  it('shows empty vault state', () => {
    render(<App />);
    expect(screen.getByText(/No vaults yet/i)).toBeDefined();
  });

  it('does not show VaultCountdown when no vault is selected', () => {
    render(<App />);
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('does not render StackingYieldCard when no vault is selected', () => {
    render(<App />);
    expect(screen.queryByText('Stacking Yield Estimate')).toBeNull();
  });

  it('does not render APY slider when no vault is selected', () => {
    render(<App />);
    expect(screen.queryByRole('slider')).toBeNull();
  });
});
