import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VaultSearchBar from './VaultSearchBar';
import type { VaultSearchBarProps } from './VaultSearchBar';

const defaultProps: VaultSearchBarProps = {
  query: '',
  statusFilter: 'all',
  sortField: 'id',
  sortDirection: 'asc',
  matchCount: 5,
  totalCount: 5,
  isFiltered: false,
  onQueryChange: jest.fn(),
  onStatusFilterChange: jest.fn(),
  onSortFieldChange: jest.fn(),
  onSortDirectionToggle: jest.fn(),
  onReset: jest.fn(),
};

describe('VaultSearchBar — render', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders a search input', () => {
    render(<VaultSearchBar {...defaultProps} />);
    expect(screen.getByRole('searchbox')).toBeDefined();
  });

  it('renders All, Locked, Unlocked, Withdrawn chips', () => {
    render(<VaultSearchBar {...defaultProps} />);
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Locked')).toBeDefined();
    expect(screen.getByText('Unlocked')).toBeDefined();
    expect(screen.getByText('Withdrawn')).toBeDefined();
  });

  it('renders a sort select dropdown', () => {
    render(<VaultSearchBar {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('renders a sort direction toggle button', () => {
    render(<VaultSearchBar {...defaultProps} />);
    expect(screen.getByText('↑ Asc')).toBeDefined();
  });

  it('shows ↓ Desc when sortDirection is desc', () => {
    render(<VaultSearchBar {...defaultProps} sortDirection="desc" />);
    expect(screen.getByText('↓ Desc')).toBeDefined();
  });

  it('shows result count label', () => {
    render(<VaultSearchBar {...defaultProps} />);
    expect(screen.getByText(/5 vaults/i)).toBeDefined();
  });

  it('result count uses singular "vault" for exactly one vault', () => {
    render(<VaultSearchBar {...defaultProps} totalCount={1} matchCount={1} />);
    expect(screen.getByText(/1 vault$/)).toBeDefined();
  });

  it('does not show clear button when isFiltered=false', () => {
    render(<VaultSearchBar {...defaultProps} isFiltered={false} />);
    expect(screen.queryByLabelText('Clear all filters')).toBeNull();
  });

  it('shows clear button when isFiltered=true', () => {
    render(<VaultSearchBar {...defaultProps} isFiltered={true} />);
    expect(screen.getByLabelText('Clear all filters')).toBeDefined();
  });

  it('search has role="search"', () => {
    render(<VaultSearchBar {...defaultProps} />);
    expect(screen.getByRole('search')).toBeDefined();
  });

  it('result count has aria-live="polite"', () => {
    render(<VaultSearchBar {...defaultProps} />);
    const count = screen.getByText(/5 vaults/i);
    expect(count.getAttribute('aria-live')).toBe('polite');
  });

  it('all chip has aria-pressed=true when statusFilter is "all"', () => {
    render(<VaultSearchBar {...defaultProps} statusFilter="all" />);
    const allBtn = screen.getByText('All').closest('button');
    expect(allBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('locked chip has aria-pressed=true when statusFilter is "locked"', () => {
    render(<VaultSearchBar {...defaultProps} statusFilter="locked" />);
    const lockedBtn = screen.getByText('Locked').closest('button');
    expect(lockedBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows filtered count "X of Y vaults" when isFiltered=true', () => {
    render(
      <VaultSearchBar {...defaultProps} isFiltered={true} matchCount={2} totalCount={5} />,
    );
    expect(screen.getByText(/2 of 5 vaults/i)).toBeDefined();
  });

  it('chip group has accessible label', () => {
    render(<VaultSearchBar {...defaultProps} />);
    expect(screen.getByRole('group', { name: /filter by vault status/i })).toBeDefined();
  });
});

describe('VaultSearchBar — interactions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls onQueryChange when input changes', () => {
    const onQueryChange = jest.fn();
    render(<VaultSearchBar {...defaultProps} onQueryChange={onQueryChange} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'foo' } });
    expect(onQueryChange).toHaveBeenCalledWith('foo');
  });

  it('calls onStatusFilterChange with "locked" when Locked chip clicked', () => {
    const onStatusFilterChange = jest.fn();
    render(<VaultSearchBar {...defaultProps} onStatusFilterChange={onStatusFilterChange} />);
    fireEvent.click(screen.getByText('Locked'));
    expect(onStatusFilterChange).toHaveBeenCalledWith('locked');
  });

  it('calls onStatusFilterChange with "unlocked" when Unlocked chip clicked', () => {
    const onStatusFilterChange = jest.fn();
    render(<VaultSearchBar {...defaultProps} onStatusFilterChange={onStatusFilterChange} />);
    fireEvent.click(screen.getByText('Unlocked'));
    expect(onStatusFilterChange).toHaveBeenCalledWith('unlocked');
  });

  it('calls onStatusFilterChange with "withdrawn" when Withdrawn chip clicked', () => {
    const onStatusFilterChange = jest.fn();
    render(<VaultSearchBar {...defaultProps} onStatusFilterChange={onStatusFilterChange} />);
    fireEvent.click(screen.getByText('Withdrawn'));
    expect(onStatusFilterChange).toHaveBeenCalledWith('withdrawn');
  });

  it('calls onSortFieldChange when sort select changes', () => {
    const onSortFieldChange = jest.fn();
    render(<VaultSearchBar {...defaultProps} onSortFieldChange={onSortFieldChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'amount' } });
    expect(onSortFieldChange).toHaveBeenCalledWith('amount');
  });

  it('calls onSortDirectionToggle when direction button clicked', () => {
    const onSortDirectionToggle = jest.fn();
    render(<VaultSearchBar {...defaultProps} onSortDirectionToggle={onSortDirectionToggle} />);
    fireEvent.click(screen.getByText('↑ Asc'));
    expect(onSortDirectionToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when clear button clicked', () => {
    const onReset = jest.fn();
    render(<VaultSearchBar {...defaultProps} isFiltered={true} onReset={onReset} />);
    fireEvent.click(screen.getByLabelText('Clear all filters'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
