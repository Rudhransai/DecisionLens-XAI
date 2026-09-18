import React from 'react';
import type { DecisionInput } from '@workspace/api-client-react';
import { Sparkles, Compass, ShieldAlert, Cpu, Rocket, Stethoscope, Landmark, ShieldCheck, Truck } from 'lucide-react';

export interface PresetScenario {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  description: string;
  data: DecisionInput;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'health-ai',
    name: 'Clinical AI Diagnostic Trial',
    category: 'Healthcare',
    icon: Stethoscope,
    description: 'HIPAA/FDA regulated deployment of clinical decision-support models.',
    data: {
      scenarioName: 'Clinical Trial LLM Diagnostic Copilot',
      context: 'Deploying an explainable LLM triage tool to assist oncologists with pathology report summaries under FDA SaMD guardrails.',
      strategicAlignment: 94,
      financialReadiness: 82,
      technicalReadiness: 76,
      teamReadiness: 70,
      marketEvidence: 88,
      riskExposure: 48,
      timelinePressure: 55,
    },
  },
  {
    id: 'fintech-core',
    name: 'Cloud Banking Migration',
    category: 'Fintech',
    icon: Landmark,
    description: 'Tier-1 core transactional banking migration to multi-region cloud.',
    data: {
      scenarioName: 'Core Banking Ledger Multi-Region Cloud Migration',
      context: 'Migrating legacy mainframe settlement engines to distributed ledger nodes with sub-10ms latency SLAs.',
      strategicAlignment: 90,
      financialReadiness: 86,
      technicalReadiness: 88,
      teamReadiness: 80,
      marketEvidence: 74,
      riskExposure: 25,
      timelinePressure: 35,
    },
  },
  {
    id: 'cyber-zerotrust',
    name: 'Zero-Trust Security Rollout',
    category: 'Cybersecurity',
    icon: ShieldCheck,
    description: 'Enterprise identity & zero-trust perimeter overhaul under elevated threat.',
    data: {
      scenarioName: 'Global Enterprise Zero-Trust Architecture Enforcement',
      context: 'Mandating strict hardware-token MFA, micro-segmentation, and device health attestations across 24,000 corporate endpoints.',
      strategicAlignment: 96,
      financialReadiness: 78,
      technicalReadiness: 84,
      teamReadiness: 76,
      marketEvidence: 68,
      riskExposure: 22,
      timelinePressure: 40,
    },
  },
  {
    id: 'ai-rollout',
    name: 'Autonomous Agent Fleet',
    category: 'AI / Automation',
    icon: Rocket,
    description: 'High market signal & executive priority, elevated technical complexity.',
    data: {
      scenarioName: 'Autonomous Support Agent Fleet Deployment',
      context: 'Deploying autonomous customer resolution agents to orchestrate returns, order edits, and tier-1 dispute handling.',
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
    id: 'market-expansion',
    name: 'EMEA Sovereign Cloud',
    category: 'SaaS Expansion',
    icon: Compass,
    description: 'Strong market opportunity, high regulatory compliance pressure.',
    data: {
      scenarioName: 'EU Data Boundary & Sovereign Cloud Expansion',
      context: 'Establishing direct local EU data residency clusters and GDPR-compliant tenant isolation in Frankfurt and Dublin.',
      strategicAlignment: 88,
      financialReadiness: 65,
      technicalReadiness: 60,
      teamReadiness: 58,
      marketEvidence: 86,
      riskExposure: 52,
      timelinePressure: 65,
    },
  },
  {
    id: 'supply-chain',
    name: 'Real-Time Logistics Engine',
    category: 'Supply Chain',
    icon: Truck,
    description: 'Real-time routing and predictive inventory allocation.',
    data: {
      scenarioName: 'Predictive Supply Chain & Automated Fulfillment Engine',
      context: 'Connecting IoT telematics and warehouse ERPs for automated dynamic rerouting during peak shipping seasons.',
      strategicAlignment: 80,
      financialReadiness: 72,
      technicalReadiness: 74,
      teamReadiness: 75,
      marketEvidence: 82,
      riskExposure: 30,
      timelinePressure: 44,
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
