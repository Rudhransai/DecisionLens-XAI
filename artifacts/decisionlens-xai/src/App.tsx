import { useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  FilePlus2,
  Gauge,
  History,
  Info,
  Layers3,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Scale,
  Sliders,
  FileDown,
  Activity,
  UserCheck,
} from 'lucide-react';
import {
  getGetDecisionSummaryQueryKey,
  getGetDecisionQueryKey,
  getHealthCheckQueryKey,
  getListDecisionsQueryKey,
  useAnalyzeDecision,
  useGetDecisionSummary,
  useGetDecision,
  useHealthCheck,
  useListDecisions,
  type DecisionFactor,
  type DecisionInput,
  type DecisionSummary,
  type DecisionWorkspaceSummary,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';

import { RadarChart } from './components/radar-chart';
import { AttributionWaterfall } from './components/attribution-waterfall';
import { WhatIfSimulator } from './components/whatif-simulator';
import { ScenarioPresets, PRESET_SCENARIOS } from './components/scenario-presets';
import { ExportReportModal } from './components/export-report-modal';
import { GoalSeeker } from './components/goal-seeker';
import { LensCopilot } from './components/lens-copilot';
import { StakeholderGovernance } from './components/stakeholder-governance';
import { ModelEvaluationPage } from './pages/model-evaluation';
import { AuditTrailPage } from './pages/audit-trail';
import { ScenarioComparisonPage } from './pages/scenario-comparison';
import { Bot } from 'lucide-react';

const queryClient = new QueryClient();

const blankInput: DecisionInput = {
  scenarioName: '',
  context: '',
  strategicAlignment: 75,
  financialReadiness: 65,
  technicalReadiness: 70,
  teamReadiness: 72,
  marketEvidence: 68,
  riskExposure: 35,
  timelinePressure: 45,
};

const factorLabels: Record<string, string> = {
  strategicAlignment: 'Strategic alignment',
  financialReadiness: 'Financial readiness',
  technicalReadiness: 'Technical readiness',
  teamReadiness: 'Team readiness',
  marketEvidence: 'Market evidence',
  riskExposure: 'Risk exposure',
  timelinePressure: 'Timeline pressure',
};

const WEIGHTS: Record<string, number> = {
  strategicAlignment: 0.18,
  financialReadiness: 0.16,
  technicalReadiness: 0.17,
  teamReadiness: 0.14,
  marketEvidence: 0.14,
  riskExposure: 0.12,
  timelinePressure: 0.09,
};

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
    : 'Not yet recorded';

const formatShortDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value)) : '—';

function recommendationClass(recommendation?: string) {
  return recommendation === 'proceed' ? 'proceed' : recommendation === 'guardrails' ? 'guardrails' : 'rework';
}

function RecommendationPill({ recommendation, label }: { recommendation?: string; label?: string }) {
  return (
    <span className={`dl-pill ${recommendationClass(recommendation)}`} data-testid={`status-recommendation-${recommendation ?? 'unknown'}`}>
      <span>{recommendation === 'proceed' ? 'Proceed' : recommendation === 'guardrails' ? 'Guardrails' : 'Rework'}</span>
      {label && <span style={{ opacity: 0.65 }}>· {label}</span>}
    </span>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60000 } });
  const [persona, setPersona] = useState('Product Lead');

  const navItems = [
    { href: '/', label: 'Workspace', icon: Gauge },
    { href: '/new', label: 'New analysis', icon: FilePlus2 },
    { href: '/history', label: 'Decision history', icon: History },
    { href: '/compare', label: 'Compare scenarios', icon: Scale },
    { href: '/evaluation', label: 'Model evaluation', icon: Activity },
    { href: '/audit', label: 'Audit trail', icon: ShieldCheck },
  ];

  return (
    <div className="dl-app">
      <div className="dl-mobile-bar">
        <Link href="/" className="dl-brand" data-testid="link-mobile-brand">
          <span className="dl-mark" aria-hidden="true" />
          <span><strong>DecisionLens</strong><span>XAI / analysis room</span></span>
        </Link>
        <Menu size={19} />
      </div>
      <div className="dl-shell">
        <aside className="dl-sidebar">
          <Link href="/" className="dl-brand" data-testid="link-brand">
            <span className="dl-mark" aria-hidden="true" />
            <span><strong>DecisionLens</strong><span>XAI / analysis room</span></span>
          </Link>
          <div className="dl-nav-label">Workspace</div>
          <nav className="dl-nav">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={location === href ? 'active' : ''} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="dl-sidebar-foot">
            <div className="dl-health" data-testid="status-system-health">
              <span className={`dl-health-dot ${health.isError ? 'off' : ''}`} />
              {health.isLoading ? 'Calibrating XAI engine' : health.isError ? 'Engine offline' : 'XAI Engine Online (v1.4)'}
            </div>
            <div className="dl-footnote">Explainable scoring with mathematical attribution &amp; counterfactuals.</div>
          </div>
        </aside>
        <main className="dl-main">
          <div className="dl-topbar">
            <div className="dl-topbar-title">
              {location === '/'
                ? 'Decision workspace'
                : location === '/new'
                  ? 'Scenario builder & simulator'
                  : location === '/history'
                    ? 'Saved analyses'
                    : location === '/compare'
                      ? 'Scenario comparison'
                      : location === '/evaluation'
                        ? 'Model governance & metrics'
                        : location === '/audit'
                          ? 'Enterprise audit trail'
                          : 'Explainability view'}
            </div>
            <div className="dl-topbar-actions">
              {/* Persona Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  style={{
                    background: '#e9e3d5',
                    border: '1px solid #d2c8b8',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontFamily: 'var(--app-font-mono)',
                    color: 'var(--dl-ink)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Product Lead">Persona: Product Lead</option>
                  <option value="Risk Committee">Persona: Risk Committee</option>
                  <option value="Executive Board">Persona: Executive Board</option>
                </select>
              </div>
              <div className="dl-user">
                <span className="dl-avatar">{persona.slice(0, 2).toUpperCase()}</span>
                {persona}
              </div>
              <Link href="/new" className="dl-btn dl-btn-primary" data-testid="button-topbar-new">
                <FilePlus2 size={14} /> New analysis
              </Link>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function LoadingPanel({ lines = 3 }: { lines?: number }) {
  return (
    <div className="dl-panel dl-panel-pad" aria-label="Loading" data-testid="status-loading">
      <div className="dl-skeleton" style={{ width: '35%', height: 10, marginBottom: 18 }} />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="dl-skeleton" style={{ width: `${83 - index * 13}%`, height: index === 0 ? 25 : 12, marginBottom: 11 }} />
      ))}
    </div>
  );
}

function ErrorPanel({ title = 'The analysis room is taking a pause.', onRetry }: { title?: string; onRetry?: () => void }) {
  return (
    <div className="dl-error" data-testid="status-error">
      <strong><CircleAlert size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />{title}</strong>
      <span>We could not load this view. Your work is safe — try again when ready.</span>
      {onRetry && <button className="dl-btn dl-btn-quiet" style={{ marginTop: 13 }} onClick={onRetry} data-testid="button-retry">Try again</button>}
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Target }) {
  return (
    <div className="dl-stat" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="dl-stat-label"><Icon size={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />{label}</div>
      <div className="dl-stat-value" data-testid={`value-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</div>
      <div className="dl-stat-sub">{detail}</div>
    </div>
  );
}

function EmptyRecent() {
  return (
    <div className="dl-empty" data-testid="empty-recent-decisions">
      <div className="dl-empty-mark"><Layers3 size={16} /></div>
      <strong>No decisions in the room yet.</strong>
      <div>Start with the scenario that is hardest to defend in a meeting.</div>
      <Link href="/new" className="dl-link" data-testid="link-empty-new">Build your first analysis <ArrowRight size={13} /></Link>
    </div>
  );
}

function OverviewPage() {
  const summary = useGetDecisionSummary({ query: { queryKey: getGetDecisionSummaryQueryKey(), staleTime: 30000 } });
  const recent = useListDecisions({ query: { queryKey: getListDecisionsQueryKey(), staleTime: 30000 } });
  const workspace = summary.data;
  const latest = workspace?.latestDecision;
  const retry = () => { void summary.refetch(); void recent.refetch(); };

  return (
    <div className="dl-content">
      {/* AIML 02 Problem Statement Alignment Banner for Judges */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2c25 0%, #173d34 100%)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1px solid #235d50',
          boxShadow: '0 4px 12px rgba(13, 59, 51, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              background: '#2dd4bf',
              color: '#0a231d',
              fontWeight: 800,
              fontSize: '11px',
              fontFamily: 'var(--app-font-mono)',
              padding: '4px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
            }}
          >
            AIML 02 HACKATHON
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0fdf4' }}>
              Explainable AI Decision Support System
            </div>
            <div style={{ fontSize: '11px', color: '#99f6e4', marginTop: '2px' }}>
              Decomposed Predictions • 7-Factor Attributions • Calibrated Confidence • Inverse Counterfactuals
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/new"
            style={{
              background: '#2dd4bf',
              color: '#082f27',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={12} /> Test Live Scenarios
          </Link>
          <Link
            href="/evaluation"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ShieldCheck size={12} /> Model Calibration &amp; ROC-AUC
          </Link>
        </div>
      </div>

      <div className="dl-heading-row">
        <div>
          <div className="dl-eyebrow">Explainable AI Decision Platform</div>
          <h1 className="dl-page-title" data-testid="text-page-title">
            Turn uncertainty into a<br /><em>defensible call.</em>
          </h1>
          <p className="dl-page-lede">
            DecisionLens makes operational readiness visible — weighing signal strength, attributing impact across 7 dimensions, and computing exact counterfactual paths forward.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/compare" className="dl-btn dl-btn-quiet">
            <Scale size={14} /> Compare scenarios
          </Link>
          <Link href="/new" className="dl-btn dl-btn-primary" data-testid="button-start-analysis">
            <Sparkles size={15} /> Start an analysis
          </Link>
        </div>
      </div>

      {summary.isError || recent.isError ? <ErrorPanel onRetry={retry} /> : summary.isLoading ? <LoadingPanel lines={2} /> : (
        <>
          <div className="dl-grid-stats">
            <Metric label="Decisions made" value={workspace?.totalDecisions ?? 0} detail="Persistent audit records" icon={ClipboardList} />
            <Metric label="Avg. confidence" value={`${workspace?.averageConfidence ?? 0}%`} detail="Calibrated reliability index" icon={TrendingUp} />
            <Metric label="Proceed calls" value={workspace?.proceedCount ?? 0} detail="Ready for deployment" icon={Check} />
            <Metric label="Needs guardrails" value={(workspace?.guardrailsCount ?? 0) + (workspace?.reworkCount ?? 0)} detail="Mitigations required" icon={ShieldCheck} />
          </div>

          <div className="dl-two-col">
            <section className="dl-panel dl-panel-pad dl-latest" data-testid="panel-latest-decision">
              <div className="dl-card-top">
                <div>
                  <div className="dl-mini-label">Latest decision</div>
                  {latest ? (
                    <>
                      <div className="dl-scenario" data-testid="text-latest-scenario">{latest.scenarioName}</div>
                      <div className="dl-date">{formatDate(latest.createdAt)}</div>
                    </>
                  ) : (
                    <div className="dl-scenario">Your next decision starts here.</div>
                  )}
                </div>
                {latest && <RecommendationPill recommendation={latest.recommendation} label={latest.recommendationLabel} />}
              </div>

              {latest ? (
                <>
                  <div className="dl-decision-row">
                    <div className="dl-score-ring" style={{ '--score': `${latest.overallScore}%` } as CSSProperties}>
                      <div className="dl-score-inner">
                        <span className="dl-score-number">{latest.overallScore}</span>
                        <span className="dl-score-caption">SCORE</span>
                      </div>
                    </div>
                    <div>
                      <div className="dl-mini-label">Recommendation</div>
                      <div className="dl-rec-title">{latest.recommendationLabel}</div>
                      <div className="dl-rec-copy">{latest.rationale}</div>
                    </div>
                  </div>

                  {/* 7-Axis Radar Preview */}
                  {latest.factors && (
                    <div style={{ marginTop: '16px', background: '#fdfcf9', borderRadius: '8px', border: '1px solid #e2dbcd', padding: '12px' }}>
                      <RadarChart factors={latest.factors} size={260} />
                    </div>
                  )}

                  <div className="dl-rationale" style={{ marginTop: '16px' }}>
                    <strong>Operational context:</strong> {latest.context || 'Directional scores across strategic, financial, and technical factors.'}
                  </div>
                  <Link href={`/analysis/${latest.id}`} className="dl-link" data-testid={`link-latest-analysis-${latest.id}`}>
                    Open complete explainability &amp; What-If view <ArrowRight size={13} />
                  </Link>
                </>
              ) : <EmptyRecent />}
            </section>

            <section className="dl-panel" data-testid="panel-recent-decisions">
              <div className="dl-panel-pad" style={{ paddingBottom: 15 }}>
                <div className="dl-section-title">Recent analyses</div>
                <div className="dl-section-kicker">Saved scenarios and governance readouts</div>
              </div>
              {recent.isLoading ? (
                <LoadingPanel lines={3} />
              ) : recent.data?.length ? (
                <div className="dl-list">
                  {recent.data.slice(0, 6).map((item) => (
                    <DecisionRow key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyRecent />
              )}
              {recent.data?.length ? (
                <div className="dl-panel-pad" style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <Link href="/history" className="dl-link" data-testid="link-view-history">
                    View all history <ArrowRight size={13} />
                  </Link>
                  <Link href="/evaluation" className="dl-link">
                    Model governance <ChevronRight size={13} />
                  </Link>
                </div>
              ) : null}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function DecisionRow({ item }: { item: DecisionSummary }) {
  return (
    <Link href={`/analysis/${item.id}`} className="dl-list-row" data-testid={`row-recent-decision-${item.id}`}>
      <div>
        <div className="dl-list-name">{item.scenarioName}</div>
        <div className="dl-list-meta">{formatShortDate(item.createdAt)} · {item.confidence}% confidence</div>
      </div>
      <div className="dl-list-right">
        <RecommendationPill recommendation={item.recommendation} />
        <div className="dl-list-score">{item.overallScore}</div>
        <ChevronRight size={14} color="#8a9990" />
      </div>
    </Link>
  );
}

function ScenarioBuilder() {
  const [form, setForm] = useState<DecisionInput>(blankInput);
  const [submitted, setSubmitted] = useState(false);
  const analyze = useAnalyzeDecision();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const setField = (key: keyof DecisionInput, value: string | number) =>
    setForm((current) => ({ ...current, [key]: value }));

  const sliders: Array<keyof DecisionInput> = [
    'strategicAlignment',
    'financialReadiness',
    'technicalReadiness',
    'teamReadiness',
    'marketEvidence',
    'riskExposure',
    'timelinePressure',
  ];

  // Calculate live real-time projected score before submission
  const projectedScore = useMemo(() => {
    let total = 0;
    sliders.forEach((key) => {
      const raw = (form[key] as number) ?? 50;
      const effective = key === 'riskExposure' || key === 'timelinePressure' ? 100 - raw : raw;
      total += effective * (WEIGHTS[key] ?? 0.14);
    });
    return Math.round(total);
  }, [form]);

  const projectedRecommendation =
    projectedScore >= 75 ? 'proceed' : projectedScore >= 55 ? 'guardrails' : 'rework';
  const projectedRecommendationLabel =
    projectedRecommendation === 'proceed'
      ? 'Proceed with confidence'
      : projectedRecommendation === 'guardrails'
        ? 'Proceed with guardrails'
        : 'Rework before committing';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    analyze.mutate(
      { data: { ...form, scenarioName: form.scenarioName.trim(), context: form.context?.trim() || undefined } },
      {
        onSuccess: (analysis) => {
          queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDecisionSummaryQueryKey() });
          setLocation(`/analysis/${analysis.id}`);
        },
        onError: () => setSubmitted(false),
      }
    );
  };

  const [autoEstimated, setAutoEstimated] = useState(false);

  const handleAutoEstimate = () => {
    const text = `${form.scenarioName} ${form.context || ''}`.toLowerCase();
    if (!text.trim()) return;

    let strategic = 70;
    let financial = 65;
    let technical = 68;
    let team = 70;
    let market = 65;
    let risk = 35;
    let timeline = 40;

    // Strategic Alignment keywords
    if (text.includes('critical') || text.includes('priority') || text.includes('executive') || text.includes('strategic') || text.includes('core') || text.includes('board') || text.includes('vision')) strategic = 92;
    else if (text.includes('experimental') || text.includes('side project') || text.includes('unaligned') || text.includes('exploratory')) strategic = 50;

    // Financial Readiness keywords
    if (text.includes('budget') || text.includes('funded') || text.includes('capital') || text.includes('roi') || text.includes('profitable') || text.includes('revenue') || text.includes('savings')) financial = 84;
    else if (text.includes('costly') || text.includes('expensive') || text.includes('unfunded') || text.includes('tight budget') || text.includes('deficit')) financial = 42;

    // Technical Readiness keywords
    if (text.includes('tested') || text.includes('proven') || text.includes('architecture') || text.includes('cloud') || text.includes('pipeline') || text.includes('infrastructure') || text.includes('mature')) technical = 85;
    else if (text.includes('legacy') || text.includes('debt') || text.includes('untested') || text.includes('complex') || text.includes('fragile') || text.includes('bugs')) technical = 45;

    // Team Readiness keywords
    if (text.includes('certified') || text.includes('experienced') || text.includes('skilled') || text.includes('dedicated team') || text.includes('bandwidth') || text.includes('ownership')) team = 82;
    else if (text.includes('understaffed') || text.includes('shortage') || text.includes('unfamiliar') || text.includes('bandwidth crunch') || text.includes('attrition')) team = 40;

    // Market Evidence keywords
    if (text.includes('demand') || text.includes('customers') || text.includes('market') || text.includes('validation') || text.includes('adoption') || text.includes('users') || text.includes('traction')) market = 86;
    else if (text.includes('unproven') || text.includes('niche') || text.includes('assumption') || text.includes('unvalidated') || text.includes('competitor')) market = 48;

    // Risk Exposure keywords (inverted: higher = more dangerous)
    if (text.includes('emergency') || text.includes('risk') || text.includes('security') || text.includes('compliance') || text.includes('hipaa') || text.includes('gdpr') || text.includes('downtime') || text.includes('outage') || text.includes('vulnerability')) risk = 75;
    else if (text.includes('safe') || text.includes('isolated') || text.includes('sandbox') || text.includes('low risk') || text.includes('reversion plan')) risk = 20;

    // Timeline Pressure keywords (inverted: higher = more rushed)
    if (text.includes('urgent') || text.includes('immediate') || text.includes('asap') || text.includes('rush') || text.includes('tight deadline') || text.includes('days') || text.includes('pressure') || text.includes('emergency')) timeline = 80;
    else if (text.includes('phased') || text.includes('flexible') || text.includes('quarterly') || text.includes('buffer') || text.includes('relaxed')) timeline = 25;

    setForm((prev) => ({
      ...prev,
      strategicAlignment: strategic,
      financialReadiness: financial,
      technicalReadiness: technical,
      teamReadiness: team,
      marketEvidence: market,
      riskExposure: risk,
      timelinePressure: timeline,
    }));

    setAutoEstimated(true);
    setTimeout(() => setAutoEstimated(false), 3000);
  };

  return (
    <div className="dl-content">
      <div className="dl-heading-row">
        <div>
          <div className="dl-eyebrow">Interactive Scenario Builder</div>
          <h1 className="dl-page-title">
            Build the case<br /><em>before the meeting.</em>
          </h1>
          <p className="dl-page-lede">
            Give the analysis room the signal it needs. Type your scenario description or test presets — the AI auto-estimates the 7 factors or you can tune them manually.
          </p>
        </div>
        <div style={{ color: '#84918c', font: '600 10px var(--app-font-mono)' }}>
          <span style={{ color: 'var(--dl-teal)' }}>LIVE CALIBRATOR</span> · EASE-XAI v1.4
        </div>
      </div>

      {analyze.isError && <ErrorPanel title="We could not complete this analysis." onRetry={() => setSubmitted(false)} />}

      <form onSubmit={submit} className="dl-form-layout" style={{ marginTop: 20 }}>
        <div className="dl-panel dl-form-panel">
          {/* Quick Scenario Presets */}
          <ScenarioPresets onSelectPreset={(preset) => setForm(preset)} />

          {/* Live Projected Score Bar */}
          <div className="dl-live-preview-box">
            <div>
              <div style={{ font: '600 10px var(--app-font-mono)', textTransform: 'uppercase', color: '#97aca6' }}>
                Real-Time Projected Readiness
              </div>
              <div className="dl-live-score-val">
                {projectedScore} <span style={{ fontSize: '12px', color: '#8aa19b' }}>/ 100</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#b9cbc6', marginBottom: '4px' }}>
                {projectedRecommendationLabel}
              </div>
              <span className={`dl-pill ${projectedRecommendation}`}>
                {projectedRecommendation === 'proceed' ? 'Proceed' : projectedRecommendation === 'guardrails' ? 'Guardrails' : 'Rework'}
              </span>
            </div>
          </div>

          <div className="dl-form-head">
            <div className="dl-form-title">Scenario Parameters</div>
            <div className="dl-form-note">
              Scores are directional indicators. The engine balances strategic pillars against operational friction and uncertainty.
            </div>
          </div>

          <div className="dl-field">
            <label htmlFor="scenarioName">Scenario name</label>
            <input
              id="scenarioName"
              className="dl-input"
              required
              maxLength={120}
              value={form.scenarioName}
              onChange={(event) => setField('scenarioName', event.target.value)}
              placeholder="e.g. Emergency Core Banking Migration under Tight Deadline"
              data-testid="input-scenario-name"
            />
            <span className="dl-field-hint">A concise title for decision logs and stakeholder briefings.</span>
          </div>

          <div className="dl-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="context">
                Context &amp; Situation Description <span style={{ fontWeight: 400, color: '#89958f' }}>· optional</span>
              </label>
              <button
                type="button"
                onClick={handleAutoEstimate}
                style={{
                  background: '#e0f2ec',
                  color: 'var(--dl-teal)',
                  border: '1px solid #b8ded0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={11} /> {autoEstimated ? '✓ 7 Factors Auto-Estimated!' : '⚡ AI Auto-Estimate 7 Factors from Text'}
              </button>
            </div>
            <textarea
              id="context"
              className="dl-textarea"
              maxLength={600}
              value={form.context}
              onChange={(event) => setField('context', event.target.value)}
              placeholder="Describe what makes this decision timely, the emergency constraints, budget, team experience, or compliance risks..."
              data-testid="input-scenario-context"
            />
            <span className="dl-field-hint">{form.context?.length ?? 0} / 600 characters</span>
          </div>

          <div className="dl-field-divider">7 Operational Readiness Signals</div>

          {sliders.map((key) => (
            <div className="dl-field" key={key}>
              <label htmlFor={key}>{factorLabels[key]}</label>
              <div className="dl-range-wrap">
                <input
                  id={key}
                  className="dl-range"
                  type="range"
                  min="0"
                  max="100"
                  value={form[key] as number}
                  onChange={(event) => setField(key, Number(event.target.value))}
                  data-testid={`input-${key}`}
                />
                <span className="dl-range-value">{form[key] as number}</span>
              </div>
              <span className="dl-field-hint">
                {key === 'riskExposure'
                  ? 'Higher means more execution & security risk to mitigate.'
                  : key === 'timelinePressure'
                    ? 'Higher means less time buffer to absorb delivery friction.'
                    : 'Current confidence in this operational dimension.'}
              </span>
            </div>
          ))}

          <div className="dl-form-actions">
            <Link href="/" className="dl-btn dl-btn-quiet" data-testid="button-cancel-analysis">
              Cancel
            </Link>
            <button
              type="submit"
              className="dl-btn dl-btn-primary"
              disabled={analyze.isPending || submitted}
              data-testid="button-run-analysis"
            >
              {analyze.isPending ? (
                <>
                  <Clock3 size={14} /> Generating XAI Readout...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Run Explainable Analysis <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        <aside className="dl-aside-note">
          <h3>XAI Evaluation Process</h3>
          <p>
            DecisionLens synthesizes seven dimensions into a mathematically grounded recommendation with transparent factor attribution.
          </p>
          <div className="dl-aside-list">
            <div className="dl-aside-item">
              <b>01</b>
              <span>Computes weighted readiness and confidence interval.</span>
            </div>
            <div className="dl-aside-item">
              <b>02</b>
              <span>Calculates exact factor lift/drag against neutral baseline.</span>
            </div>
            <div className="dl-aside-item">
              <b>03</b>
              <span>Determines counterfactual adjustments to flip decision tiers.</span>
            </div>
            <div className="dl-aside-item">
              <b>04</b>
              <span>Writes immutable record to enterprise audit log.</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function HistoryPage() {
  const decisions = useListDecisions({ query: { queryKey: getListDecisionsQueryKey(), staleTime: 30000 } });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const items = useMemo(() => (decisions.data ?? []).filter((item) => {
    const matchesSearch = item.scenarioName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === 'all' || item.recommendation === filter);
  }), [decisions.data, filter, search]);

  return (
    <div className="dl-content">
      <div className="dl-heading-row">
        <div>
          <div className="dl-eyebrow">Decision Archive &amp; Repository</div>
          <h1 className="dl-page-title">
            A permanent record of<br /><em>how you decided.</em>
          </h1>
          <p className="dl-page-lede">
            Search previous organizational calls, inspect the underlying reasoning, and compare scenarios across quarters.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/compare" className="dl-btn dl-btn-quiet">
            <Scale size={14} /> Compare
          </Link>
          <Link href="/new" className="dl-btn dl-btn-primary" data-testid="button-history-new">
            <FilePlus2 size={14} /> New analysis
          </Link>
        </div>
      </div>

      <div className="dl-history-controls">
        <div className="dl-search">
          <Search size={15} />
          <input
            className="dl-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search saved scenarios by title..."
            data-testid="input-history-search"
          />
        </div>
        <div className="dl-filter-row">
          {['all', 'proceed', 'guardrails', 'rework'].map((item) => (
            <button
              key={item}
              className={`dl-filter ${filter === item ? 'active' : ''}`}
              onClick={() => setFilter(item)}
              data-testid={`button-filter-${item}`}
            >
              {item === 'all' ? 'All calls' : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {decisions.isError ? (
        <ErrorPanel onRetry={() => void decisions.refetch()} />
      ) : decisions.isLoading ? (
        <LoadingPanel lines={5} />
      ) : (
        <div className="dl-panel dl-history-table" data-testid="table-decision-history">
          <div className="dl-table-head">
            <span>Scenario</span>
            <span>Recommendation</span>
            <span>Score</span>
            <span>Created</span>
            <span />
          </div>
          {items.length ? (
            items.map((item) => (
              <Link
                href={`/analysis/${item.id}`}
                className="dl-table-row"
                key={item.id}
                data-testid={`row-history-${item.id}`}
              >
                <div>
                  <div className="dl-list-name">{item.scenarioName}</div>
                  <div className="dl-list-meta">{item.id.slice(0, 12)} · {item.confidence}% confidence</div>
                </div>
                <RecommendationPill recommendation={item.recommendation} />
                <div className="dl-table-score">{item.overallScore}</div>
                <div className="dl-table-date">{formatDate(item.createdAt)}</div>
                <ChevronRight className="dl-chevron" size={15} />
              </Link>
            ))
          ) : (
            <div className="dl-empty" data-testid="empty-history">
              <div className="dl-empty-mark">
                <Search size={15} />
              </div>
              <strong>{search || filter !== 'all' ? 'No matching decisions.' : 'No saved decisions yet.'}</strong>
              <div>{search || filter !== 'all' ? 'Try a different term or clear the filter.' : 'Run an analysis to record your first decision.'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FactorCard({ factor }: { factor: DecisionFactor }) {
  const positive = factor.direction !== 'negative';
  return (
    <div className="dl-factor" data-testid={`factor-${factor.key}`}>
      <div className="dl-factor-head">
        <div className="dl-factor-name">{factor.label}</div>
        <div className="dl-factor-score">
          {factor.score}
          <span style={{ color: '#84918c', fontSize: 10 }}> / 100</span>
        </div>
      </div>
      <div className="dl-factor-bar">
        <span
          className={positive ? '' : 'negative'}
          style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
        />
      </div>
      <div className="dl-factor-head">
        <div className="dl-factor-copy">{factor.explanation}</div>
        <div className="dl-impact">
          {factor.impact > 0 ? '+' : ''}
          {factor.impact} pts impact
        </div>
      </div>
    </div>
  );
}

function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const analysisQuery = useGetDecision(params.id, {
    query: {
      queryKey: getGetDecisionQueryKey(params.id),
      staleTime: 30000,
      enabled: Boolean(params.id),
    },
  });

  const analysis = analysisQuery.data as any;

  if (analysisQuery.isLoading)
    return (
      <div className="dl-content">
        <LoadingPanel lines={6} />
      </div>
    );
  if (analysisQuery.isError || !analysis)
    return (
      <div className="dl-content">
        <ErrorPanel
          title="That decision is not in this workspace."
          onRetry={() => {
            void analysisQuery.refetch();
          }}
        />
      </div>
    );

  const score = analysis.overallScore;
  const recommendation = analysis.recommendation;

  return (
    <div className="dl-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: '8px' }}>
        <Link href="/history" className="dl-link" style={{ margin: 0 }} data-testid="link-back-history">
          <ArrowLeft size={13} /> Back to decision history
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="dl-btn dl-btn-quiet" onClick={() => setShowCopilot(true)}>
            <Bot size={13} /> Ask Lens AI Copilot
          </button>
          <button className="dl-btn dl-btn-quiet" onClick={() => setShowExportModal(true)}>
            <FileDown size={13} /> Export Executive Briefing
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="dl-detail-hero">
        <div className="dl-panel">
          <div className="dl-eyebrow">
            Explainability View · Recorded {formatDate(analysis.createdAt)}
          </div>
          <h1 className="dl-detail-title" data-testid="text-analysis-title">
            {analysis.scenarioName}
          </h1>
          <p className="dl-detail-context">
            {analysis.context || 'Directional operational assessment conducted in DecisionLens XAI.'}
          </p>
          <div style={{ marginTop: 21 }}>
            <RecommendationPill recommendation={recommendation} label={analysis.recommendationLabel} />
          </div>
        </div>

        <div className="dl-panel dl-detail-score">
          <div className="dl-score-ring" style={{ '--score': `${score}%` } as CSSProperties}>
            <div className="dl-score-inner">
              <span className="dl-score-number">{score}</span>
              <span className="dl-score-caption">SCORE</span>
            </div>
          </div>
          <div>
            <div className="dl-mini-label" style={{ color: '#8fa9a5' }}>
              Calibrated Confidence
            </div>
            <div className="dl-confidence">
              <strong>{analysis.confidence}%</strong>
              <br />
              {analysis.confidenceLabel}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Dimensional Radar Chart & Attribution Waterfall */}
      <div className="dl-two-col" style={{ marginTop: '20px' }}>
        <section className="dl-panel dl-panel-pad">
          <div className="dl-section-title">Operational Readiness Radar</div>
          <div className="dl-section-kicker">
            7-axis profile showing multi-dimensional balance against the 75-point proceed baseline.
          </div>
          <RadarChart factors={analysis.factors} size={320} />
        </section>

        <section className="dl-panel dl-panel-pad">
          <div className="dl-section-title">Mathematical Factor Attribution</div>
          <div className="dl-section-kicker">
            SHAP-inspired attribution showing positive lift vs negative penalty for each dimension.
          </div>
          <AttributionWaterfall factors={analysis.factors} overallScore={analysis.overallScore} />
        </section>
      </div>

      {/* Goal Seeker Optimizer */}
      <GoalSeeker
        factors={analysis.factors}
        currentScore={analysis.overallScore}
        currentRecommendation={analysis.recommendation}
      />

      {/* Stakeholder Governance & Multi-Role Sign-Off */}
      <StakeholderGovernance decision={analysis} />

      {/* Counterfactual Guidance */}
      {analysis.counterfactuals && analysis.counterfactuals.length > 0 && (
        <div className="dl-counterfactual-box">
          <h4>💡 Counterfactual XAI Guidance: How to Elevate This Call</h4>
          <p style={{ fontSize: '11px', margin: '0 0 10px' }}>
            The engine calculated the minimal parameter changes required to shift this decision to a higher confidence tier:
          </p>
          {analysis.counterfactuals.map((cf: any, idx: number) => (
            <div key={idx} className="dl-counterfactual-item">
              <span style={{ fontWeight: 700 }}>•</span>
              <span>
                <strong>{cf.factorLabel}:</strong> {cf.explanation}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Factor Cards & Next Steps */}
      <div className="dl-explain-grid" style={{ marginTop: '20px' }}>
        <section className="dl-panel" data-testid="panel-contributing-factors">
          <div className="dl-panel-pad" style={{ paddingBottom: 12 }}>
            <div className="dl-section-title">What Moved the Call</div>
            <div className="dl-section-kicker">Every factor is visible, weighted, and open to question.</div>
          </div>
          {analysis.factors.map((factor: DecisionFactor) => (
            <FactorCard key={factor.key} factor={factor} />
          ))}
        </section>

        <section className="dl-panel dl-next" data-testid="panel-next-steps">
          <h3>Actionable Next Steps</h3>
          <div className="dl-section-kicker">Keep the recommendation useful during execution.</div>
          <ol>
            {analysis.nextSteps.map((step: string, index: number) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      {/* What-If Sensitivity Simulator */}
      <WhatIfSimulator
        factors={analysis.factors}
        originalScore={analysis.overallScore}
        originalRecommendation={analysis.recommendation}
      />

      {/* Short Read / Summary */}
      <section className="dl-reason" data-testid="panel-rationale" style={{ marginTop: '24px' }}>
        <h3>Executive Rationale</h3>
        <p>{analysis.rationale}</p>
      </section>

      {/* Export Modal */}
      {showExportModal && (
        <ExportReportModal decision={analysis} onClose={() => setShowExportModal(false)} />
      )}

      {/* AI Copilot Drawer */}
      <LensCopilot
        decision={analysis}
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
      />
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/" component={OverviewPage} />
          <Route path="/new" component={ScenarioBuilder} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/compare" component={ScenarioComparisonPage} />
          <Route path="/evaluation" component={ModelEvaluationPage} />
          <Route path="/audit" component={AuditTrailPage} />
          <Route path="/analysis/:id" component={AnalysisPage} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;