import React from 'react';
import type { DecisionFactor } from '@workspace/api-client-react';

interface RadarChartProps {
  factors: DecisionFactor[];
  size?: number;
  highlightKey?: string;
  onHoverFactor?: (key: string | null) => void;
}

export function RadarChart({ factors, size = 320, highlightKey, onHoverFactor }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const total = factors.length;

  // Convert factor index to angle (starting at top -90 deg)
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate grid circles (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Polygon points for factor values
  const points = factors.map((factor, index) => {
    // For risk & timeline, display effective readiness score
    const effectiveValue =
      factor.key === 'riskExposure' || factor.key === 'timelinePressure'
        ? 100 - factor.score
        : factor.score;
    const ratio = Math.max(0.05, Math.min(1.0, effectiveValue / 100));
    const { x, y } = getCoordinates(index, ratio);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="dl-radar-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="dl-radar-svg">
        {/* Background Grid Circles */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={radius * level}
            fill={level === 0.75 ? 'rgba(44, 130, 125, 0.04)' : 'none'}
            stroke={level === 0.75 ? '#2c827d' : '#d8d1c2'}
            strokeWidth={level === 0.75 ? '1.5' : '1'}
            strokeDasharray={level === 0.75 ? '3 3' : undefined}
          />
        ))}

        {/* Axes lines */}
        {factors.map((_, index) => {
          const { x, y } = getCoordinates(index, 1.0);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#dfd7c8"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={points}
          fill="rgba(44, 130, 125, 0.24)"
          stroke="#2c827d"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vertices and Interactive Points */}
        {factors.map((factor, index) => {
          const effectiveValue =
            factor.key === 'riskExposure' || factor.key === 'timelinePressure'
              ? 100 - factor.score
              : factor.score;
          const ratio = Math.max(0.05, Math.min(1.0, effectiveValue / 100));
          const { x, y } = getCoordinates(index, ratio);
          const labelCoord = getCoordinates(index, 1.22);
          const isHighlighted = highlightKey === factor.key;

          // Split factor label for compact multi-line display
          const words = factor.label.split(' ');

          return (
            <g
              key={factor.key}
              onMouseEnter={() => onHoverFactor?.(factor.key)}
              onMouseLeave={() => onHoverFactor?.(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Vertex Circle */}
              <circle
                cx={x}
                cy={y}
                r={isHighlighted ? 6 : 4}
                fill={factor.direction === 'negative' ? '#d66d58' : '#2c827d'}
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Label */}
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontFamily="var(--app-font-sans)"
                fontWeight={isHighlighted ? '700' : '600'}
                fill={isHighlighted ? '#173142' : '#576c70'}
              >
                {words.length > 1 ? (
                  <>
                    <tspan x={labelCoord.x} dy="-0.4em">{words[0]}</tspan>
                    <tspan x={labelCoord.x} dy="1.1em">{words.slice(1).join(' ')}</tspan>
                  </>
                ) : (
                  factor.label
                )}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#687b7a', marginTop: '6px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2c827d' }} /> Readiness Pillar
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 12, height: 2, background: '#2c827d', borderTop: '1px dashed #2c827d' }} /> Proceed Threshold (75)
        </span>
      </div>
    </div>
  );
}
