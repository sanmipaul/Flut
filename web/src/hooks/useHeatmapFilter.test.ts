/**
 * Tests for useHeatmapFilter hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHeatmapFilter } from './useHeatmapFilter';

// Mock storage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

vi.stubGlobal('localStorage', mockLocalStorage);
vi.stubGlobal('sessionStorage', mockSessionStorage);

const mockHeatmapData = [
  { label: '0', value: 5, row: 0, col: 0 },
  { label: '1', value: 10, row: 0, col: 1 },
  { label: '2', value: 0, row: 0, col: 2 },
  { label: '3', value: 15, row: 1, col: 0 },
  { label: '4', value: 3, row: 1, col: 1 },
  { label: '5', value: 0, row: 1, col: 2 },
];

describe('useHeatmapFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it('should initialize with default filter state', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));
    expect(result.current.filter).toEqual({
      minActivity: 0,
      daysOfWeek: [],
      hoursOfDay: [],
      colorScheme: 'blue',
      hideEmptyCells: false,
    });
  });

  it('should load persisted filter state from storage', () => {
    const persistedState = {
      minActivity: 5,
      daysOfWeek: [0, 1],
      hoursOfDay: [10, 11],
      colorScheme: 'green' as const,
      hideEmptyCells: true,
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(persistedState));

    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));
    expect(result.current.filter).toEqual({
      ...persistedState,
    });
  });

  it('should filter data by minimum activity', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ minActivity: 5 });
    });

    expect(result.current.filteredData).toEqual([
      { label: '0', value: 5, row: 0, col: 0 },
      { label: '1', value: 10, row: 0, col: 1 },
      { label: '3', value: 15, row: 1, col: 0 },
    ]);
  });

  it('should filter data by days of week', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ daysOfWeek: [0] });
    });

    expect(result.current.filteredData).toEqual([
      { label: '0', value: 5, row: 0, col: 0 },
      { label: '1', value: 10, row: 0, col: 1 },
      { label: '2', value: 0, row: 0, col: 2 },
    ]);
  });

  it('should filter data by hours of day', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ hoursOfDay: [0, 1] });
    });

    expect(result.current.filteredData).toEqual([
      { label: '0', value: 5, row: 0, col: 0 },
      { label: '1', value: 10, row: 0, col: 1 },
      { label: '3', value: 15, row: 1, col: 0 },
      { label: '4', value: 3, row: 1, col: 1 },
    ]);
  });

  it('should hide empty cells when enabled', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ hideEmptyCells: true });
    });

    expect(result.current.filteredData).toEqual([
      { label: '0', value: 5, row: 0, col: 0 },
      { label: '1', value: 10, row: 0, col: 1 },
      { label: '3', value: 15, row: 1, col: 0 },
      { label: '4', value: 3, row: 1, col: 1 },
    ]);
    expect(result.current.filteredData.some((d) => d.value === 0)).toBe(false);
  });

  it('should update color scheme', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ colorScheme: 'red' });
    });

    expect(result.current.filter.colorScheme).toBe('red');
  });

  it('should persist filter changes to storage', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ minActivity: 10 });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'flut-heatmap-filter',
      JSON.stringify({
        minActivity: 10,
        daysOfWeek: [],
        hoursOfDay: [],
        colorScheme: 'blue',
        hideEmptyCells: false,
      })
    );
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'flut-heatmap-filter',
      JSON.stringify({
        minActivity: 10,
        daysOfWeek: [],
        hoursOfDay: [],
        colorScheme: 'blue',
        hideEmptyCells: false,
      })
    );
  });

  it('should reset filter to defaults', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ minActivity: 10, colorScheme: 'green' });
    });

    act(() => {
      result.current.resetFilter();
    });

    expect(result.current.filter).toEqual({
      minActivity: 0,
      daysOfWeek: [],
      hoursOfDay: [],
      colorScheme: 'blue',
      hideEmptyCells: false,
    });
  });

  it('should clear filter and storage', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({ minActivity: 10 });
    });

    act(() => {
      result.current.clearFilter();
    });

    expect(result.current.filter).toEqual({
      minActivity: 0,
      daysOfWeek: [],
      hoursOfDay: [],
      colorScheme: 'blue',
      hideEmptyCells: false,
    });
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flut-heatmap-filter');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('flut-heatmap-filter');
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useHeatmapFilter(mockHeatmapData));

    act(() => {
      result.current.updateFilter({
        minActivity: 3,
        daysOfWeek: [1],
        hideEmptyCells: true,
      });
    });

    expect(result.current.filteredData).toEqual([
      { label: '1', value: 10, row: 0, col: 1 },
      { label: '4', value: 3, row: 1, col: 1 },
    ]);
  });
});
