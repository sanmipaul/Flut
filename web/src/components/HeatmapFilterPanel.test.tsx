/**
 * Tests for HeatmapFilterPanel component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeatmapFilterPanel } from './HeatmapFilterPanel';

describe('HeatmapFilterPanel', () => {
  const defaultFilter = {
    minActivity: 0,
    daysOfWeek: [],
    hoursOfDay: [],
    colorScheme: 'blue' as const,
    hideEmptyCells: false,
  };

  it('should render with default filter', () => {
    const onChange = vi.fn();
    render(
      <HeatmapFilterPanel filter={defaultFilter} onChange={onChange} />
    );

    expect(screen.getByText('Heatmap Filters')).toBeDefined();
    expect(screen.getByLabelText('Minimum Activity')).toBeDefined();
    expect(screen.getByText('Days of Week')).toBeDefined();
    expect(screen.getByText('Hours of Day')).toBeDefined();
    expect(screen.getByText('Color Scheme')).toBeDefined();
    expect(screen.getByText('Hide empty cells')).toBeDefined();
  });

  it('should update minimum activity', () => {
    const onChange = vi.fn();
    render(
      <HeatmapFilterPanel filter={defaultFilter} onChange={onChange} />
    );

    const input = screen.getByLabelText('Minimum Activity') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith({ minActivity: 5 });
  });

  it('should toggle days of week', () => {
    const onChange = vi.fn();
    render(
      <HeatmapFilterPanel filter={defaultFilter} onChange={onChange} />
    );

    const monButton = screen.getByText('Mon');
    fireEvent.click(monButton);

    expect(onChange).toHaveBeenCalledWith({ daysOfWeek: [1] });
  });

  it('should toggle hours of day', () => {
    const onChange = vi.fn();
    render(
      <HeatmapFilterPanel filter={defaultFilter} onChange={onChange} />
    );

    // Find hour button (e.g., "10")
    const hourButton = screen.getByText('10');
    fireEvent.click(hourButton);

    expect(onChange).toHaveBeenCalledWith({ hoursOfDay: [10] });
  });

  it('should change color scheme', () => {
    const onChange = vi.fn();
    render(
      <HeatmapFilterPanel filter={defaultFilter} onChange={onChange} />
    );

    const select = screen.getByLabelText('Color Scheme') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'green' } });

    expect(onChange).toHaveBeenCalledWith({ colorScheme: 'green' });
  });

  it('should toggle hide empty cells', () => {
    const onChange = vi.fn();
    render(
      <HeatmapFilterPanel filter={defaultFilter} onChange={onChange} />
    );

    const checkbox = screen.getByLabelText('Hide empty cells');
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith({ hideEmptyCells: true });
  });

  it('should show active filter count', () => {
    const filter = {
      ...defaultFilter,
      minActivity: 5,
      daysOfWeek: [0],
    };
    render(
      <HeatmapFilterPanel filter={filter} onChange={vi.fn()} />
    );

    expect(screen.getByText(/2 active filter/)).toBeDefined();
  });

  it('should show reset button when onReset provided', () => {
    const onReset = vi.fn();
    render(
      <HeatmapFilterPanel
        filter={defaultFilter}
        onChange={vi.fn()}
        onReset={onReset}
      />
    );

    expect(screen.getByText('Reset')).toBeDefined();
  });

  it('should call onReset when reset button clicked', () => {
    const onReset = vi.fn();
    render(
      <HeatmapFilterPanel
        filter={defaultFilter}
        onChange={vi.fn()}
        onReset={onReset}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('should render with multiple days selected', () => {
    const filter = {
      ...defaultFilter,
      daysOfWeek: [0, 1, 2],
    };
    render(
      <HeatmapFilterPanel filter={filter} onChange={vi.fn()} />
    );

    expect(screen.getByText('Sun')).toBeDefined();
    expect(screen.getByText('Mon')).toBeDefined();
    expect(screen.getByText('Tue')).toBeDefined();
  });

  it('should render with multiple hours selected', () => {
    const filter = {
      ...defaultFilter,
      hoursOfDay: [9, 10, 11],
    };
    render(
      <HeatmapFilterPanel filter={filter} onChange={vi.fn()} />
    );

    expect(screen.getByText('9')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('11')).toBeDefined();
  });
});
