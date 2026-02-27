import React from 'react';
import { ChartDataPoint } from '../types/TransactionHistory';

interface PieChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  innerRadius?: number; // For donut chart (0 = pie, > 0 = donut)
}

export const PieChart: React.FC<PieChartProps> = ({ data, title, height = 300, innerRadius = 0 }) => {
  if (!data || data.length === 0) {
    return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-[{height}px] flex items-center justify-center text-gray-500">No data available</div>;
  }

  const defaultColors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
  ];

  // Calculate total
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Generate slice paths
  let currentAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // Outer points
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    // Determine if arc is large
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    // Build path
    let pathData = `M ${centerX} ${centerY} L ${x1} ${y1}`;
    pathData += ` A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Inner arc for donut
    if (innerRadius > 0) {
      const ix1 = centerX + innerRadius * Math.cos(startAngle);
      const iy1 = centerY + innerRadius * Math.sin(startAngle);
      const ix2 = centerX + innerRadius * Math.cos(endAngle);
      const iy2 = centerY + innerRadius * Math.sin(endAngle);

      pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
      pathData += ` L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    }

    // Label position
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = innerRadius > 0 ? (radius + innerRadius) / 2 : radius / 1.5;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);
    const percentage = ((d.value / total) * 100).toFixed(1);

    const color = defaultColors[i % defaultColors.length];

    currentAngle = endAngle;

    return {
      pathData,
      color,
      label: d.label,
      value: d.value,
      percentage,
      labelX,
      labelY,
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        <svg width="100%" height={height} viewBox="0 0 400 300" className="w-full max-w-xs">
          {/* Slices */}
          {slices.map((slice, i) => (
            <g key={`slice-${i}`}>
              <path d={slice.pathData} fill={slice.color} opacity="0.8" className="hover:opacity-100 transition cursor-pointer" />
              {/* Percentage label */}
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight="bold"
                fill="white"
                pointerEvents="none"
              >
                {slice.percentage}%
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="space-y-2 flex-shrink-0">
          {slices.map((slice, i) => (
            <div key={`legend-${i}`} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-sm text-gray-700">{slice.label}</span>
              <span className="text-sm font-semibold text-gray-900">{slice.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
