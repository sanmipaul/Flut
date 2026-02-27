import React from 'react';
import { ChartDataPoint } from '../types/TransactionHistory';

interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  height?: number;
  barColor?: string;
  showGrid?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  yAxisLabel,
  xAxisLabel,
  height = 300,
  barColor = '#3b82f6',
  showGrid = true,
}) => {
  if (!data || data.length === 0) {
    return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-[{height}px] flex items-center justify-center text-gray-500">No data available</div>;
  }

  // Calculate dimensions
  const padding = { top: 30, right: 30, bottom: 50, left: 70 };
  const chartWidth = 600 - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min/max values
  const values = data.map((d) => d.value);
  const minValue = 0;
  const maxValue = Math.max(...values);
  const valueRange = maxValue || 1;
  const padding_value = valueRange * 0.1;

  // Scale functions
  const yScale = (value: number) => {
    const scale = value / (valueRange + padding_value);
    return padding.top + chartHeight - scale * chartHeight;
  };

  const xScale = (index: number) => {
    return padding.left + (index / data.length) * chartWidth;
  };

  const barWidth = (chartWidth / data.length) * 0.7;
  const barGap = (chartWidth / data.length) * 0.3;

  // Generate grid lines
  const gridLines = [];
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const y = padding.top + (i / gridSteps) * chartHeight;
    const value = maxValue - (i / gridSteps) * valueRange;
    if (showGrid) {
      gridLines.push(
        <line
          key={`grid-${i}`}
          x1={padding.left}
          y1={y}
          x2={padding.left + chartWidth}
          y2={y}
          stroke="#e5e7eb"
          strokeDasharray="4"
        />
      );
    }
    gridLines.push(
      <text key={`label-${i}`} x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
        {value.toFixed(0)}
      </text>
    );
  }

  // Generate x-axis labels
  const xLabels = [];
  const labelStep = Math.max(1, Math.floor(data.length / 10));
  for (let i = 0; i < data.length; i += labelStep) {
    const x = xScale(i) + barWidth / 2;
    xLabels.push(
      <text
        key={`xlabel-${i}`}
        x={x}
        y={padding.top + chartHeight + 20}
        textAnchor="middle"
        fontSize="12"
        fill="#6b7280"
      >
        {data[i].label}
      </text>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <svg width="100%" height={height} viewBox={`0 0 600 ${height}`} className="w-full">
        {gridLines}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#d1d5db"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#d1d5db" strokeWidth="2" />

        {/* Bars */}
        {data.map((d, i) => {
          const x = xScale(i) + barGap / 2;
          const barHeight = (d.value / (valueRange + padding_value)) * chartHeight;
          const y = padding.top + chartHeight - barHeight;

          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                opacity="0.8"
                rx="4"
                className="hover:opacity-100 transition cursor-pointer"
              />
              {/* Value label on bar */}
              {barHeight > 20 && (
                <text
                  x={x + barWidth / 2}
                  y={y + 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill="white"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {d.value.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabels}

        {/* Axis labels */}
        {yAxisLabel && (
          <text x={20} y={padding.top + chartHeight / 2} transform={`rotate(-90, 20, ${padding.top + chartHeight / 2})`} fontSize="12" fill="#6b7280" textAnchor="middle">
            {yAxisLabel}
          </text>
        )}
        {xAxisLabel && (
          <text x={padding.left + chartWidth / 2} y={height - 10} fontSize="12" fill="#6b7280" textAnchor="middle">
            {xAxisLabel}
          </text>
        )}
      </svg>
    </div>
  );
};

export default BarChart;
