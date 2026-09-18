import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createDecision, computeCounterfactuals } from '../routes/decisions';

describe('DecisionLens XAI Scoring Engine', () => {
  it('correctly scores high readiness scenario with proceed recommendation', () => {
    const input = {
      scenarioName: 'Test High Readiness',
      strategicAlignment: 95,
      financialReadiness: 90,
      technicalReadiness: 85,
      teamReadiness: 80,
      marketEvidence: 85,
      riskExposure: 15,
      timelinePressure: 20,
    };

    const decision = createDecision(input);
    assert.ok(decision.overallScore >= 75);
    assert.equal(decision.recommendation, 'proceed');
    assert.ok(decision.confidence >= 80);
    assert.equal(decision.factors.length, 7);
  });

  it('correctly handles inverse factor mechanics for risk and timeline', () => {
    const inputHighRisk = {
      scenarioName: 'Test High Risk',
      strategicAlignment: 80,
      financialReadiness: 80,
      technicalReadiness: 80,
      teamReadiness: 80,
      marketEvidence: 80,
      riskExposure: 90,
      timelinePressure: 90,
    };

    const decision = createDecision(inputHighRisk);
    const riskFactor = decision.factors.find(f => f.key === 'riskExposure');
    assert.equal(riskFactor?.direction, 'negative');
    assert.ok((riskFactor?.impact ?? 0) < 0);
  });

  it('computes counterfactual adjustments for guardrails tier', () => {
    const inputGuardrails = {
      scenarioName: 'Test Guardrails',
      strategicAlignment: 65,
      financialReadiness: 60,
      technicalReadiness: 60,
      teamReadiness: 60,
      marketEvidence: 60,
      riskExposure: 50,
      timelinePressure: 50,
    };

    const decision = createDecision(inputGuardrails);
    assert.equal(decision.recommendation, 'guardrails');
    const counterfactuals = computeCounterfactuals(inputGuardrails, decision.overallScore, 'guardrails');
    assert.ok(counterfactuals.length > 0);
    assert.equal(counterfactuals[0].targetRecommendation, 'Proceed with confidence');
  });

  it('correctly bounds scores between 0 and 100 on extreme inputs', () => {
    const minInput = {
      scenarioName: 'Min Bounds',
      strategicAlignment: 0,
      financialReadiness: 0,
      technicalReadiness: 0,
      teamReadiness: 0,
      marketEvidence: 0,
      riskExposure: 100,
      timelinePressure: 100,
    };
    const minDecision = createDecision(minInput);
    assert.equal(minDecision.overallScore, 0);
    assert.equal(minDecision.recommendation, 'rework');

    const maxInput = {
      scenarioName: 'Max Bounds',
      strategicAlignment: 100,
      financialReadiness: 100,
      technicalReadiness: 100,
      teamReadiness: 100,
      marketEvidence: 100,
      riskExposure: 0,
      timelinePressure: 0,
    };
    const maxDecision = createDecision(maxInput);
    assert.equal(maxDecision.overallScore, 100);
    assert.equal(maxDecision.recommendation, 'proceed');
  });
});
