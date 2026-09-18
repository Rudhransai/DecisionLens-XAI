import React, { useState, useMemo } from 'react';
import { Target, ArrowRight, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import type { DecisionFactor } from '@workspace/api-client-react';

interface GoalSeekerProps {
  factors: DecisionFactor[];
  currentScore: number;
  currentRecommendation: string;
  onApplyPresetChanges?: (updatedValues: Record<string, number>) => void;
}

const FACTOR_WEIGHTS: Record<string, number> = {
  strategicAlignment: 0.18,
  financialReadiness: 0.16,
  technicalReadiness: 0.17,
  teamReadiness: 0.14,
  marketEvidence: 0.14,
  riskExposure: 0.12,
  timelinePressure: 0.09,
};

export function GoalSeeker({ factors, currentScore, currentRecommendation, onApplyPresetChanges }: GoalSeekerProps) {
  const [targetScore, setTargetScore] = useState<number>(() => Math.min(100, Math.max(75, currentScore + 10)));
  const [applied, setApplied] = useState(false);

  // Calculate optimization plan
  const plan = useMemo(() => {
    const scoreGap = targetScore - currentScore;

    if (scoreGap <= 0) {
      return {
        feasible: true,
        neededPoints: 0,
        adjustments: [],
        effortLevel: 'Target Already Met',
        summary: 'Current evaluation already satisfies or exceeds the selected target threshold.',
        highestLeverageFactor: null,
      };
    }

    // Sort factors by impact efficiency (headroom * weight)
    const factorHeadroom = factors.map((f) => {
      const isInverse = f.key === 'riskExposure' || f.key === 'timelinePressure';
      const weight = FACTOR_WEIGHTS[f.key] || 0.14;
      const headroom = isInverse ? f.score : 100 - f.score;
      const potentialGain = headroom * weight;

      return {
        key: f.key,
        label: f.label,
        currentScore: f.score,
        isInverse,
        weight,
        headroom,
        potentialGain,
      };
    });

    // Greedily allocate points to highest weight / highest headroom factors
    factorHeadroom.sort((a, b) => b.potentialGain - a.potentialGain);

    let remainingGap = scoreGap;
    const adjustments: Array<{
      key: string;
      label: string;
      from: number;
      to: number;
      delta: number;
      isInverse: boolean;
      pointsGained: number;
      recommendationNote: string;
    }> = [];

    for (const item of factorHeadroom) {
      if (remainingGap <= 0.1) break;
      if (item.headroom <= 0) continue;

      const maxContribution = item.potentialGain;
      const neededContribution = Math.min(remainingGap, maxContribution);
      const neededFactorChange = Math.ceil(neededContribution / item.weight);

      const actualFactorChange = Math.min(item.headroom, neededFactorChange);
      const pointsGained = Math.round(actualFactorChange * item.weight * 10) / 10;

      const newScore = item.isInverse
        ? Math.max(0, item.currentScore - actualFactorChange)
        : Math.min(100, item.currentScore + actualFactorChange);

      adjustments.push({
        key: item.key,
        label: item.label,
        from: item.currentScore,
        to: newScore,
        delta: item.isInverse ? -actualFactorChange : actualFactorChange,
        isInverse: item.isInverse,
        pointsGained,
        recommendationNote: item.isInverse
          ? `Reduce ${item.label.toLowerCase()} by ${actualFactorChange} pts (e.g. increase safety buffer)`
          : `Boost ${item.label.toLowerCase()} by ${actualFactorChange} pts to unlock readiness`,
      });

      remainingGap -= pointsGained;
    }

    const totalDelta = adjustments.reduce((acc, a) => acc + Math.abs(a.delta), 0);
    const effortLevel = totalDelta < 18 ? 'Low Effort (Immediate)' : totalDelta < 38 ? 'Moderate Effort (1-2 Sprints)' : 'Strategic Pivot Required';

    return {
      feasible: remainingGap <= 2,
      neededPoints: scoreGap,
      adjustments,
      effortLevel,
      summary: `Achieve a score of ${targetScore} (${targetScore >= 75 ? 'PROCEED' : 'GUARDRAILS'}) with ${adjustments.length} focused interventions.`,
      highestLeverageFactor: adjustments[0]?.label || 'Strategic Alignment',
    };
  }, [factors, currentScore, targetScore]);

  const handleApply = () => {
    if (!onApplyPresetChanges) return;
    const updated: Record<string, number> = {};
    factors.forEach((f) => {
      const match = plan.adjustments.find((a) => a.key === f.key);
      updated[f.key] = match ? match.to : f.score;
    });
    onApplyPresetChanges(updated);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div className="dl-panel dl-panel-pad" style={{ marginTop: '20px', border: '1px solid #c9dfd6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#e0f2ec', color: 'var(--dl-teal)', padding: '6px', borderRadius: '6px' }}>
              <Target size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                Inverse Goal-Seeker Engine
              </h3>
              <div style={{ fontSize: '11px', color: '#688079', marginTop: '2px' }}>
                Mathematical optimization computing the minimal friction path to reach decision thresholds.
              </div>
            </div>
          </div>
        </div>

        {/* Target Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { label: 'Guardrails (60)', val: 60 },
            { label: 'Proceed (75)', val: 75 },
            { label: 'High Certainty (85)', val: 85 },
            { label: 'Flawless (95)', val: 95 },
          ].map((preset) => (
            <button
              key={preset.val}
              className={`dl-filter ${targetScore === preset.val ? 'active' : ''}`}
              style={{ fontSize: '11px', padding: '4px 9px' }}
              onClick={() => setTargetScore(preset.val)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Slider & Metrics */}
      <div style={{ background: '#f4fbf8', borderRadius: '8px', padding: '14px', marginTop: '16px', border: '1px solid #d4ede2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dl-ink)' }}>
            Target Readiness Threshold: <strong style={{ color: 'var(--dl-teal)', fontSize: '15px' }}>{targetScore}/100</strong>
          </span>
          <span style={{ fontSize: '11px', color: '#688079' }}>
            Current: <strong>{currentScore}/100</strong> ({currentRecommendation.toUpperCase()})
          </span>
        </div>

        <input
          type="range"
          min="40"
          max="98"
          value={targetScore}
          onChange={(e) => setTargetScore(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--dl-teal)' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#7a918a', marginTop: '4px', fontFamily: 'var(--app-font-mono)' }}>
          <span>40 (Rework)</span>
          <span>60 (Guardrails)</span>
          <span>75 (Proceed Baseline)</span>
          <span>95 (Max Certainty)</span>
        </div>
      </div>

      {/* Plan Summary Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '14px' }}>
        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e1e9e5' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7a8d87', fontFamily: 'var(--app-font-mono)' }}>
            Feasibility & Effort
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dl-ink)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <TrendingUp size={13} color="var(--dl-teal)" />
            {plan.effortLevel}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e1e9e5' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7a8d87', fontFamily: 'var(--app-font-mono)' }}>
            Top Leverage Factor
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dl-teal)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} />
            {plan.highestLeverageFactor || 'None needed'}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e1e9e5' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7a8d87', fontFamily: 'var(--app-font-mono)' }}>
            Score Delta Required
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: plan.neededPoints > 0 ? '#d97706' : '#16a34a', marginTop: '3px' }}>
            {plan.neededPoints > 0 ? `+${plan.neededPoints} Points Needed` : 'Target Achieved ✓'}
          </div>
        </div>
      </div>

      {/* Adjustments List */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dl-ink)', marginBottom: '8px' }}>
          Prescriptive Optimal Adjustments:
        </div>

        {plan.adjustments.length === 0 ? (
          <div style={{ padding: '12px', background: '#f8faf9', borderRadius: '6px', fontSize: '12px', color: '#556b65', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            No adjustments needed. The current scenario meets this threshold.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plan.adjustments.map((adj) => (
              <div
                key={adj.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 12px',
                  background: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #e2ece7',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--dl-ink)' }}>{adj.label}: </span>
                  <span style={{ fontSize: '11px', color: '#688079' }}>{adj.recommendationNote}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--app-font-mono)', color: '#889893' }}>{adj.from}</span>
                  <ArrowRight size={12} color="#889893" />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--app-font-mono)', fontWeight: 700, color: 'var(--dl-teal)' }}>
                    {adj.to}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: adj.isInverse ? '#eef8f5' : '#f0fdf4',
                      color: adj.isInverse ? 'var(--dl-teal)' : '#16a34a',
                      fontWeight: 600,
                    }}
                  >
                    {adj.delta > 0 ? `+${adj.delta}` : `${adj.delta}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {onApplyPresetChanges && plan.adjustments.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button
            className="dl-btn dl-btn-primary"
            onClick={handleApply}
            style={{ fontSize: '12px' }}
          >
            {applied ? <CheckCircle2 size={13} /> : <Sparkles size={13} />}
            {applied ? 'Applied to Simulator!' : 'Apply Adjustments to Simulator'}
          </button>
        </div>
      )}
    </div>
  );
}
