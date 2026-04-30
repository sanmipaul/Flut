/**
 * HeatmapFilterPanel
 *
 * Filter controls specifically for the ActivityHeatmap component.
 * Allows users to filter heatmap data by activity level, days, hours,
 * and color scheme. All preferences are persisted across sessions.
 */
import React, { useState } from 'react';
import type { HeatmapFilterState } from '../hooks/useHeatmapFilter';

interface HeatmapFilterPanelProps {
  filter: HeatmapFilterState;
  onChange: (updates: Partial<HeatmapFilterState>) => void;
  onReset?: () => void;
}

export const HeatmapFilterPanel: React.FC<HeatmapFilterPanelProps> = ({
  filter,
  onChange,
  onReset,
}) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleMinActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ minActivity: Math.max(0, parseInt(e.target.value) || 0) });
  };

  const handleDayToggle = (day: number) => {
    const newDays = filter.daysOfWeek.includes(day)
      ? filter.daysOfWeek.filter((d) => d !== day)
      : [...filter.daysOfWeek, day];
    onChange({ daysOfWeek: newDays });
  };

  const handleHourToggle = (hour: number) => {
    const newHours = filter.hoursOfDay.includes(hour)
      ? filter.hoursOfDay.filter((h) => h !== hour)
      : [...filter.hoursOfDay, hour];
    onChange({ hoursOfDay: newHours });
  };

  const handleColorSchemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ colorScheme: e.target.value as HeatmapFilterState['colorScheme'] });
  };

  const handleHideEmptyToggle = () => {
    onChange({ hideEmptyCells: !filter.hideEmptyCells });
  };

  const activeFilterCount =
    (filter.minActivity > 0 ? 1 : 0) +
    filter.daysOfWeek.length +
    filter.hoursOfDay.length +
    (filter.hideEmptyCells ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-4">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Heatmap Filters</h2>
          {activeFilterCount > 0 && (
            <span className="text-xs text-blue-600 font-medium">
              {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {onReset && (
            <button
              onClick={onReset}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Minimum Activity Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Activity
          </label>
          <input
            type="number"
            min="0"
            value={filter.minActivity}
            onChange={handleMinActivityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Min transactions"
          />
        </div>

        {/* Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days of Week
          </label>
          <div className="flex flex-wrap gap-1">
            {daysOfWeek.map((day, index) => (
              <button
                key={day}
                onClick={() => handleDayToggle(index)}
                className={`px-2 py-1 text-xs rounded ${filter.daysOfWeek.includes(index)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Hours of Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours of Day
          </label>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {hours.map((hour) => (
              <button
                key={hour}
                onClick={() => handleHourToggle(hour)}
                className={`w-8 h-6 text-xs rounded ${filter.hoursOfDay.includes(hour)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        {/* Color Scheme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Scheme
          </label>
          <select
            value={filter.colorScheme}
            onChange={handleColorSchemeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
            <option value="purple">Purple</option>
          </select>
        </div>

        {/* Hide Empty Cells */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.hideEmptyCells}
              onChange={handleHideEmptyToggle}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Hide empty cells</span>
          </label>
        </div>
      </div>
    </div>
  );
};
