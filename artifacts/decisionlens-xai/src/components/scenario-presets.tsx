import React from 'react';
import type { DecisionInput } from '@workspace/api-client-react';
import { Sparkles, Compass, ShieldAlert, Cpu, Rocket } from 'lucide-react';

export interface PresetScenario {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  data: DecisionInput;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'ai-rollout',
    name: 'AI Agent Rollout',
    icon: Rocket,
    description: 'High market signal & executive priority, elevated technical complexity.',
    data: {
      scenarioName: 'Enterprise AI Agent Automation Pilot',
      context: 'Deploying autonomous customer assistance agents to handle tier-1 support tickets.',
      strategicAlignment: 95,
      financialReadiness: 78,
      technicalReadiness: 72,
      teamReadiness: 68,
      marketEvidence: 92,
      riskExposure: 42,
      timelinePressure: 50,
    },
  },
  {
    id: 'tech-refactor',
    name: 'Core Tech Refactor',
    icon: Cpu,
    description: 'High technical readiness, low operational risk, deliberate timeline.',
    data: {
      scenarioName: 'Payment Gateway & Ledger Modernization',
      context: 'Migrating legacy synchronous ledger processing to event-driven Kafka pipelines.',
      strategicAlignment: 82,
      financialReadiness: 75,
      technicalReadiness: 90,
      teamReadiness: 84,
      marketEvidence: 65,
      riskExposure: 20,
      timelinePressure: 28,
    },
  },
  {
    id: 'market-expansion',
    name: 'Aggressive Market Expansion',
    icon: Compass,
    description: 'Strong market opportunity, high timeline pressure and risk exposure.',
    data: {
      scenarioName: 'Direct EMEA Regional Expansion Launch',
      context: 'Establishing direct local sales operations and multi-currency billing in 4 EU countries.',
      strategicAlignment: 88,
      financialReadiness: 62,
      technicalReadiness: 56,
      teamReadiness: 54,
      marketEvidence: 85,
      riskExposure: 68,
      timelinePressure: 76,
    },
  },
  {
    id: 'lean-mvp',
    name: 'Lean MVP Sprint',
    icon: ShieldAlert,
    description: 'Early prototype testing under tight constraints.',
    data: {
      scenarioName: 'Mobile Companion App MVP',
      context: 'Launching a lightweight iOS/Android companion app for field technicians.',
      strategicAlignment: 76,
      financialReadiness: 48,
      technicalReadiness: 62,
      teamReadiness: 65,
      marketEvidence: 60,
      riskExposure: 35,
      timelinePressure: 60,
    },
  },
];

interface ScenarioPresetsProps {
  onSelectPreset: (preset: DecisionInput) => void;
}

export function ScenarioPresets({ onSelectPreset }: ScenarioPresetsProps) {
  return (
    <div className="dl-presets-wrap">
      <div className="dl-presets-title">
        <Sparkles size={11} style={{ verticalAlign: '-1px', marginRight: 5 }} /> Quick Scenario Presets
      </div>
      <div className="dl-presets-grid">
        {PRESET_SCENARIOS.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              type="button"
              className="dl-preset-chip"
              onClick={() => onSelectPreset(preset.data)}
              title={preset.description}
            >
              <Icon size={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
