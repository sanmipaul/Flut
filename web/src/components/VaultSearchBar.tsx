/**
 * VaultSearchBar
 *
 * Controls for filtering and sorting the vault list. Renders:
 *   - A text input for free-text search (vault ID or nickname)
 *   - Status filter chips: All / Locked / Unlocked / Withdrawn
 *   - A sort dropdown (ID, Amount, Unlock height, Created)
 *   - A sort-direction toggle button
 *   - A result count label and a "Clear" button when filters are active
 *
 * All state lives in the parent via useVaultSearch; this component is purely
 * presentational and calls the provided callbacks on user interaction.
 */
import React, { useId } from 'react';
import type { VaultStatusFilter, VaultSortField, VaultSortDirection } from '../types/VaultSearch';

// ---------------------------------------------------------------------------
// Chip data
// ---------------------------------------------------------------------------

const STATUS_CHIPS: { value: VaultStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'locked', label: 'Locked' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const SORT_OPTIONS: { value: VaultSortField; label: string }[] = [
  { value: 'id', label: 'Vault ID' },
  { value: 'amount', label: 'Amount' },
  { value: 'unlockHeight', label: 'Unlock height' },
  { value: 'createdAt', label: 'Created' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface VaultSearchBarProps {
  query: string;
  statusFilter: VaultStatusFilter;
  sortField: VaultSortField;
  sortDirection: VaultSortDirection;
  matchCount: number;
  totalCount: number;
  isFiltered: boolean;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: VaultStatusFilter) => void;
  onSortFieldChange: (field: VaultSortField) => void;
  onSortDirectionToggle: () => void;
  onReset: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const VaultSearchBar: React.FC<VaultSearchBarProps> = ({
  query,
  statusFilter,
  sortField,
  sortDirection,
  matchCount,
  totalCount,
  isFiltered,
  onQueryChange,
  onStatusFilterChange,
  onSortFieldChange,
  onSortDirectionToggle,
  onReset,
}) => {
  const searchId = useId();
  const sortId = useId();

  const directionLabel = sortDirection === 'asc' ? '↑ Asc' : '↓ Desc';
  const directionAriaLabel =
    sortDirection === 'asc' ? 'Sort ascending (click for descending)' : 'Sort descending (click for ascending)';

  const resultLabel =
    isFiltered
      ? `${matchCount} of ${totalCount} vault${totalCount !== 1 ? 's' : ''}`
      : `${totalCount} vault${totalCount !== 1 ? 's' : ''}`;

  return (
    <div className="vault-search-bar" role="search" aria-label="Search and filter vaults">
      {/* Text search */}
      <div className="vault-search-bar__input-row">
        <label htmlFor={searchId} className="sr-only">
          Search vaults
        </label>
        <input
          id={searchId}
          type="search"
          className="vault-search-bar__input"
          placeholder="Search by ID or name…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search vaults by ID or name"
        />
        {isFiltered && (
          <button
            type="button"
            className="vault-search-bar__clear-btn"
            onClick={onReset}
            aria-label="Clear all filters"
            title="Clear all filters"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status filter chips */}
      <div className="vault-search-bar__chips" role="group" aria-label="Filter by vault status">
        {STATUS_CHIPS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`vault-search-bar__chip vault-search-bar__chip--${value} ${
              statusFilter === value ? 'vault-search-bar__chip--active' : ''
            }`}
            onClick={() => onStatusFilterChange(value)}
            aria-pressed={statusFilter === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort controls */}
      <div className="vault-search-bar__sort-row">
        <label htmlFor={sortId} className="vault-search-bar__sort-label">
          Sort
        </label>
        <select
          id={sortId}
          className="vault-search-bar__sort-select"
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as VaultSortField)}
          aria-label="Sort vaults by field"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="vault-search-bar__direction-btn"
          onClick={onSortDirectionToggle}
          aria-label={directionAriaLabel}
          title={directionAriaLabel}
        >
          {directionLabel}
        </button>
      </div>

      {/* Result count — aria-live so screen readers announce changes */}
      <p
        className="vault-search-bar__result-count"
        aria-live="polite"
        aria-atomic="true"
      >
        {resultLabel}
      </p>
    </div>
  );
};

export default VaultSearchBar;
