import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App — VaultSearchBar integration', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Flut/i)).toBeDefined();
  });

  it('renders the sidebar heading', () => {
    render(<App />);
    expect(screen.getByText('Your Vaults')).toBeDefined();
  });

  it('shows empty state when no vaults exist', () => {
    render(<App />);
    expect(screen.getByText(/No vaults yet/i)).toBeDefined();
  });

  it('does not show VaultSearchBar when vault list is empty', () => {
    render(<App />);
    expect(screen.queryByRole('search')).toBeNull();
  });

  it('renders the New Vault button', () => {
    render(<App />);
    expect(screen.getByText('New Vault')).toBeDefined();
  });
});
