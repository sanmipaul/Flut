/# Issue 2: Activity Heatmap Filter Persistence

## Overview
This issue implements persistent filter state for the Activity Heatmap, ensuring user selections are maintained across page refreshes, navigation, and browser sessions.

## Problem Statement
Users' heatmap filter selections (activity thresholds, days, hours, color schemes) were not persisting, requiring them to reconfigure filters each time they accessed the analytics dashboard.

## Status: Completed ✅

## Solution

### Components Added

1. **HeatmapFilterPanel** (`web/src/components/HeatmapFilterPanel.tsx`)
   - Dedicated filter controls for ActivityHeatmap
   - Filters by:
     - Minimum activity threshold
     - Days of week (Sunday-Saturday)
     - Hours of day (0-23)
     - Color scheme (blue, green, red, purple)
     - Hide empty cells toggle
   - Visual feedback showing active filter count
   - Reset functionality
   - Fully integrated into AnalyticsDashboard sidebar

### Hooks Added

2. **useHeatmapFilter** (`web/src/hooks/useHeatmapFilter.ts`)
   - Manages heatmap-specific filter state
   - Dual-persistence (localStorage + sessionStorage)
   - Automatic filtering of heatmap data
   - Methods:
     - `filter` - Current filter state
     - `filteredData` - Filtered heatmap data
     - `updateFilter(updates)` - Update filter settings
     - `resetFilter()` - Reset to defaults
     - `clearFilter()` - Clear and remove from storage

### Modified Components

3. **AnalyticsDashboard** (`web/src/components/AnalyticsDashboard.tsx`)
   - Integrated HeatmapFilterPanel into sidebar
   - Connected useHeatmapFilter to ActivityHeatmap
   - Uses dual-persistence for filter state
   - Maintains separate filter state from transaction filters

4. **useAnalytics** (`web/src/hooks/useAnalytics.ts`)
   - Added dual-persistence for analytics filter state
   - Persists across page refreshes
   - Separate storage key from heatmap filters

### Utilities Enhanced

5. **Storage Utilities** (`web/src/utils/storage.ts`)
   - Already provided dual-persistence support
   - Used by both useAnalytics and useHeatmapFilter
   - SSR-safe with error handling

## Features

### Persistence
- **Local Storage**: Filters persist across browser sessions
- **Session Storage**: Privacy mode fallback
- **Dual-Persistence**: Automatic save to both storages
- **SSR-Safe**: Works with server-side rendering

### Filtering Capabilities
- **Activity Threshold**: Show only cells with minimum transaction count
- **Day Filtering**: Select specific days of week to display
- **Hour Filtering**: Select specific hours to display
- **Visual Customization**: Multiple color schemes
- **Empty Cell Toggle**: Hide cells with no activity

### User Experience
- **Separate Filter Sections**: Heatmap filters independent from transaction filters
- **Active Filter Count**: See how many filters are applied
- **Reset Button**: Quick reset to defaults
- **Persistent State**: Selections remembered automatically

## Usage Example

```typescript
import { useHeatmapFilter } from './hooks/useHeatmapFilter';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { HeatmapFilterPanel } from './components/HeatmapFilterPanel';

function AnalyticsView({ transactions }) {
  const heatmapData = generateActivityHeatmap(transactions);
  
  const {
    filter,
    filteredData,
    updateFilter,
    resetFilter,
  } = useHeatmapFilter(heatmapData);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div>
        <HeatmapFilterPanel
          filter={filter}
          onChange={updateFilter}
          onReset={resetFilter}
        />
      </div>
      <div className="col-span-3">
        <ActivityHeatmap
          data={filteredData}
          colorScheme={filter.colorScheme}
        />
      </div>
    </div>
  );
}
```

## Storage Keys

- **Analytics Filters**: `flut-analytics-filter`
- **Heatmap Filters**: `flut-heatmap-filter`
- **Filter Panel**: `flut-filter-panel-state`

## Testing

Comprehensive test coverage includes:
- Filter initialization and defaults
- Data filtering logic
- Storage persistence (save/load)
- Filter reset and clear
- Combined filter behavior
- Component user interactions

Run tests: `npm test -- --run`

## Future Enhancements

- [ ] Date range filtering for heatmap
- [ ] Save/load filter presets
- [ ] Share filter configurations via URL
- [ ] Bulk filter operations
- [ ] Export filtered heatmap data

## References

- Built on existing storage utilities from Issue 1
- Follows same patterns as FilterPanel component
- Maintains separation between analytics and heatmap state
