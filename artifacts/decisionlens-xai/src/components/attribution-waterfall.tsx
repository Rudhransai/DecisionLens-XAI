import React from 'react';
import type { DecisionFactor } from '@workspace/api-client-react';

interface AttributionWaterfallProps {
  factors: DecisionFactor[];
  overallScore: number;
}

export function AttributionWaterfall({ factors, overallScore }: AttributionWaterfallProps) {
  // Sort factors by impact magnitude (largest positive first, then largest negative)
  const sortedFactors = [...factors].sort((a, b) => b.impact - a.impact);

  return (
    <div className="dl-waterfall-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ font: '600 11px var(--app-font-mono)', textTransform: 'uppercase', letterSpacing: '.1em', color: '#6e807b' }}>
          Factor Attribution vs Neutral Baseline (50)
        </div>
        <div style={{ font: '600 12px var(--app-font-mono)', color: '#2c827d' }}>
          Net Delta: {overallScore >= 50 ? `+${overallScore - 50}` : `${overallScore - 50}`} pts
        </div>
      </div>

      <div>
        {sortedFactors.map((factor) => {
          const isPositive = factor.impact >= 0;
          // Scale impact visually (-15 to +15 max range)
          const absImpact = Math.min(15, Math.abs(factor.impact));
          const widthPercent = (absImpact / 15) * 100;

          return (
            <div key={factor.key} className="dl-waterfall-bar-row">
              <div style={{ fontWeight: 600, color: '#173142' }}>{factor.label}</div>
              <div className="dl-waterfall-track">
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: '#a5b5af',
                    zIndex: 2,
                  }}
                />
                <div
                  className={`dl-waterfall-fill ${isPositive ? 'pos' : 'neg'}`}
                  style={{
                    position: 'absolute',
                    left: isPositive ? '50%' : `calc(50% - ${widthPercent / 2}%)`,
                    width: `${widthPercent / 2}%`,
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: 'right',
                  font: '600 11px var(--app-font-mono)',
                  color: isPositive ? '#2c827d' : '#d66d58',
                }}
              >
                {factor.impact > 0 ? `+${factor.impact}` : factor.impact} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
