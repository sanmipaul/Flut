import React from 'react';

interface HeatmapData {
  label: string;
  value: number;
  row: number;
  col: number;
}

interface ActivityHeatmapProps {
  data: HeatmapData[];
  title?: string;
  rowLabels: string[];
  colLabels: string[];
  colorScheme?: 'blue' | 'green' | 'red' | 'purple';
}

const getColorForValue = (value: number, max: number, scheme: string): string => {
  const intensity = Math.min(value / max, 1);

  const colorMap: { [key: string]: string[] } = {
    blue: [
      '#f0f9ff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#0ea5e9',
      '#0284c7',
      '#0369a1',
      '#075985',
      '#0c2d6b',
    ],
    green: [
      '#f0fdf4',
      '#dbeafe',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
    ],
    red: [
      '#fef2f2',
      '#fee2e2',
      '#fecaca',
      '#fca5a5',
      '#f87171',
      '#ef4444',
      '#dc2626',
      '#b91c1c',
      '#991b1b',
      '#7f1d1d',
    ],
    purple: [
      '#faf5ff',
      '#f3e8ff',
      '#e9d5ff',
      '#d8b4fe',
      '#c084fc',
      '#a855f7',
      '#9333ea',
      '#7e22ce',
      '#6b21a8',
      '#581c87',
    ],
  };

  const colors = colorMap[scheme] || colorMap['blue'];
  const index = Math.floor(intensity * (colors.length - 1));
  return colors[index];
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  title,
  rowLabels,
  colLabels,
  colorScheme = 'blue',
}) => {
  if (!data || data.length === 0) {
    return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const cellSize = 30;
  const labelWidth = 150;
  const labelHeight = 40;

  const svgWidth = labelWidth + colLabels.length * cellSize + 20;
  const svgHeight = labelHeight + rowLabels.length * cellSize + 40;

  // Create a lookup map for quick access
  const dataMap = new Map<string, number>();
  data.forEach((d) => {
    dataMap.set(`${d.row}-${d.col}`, d.value);
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-auto">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

      <div className="inline-block overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="border border-gray-200">
          {/* Column labels */}
          {colLabels.map((label, col) => (
            <text
              key={`col-${col}`}
              x={labelWidth + col * cellSize + cellSize / 2}
              y={labelHeight - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
              fontWeight="bold"
            >
              {label}
            </text>
          ))}

          {/* Row labels */}
          {rowLabels.map((label, row) => (
            <text
              key={`row-${row}`}
              x={labelWidth - 10}
              y={labelHeight + row * cellSize + cellSize / 2 + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
              fontWeight="bold"
            >
              {label}
            </text>
          ))}

          {/* Heatmap cells */}
          {rowLabels.map((_, row) =>
            colLabels.map((_, col) => {
              const value = dataMap.get(`${row}-${col}`) || 0;
              const color = getColorForValue(value, maxValue, colorScheme);
              const x = labelWidth + col * cellSize;
              const y = labelHeight + row * cellSize;

              return (
                <g key={`cell-${row}-${col}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={color}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    className="hover:stroke-gray-400 hover:stroke-2 cursor-pointer transition"
                  />
                  {value > 0 && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="11"
                      fontWeight="bold"
                      fill={value > maxValue * 0.6 ? '#fff' : '#1f2937'}
                    >
                      {value}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-xs text-gray-600 font-medium">Low</span>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
          <div
            key={intensity}
            className="w-8 h-4 rounded"
            style={{
              backgroundColor: getColorForValue(intensity * maxValue, maxValue, colorScheme),
              border: '1px solid #d1d5db',
            }}
          />
        ))}
        <span className="text-xs text-gray-600 font-medium">High ({maxValue})</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
