/**
 * useHeatmapFilter
 *
 * Manages filter state specifically for the ActivityHeatmap component.
 * Persists filter selections to allow users to maintain their view
 * preferences across sessions.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HeatmapData } from '../components/ActivityHeatmap';
import { loadDualStorage, saveDualStorage } from '../utils/storage';

const HEATMAP_FILTER_KEY = 'flut-heatmap-filter';

export interface HeatmapFilterState {
  /** Filter by minimum activity threshold */
  minActivity: number;
  /** Filter by specific days of week (0=Sunday, 6=Saturday) */
  daysOfWeek: number[];
  /** Filter by specific hours of day (0-23) */
  hoursOfDay: number[];
  /** Color scheme for visualization */
  colorScheme: 'blue' | 'green' | 'red' | 'purple';
  /** Show only cells with activity */
  hideEmptyCells: boolean;
}

export const defaultHeatmapFilter: HeatmapFilterState = {
  minActivity: 0,
  daysOfWeek: [],
  hoursOfDay: [],
  colorScheme: 'blue',
  hideEmptyCells: false,
};

export function useHeatmapFilter(initialData: HeatmapData[]) {
  const loadPersistedState = useMemo((): HeatmapFilterState => {
    if (typeof window === 'undefined') {
      return defaultHeatmapFilter;
    }
    const persisted = loadDualStorage<HeatmapFilterState>(HEATMAP_FILTER_KEY);
    return persisted ? { ...defaultHeatmapFilter, ...persisted } : defaultHeatmapFilter;
  }, []);

  const [filter, setFilter] = useState<HeatmapFilterState>(loadPersistedState);
  const [filteredData, setFilteredData] = useState<HeatmapData[]>(initialData);

  // Persist filter changes
  useEffect(() => {
    saveDualStorage(HEATMAP_FILTER_KEY, filter);
  }, [filter]);

  // Apply filters to data
  useEffect(() => {
    let result = [...initialData];

    // Filter by minimum activity
    if (filter.minActivity > 0) {
      result = result.filter((d) => d.value >= filter.minActivity);
    }

    // Filter by days of week
    if (filter.daysOfWeek.length > 0) {
      result = result.filter((d) => filter.daysOfWeek.includes(d.row));
    }

    // Filter by hours of day
    if (filter.hoursOfDay.length > 0) {
      result = result.filter((d) => filter.hoursOfDay.includes(d.col));
    }

    // Hide empty cells
    if (filter.hideEmptyCells) {
      result = result.filter((d) => d.value > 0);
    }

    setFilteredData(result);
  }, [initialData, filter]);

  const updateFilter = useCallback((updates: Partial<HeatmapFilterState>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(defaultHeatmapFilter);
  }, []);

  const clearFilter = useCallback(() => {
    setFilter(defaultHeatmapFilter);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(HEATMAP_FILTER_KEY);
        sessionStorage.removeItem(HEATMAP_FILTER_KEY);
      } catch (e) {
        console.warn('Failed to clear heatmap filter storage', e);
      }
    }
  }, []);

  return {
    filter,
    filteredData,
    updateFilter,
    resetFilter,
    clearFilter,
  };
}
