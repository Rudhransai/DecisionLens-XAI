import React, { useState, useMemo } from 'react';
import { useListDecisions, getListDecisionsQueryKey } from '@workspace/api-client-react';
import { RadarChart } from '../components/radar-chart';
import { Layers3, ArrowLeft, ArrowRight, Check, Award, Scale } from 'lucide-react';
import { Link } from 'wouter';

export function ScenarioComparisonPage() {
  const decisionsQuery = useListDecisions({
    query: {
      queryKey: getListDecisionsQueryKey(),
      staleTime: 30000,
    },
  });

  const decisions = decisionsQuery.data ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Auto-select first two decisions if available and none selected
  React.useEffect(() => {
    if (decisions.length >= 2 && selectedIds.length === 0) {
      setSelectedIds([decisions[0].id, decisions[1].id]);
    }
  }, [decisions, selectedIds.length]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[1], selectedIds[2], id]);
      }
    }
  };

  return (
    <div className="dl-content">
      <div className="dl-heading-row">
        <div>
          <div className="dl-eyebrow">Trade-off &amp; Portfolio Analysis</div>
          <h1 className="dl-page-title">
            Side-by-Side<br />
            <em>Scenario Comparison.</em>
          </h1>
          <p className="dl-page-lede">
            Compare operational readiness profiles across competing initiatives to allocate capital and engineering bandwidth defensibly.
          </p>
        </div>

        <Link href="/new" className="dl-btn dl-btn-primary">
          + New scenario
        </Link>
      </div>

      {/* Decision Selection Pills */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ font: '600 10px var(--app-font-mono)', textTransform: 'uppercase', color: '#6d7f7a', marginBottom: '8px' }}>
          Select 2 or 3 Scenarios to Compare:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {decisions.map((d) => {
            const isSelected = selectedIds.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggleSelect(d.id)}
                className={`dl-preset-chip ${isSelected ? 'active' : ''}`}
                style={{
                  background: isSelected ? 'var(--dl-mint)' : 'var(--dl-card)',
                  borderColor: isSelected ? 'var(--dl-teal)' : '#d2c8b8',
                  color: isSelected ? '#1e5e54' : 'var(--dl-ink)',
                }}
              >
                {isSelected && <Check size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />}
                {d.scenarioName} ({d.overallScore}/100)
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="dl-compare-grid">
        {selectedIds.map((id) => {
          const item = decisions.find((d) => d.id === id);
          if (!item) return null;

          return (
            <div key={item.id} className="dl-compare-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ font: '600 9px var(--app-font-mono)', textTransform: 'uppercase', color: '#7a8c88' }}>
                    Scenario Profile
                  </div>
                  <h3 style={{ font: '600 18px var(--app-font-serif)', margin: '4px 0' }}>
                    {item.scenarioName}
                  </h3>
                </div>
                <span
                  className={`dl-pill ${
                    item.recommendation === 'proceed'
                      ? 'proceed'
                      : item.recommendation === 'guardrails'
                        ? 'guardrails'
                        : 'rework'
                  }`}
                >
                  {item.recommendation}
                </span>
              </div>

              {/* Score Display */}
              <div style={{ margin: '18px 0', padding: '14px', background: '#f5efe3', borderRadius: '8px' }}>
                <div style={{ font: '600 10px var(--app-font-mono)', color: '#687c76' }}>OVERALL SCORE</div>
                <div style={{ font: '600 32px var(--app-font-serif)', color: '#173142' }}>
                  {item.overallScore}
                  <span style={{ fontSize: '13px', color: '#889893', marginLeft: '5px' }}>/ 100</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7e79', marginTop: '3px' }}>
                  Confidence: <strong>{item.confidence}%</strong>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Link href={`/analysis/${item.id}`} className="dl-link">
                  Open full explainability view <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
