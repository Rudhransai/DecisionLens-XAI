import React, { useState, useMemo } from 'react';
import { Sliders, RotateCcw, Sparkles, ArrowRight, ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import type { DecisionFactor } from '@workspace/api-client-react';

interface WhatIfSimulatorProps {
  factors: DecisionFactor[];
  originalScore: number;
  originalRecommendation: string;
}

const WEIGHTS: Record<string, number> = {
  strategicAlignment: 0.18,
  financialReadiness: 0.16,
  technicalReadiness: 0.17,
  teamReadiness: 0.14,
  marketEvidence: 0.14,
  riskExposure: 0.12,
  timelinePressure: 0.09,
};

export function WhatIfSimulator({ factors, originalScore, originalRecommendation }: WhatIfSimulatorProps) {
  const initialScores = useMemo(() => {
    const scores: Record<string, number> = {};
    factors.forEach((f) => {
      scores[f.key] = f.score;
    });
    return scores;
  }, [factors]);

  const [simulatedScores, setSimulatedScores] = useState<Record<string, number>>(initialScores);

  const setFactorScore = (key: string, value: number) => {
    setSimulatedScores((prev) => ({ ...prev, [key]: value }));
  };

  const resetSimulation = () => {
    setSimulatedScores(initialScores);
  };

  // Compute simulated overall score
  const simulatedScore = useMemo(() => {
    let total = 0;
    Object.keys(simulatedScores).forEach((key) => {
      const raw = simulatedScores[key] ?? 50;
      const effective = key === 'riskExposure' || key === 'timelinePressure' ? 100 - raw : raw;
      const weight = WEIGHTS[key] ?? 0.14;
      total += effective * weight;
    });
    return Math.round(total);
  }, [simulatedScores]);

  const scoreDelta = simulatedScore - originalScore;
  const simulatedRecommendation =
    simulatedScore >= 75 ? 'proceed' : simulatedScore >= 55 ? 'guardrails' : 'rework';
  const simulatedRecommendationLabel =
    simulatedRecommendation === 'proceed'
      ? 'Proceed with confidence'
      : simulatedRecommendation === 'guardrails'
        ? 'Proceed with guardrails'
        : 'Rework before committing';

  return (
    <div className="dl-whatif-container">
      <div className="dl-whatif-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#2c827d" />
            <h3 style={{ font: '600 18px var(--app-font-serif)', margin: 0 }}>
              What-If &amp; Sensitivity Simulator
            </h3>
          </div>
          <div style={{ fontSize: '11px', color: '#6d7f7b', marginTop: '4px' }}>
            Interactively test parameter changes to evaluate score sensitivity in real time.
          </div>
        </div>

        <button
          onClick={resetSimulation}
          className="dl-btn dl-btn-quiet"
          style={{ fontSize: '11px', minHeight: '32px', padding: '0 10px' }}
          title="Reset to original input values"
        >
          <RotateCcw size={12} /> Reset baseline
        </button>
      </div>

      {/* Real-time simulation readout bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '14px 18px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dcd3c4',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ font: '600 9px var(--app-font-mono)', textTransform: 'uppercase', color: '#7a8c88' }}>
              Simulated Score
            </div>
            <div style={{ font: '600 24px var(--app-font-serif)', color: '#173142' }}>
              {simulatedScore}
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#859690', marginLeft: '4px' }}>
                / 100
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              font: '600 11px var(--app-font-mono)',
              background: scoreDelta > 0 ? '#dcebe3' : scoreDelta < 0 ? '#f3dfd8' : '#e9ece6',
              color: scoreDelta > 0 ? '#21695f' : scoreDelta < 0 ? '#a14c3b' : '#697a76',
            }}
          >
            {scoreDelta > 0 ? `+${scoreDelta} pts` : scoreDelta < 0 ? `${scoreDelta} pts` : 'Baseline'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: '600 9px var(--app-font-mono)', textTransform: 'uppercase', color: '#7a8c88' }}>
              Projected Decision
            </div>
            <div style={{ font: '600 13px var(--app-font-sans)', color: '#173142' }}>
              {simulatedRecommendationLabel}
            </div>
          </div>
          <span className={`dl-pill ${simulatedRecommendation}`}>
            {simulatedRecommendation === 'proceed' ? 'Proceed' : simulatedRecommendation === 'guardrails' ? 'Guardrails' : 'Rework'}
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="dl-whatif-sliders">
        {factors.map((factor) => {
          const currentVal = simulatedScores[factor.key] ?? factor.score;
          const isInverse = factor.key === 'riskExposure' || factor.key === 'timelinePressure';

          return (
            <div key={factor.key} className="dl-whatif-slider-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ font: '600 11px var(--app-font-sans)', color: '#173142' }}>
                  {factor.label}
                </label>
                <span style={{ font: '600 12px var(--app-font-mono)', color: '#2c827d' }}>
                  {currentVal}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentVal}
                onChange={(e) => setFactorScore(factor.key, Number(e.target.value))}
                className="dl-range"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#889894', marginTop: '4px' }}>
                <span>0</span>
                <span>{isInverse ? 'Higher Risk / Pressure' : 'Higher Readiness'}</span>
                <span>100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
