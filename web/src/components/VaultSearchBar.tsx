import React, { useRef, useEffect, useCallback } from 'react';
import {
  VaultFilterState,
  VaultStatusFilter,
  VaultLockFilter,
  VaultSortField,
} from '../types/VaultFilterTypes';

export interface VaultSearchBarProps {
  filterState: VaultFilterState;
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (q: string) => void;
  onStatusFilterChange: (f: VaultStatusFilter) => void;
  onLockFilterChange: (f: VaultLockFilter) => void;
  onSortFieldChange: (f: VaultSortField) => void;
  onToggleSortDirection: () => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS: { label: string; value: VaultStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Withdrawn', value: 'withdrawn' },
];

const LOCK_OPTIONS: { label: string; value: VaultLockFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Locked', value: 'locked' },
  { label: 'Unlocked', value: 'unlocked' },
];

const SORT_OPTIONS: { label: string; value: VaultSortField }[] = [
  { label: 'ID', value: 'id' },
  { label: 'Amount', value: 'amount' },
  { label: 'Unlock', value: 'unlockHeight' },
  { label: 'Created', value: 'createdAt' },
];

function getSortFieldLabel(field: VaultSortField): string {
  const map: Record<VaultSortField, string> = {
    id: 'Vault ID',
    amount: 'Amount',
    unlockHeight: 'Unlock block',
    createdAt: 'Created block',
  };
  return map[field];
}

const VaultSearchBar: React.FC<VaultSearchBarProps> = ({
  filterState,
  resultCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onLockFilterChange,
  onSortFieldChange,
  onToggleSortDirection,
  onClearFilters,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd + F focuses the search input
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const sortIcon = filterState.sortDirection === 'asc' ? '↑' : '↓';

  return (
    <div className="vault-search-bar">
      {/* Search input */}
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          value={filterState.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID or address…"
          aria-label="Search vaults"
        />
        {filterState.searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="filter-row" role="group" aria-label="Filter by status">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-chip ${filterState.statusFilter === opt.value ? 'active' : ''}`}
            onClick={() => onStatusFilterChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Lock filter */}
      <div className="filter-row" role="group" aria-label="Filter by lock state">
        {LOCK_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-chip ${filterState.lockFilter === opt.value ? 'active' : ''}`}
            onClick={() => onLockFilterChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sort controls */}
      <div className="sort-row">
        <span className="sort-label">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`sort-chip ${filterState.sortField === opt.value ? 'active' : ''}`}
            onClick={() => onSortFieldChange(opt.value)}
            type="button"
          >
            {opt.label}
            {filterState.sortField === opt.value && (
              <span className="sort-direction" aria-hidden="true">
                {' '}{sortIcon}
              </span>
            )}
          </button>
        ))}
        <button
          className="sort-dir-btn"
          onClick={onToggleSortDirection}
          aria-label={`Sort ${filterState.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          title="Toggle sort direction"
          type="button"
        >
          {sortIcon}
        </button>
      </div>

      {/* Results summary + clear */}
      <div className="filter-summary">
        <span
          className="result-count"
          title={hasActiveFilters ? `Sorted by ${getSortFieldLabel(filterState.sortField)}` : undefined}
        >
          {resultCount === totalCount
            ? `${totalCount} vault${totalCount !== 1 ? 's' : ''}`
            : `${resultCount} of ${totalCount} vaults`}
        </span>
        {hasActiveFilters && (
          <button
            className="clear-filters-btn"
            onClick={onClearFilters}
            type="button"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default VaultSearchBar;
