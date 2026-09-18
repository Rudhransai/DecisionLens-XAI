# DecisionLens XAI

DecisionLens is an explainable AI decision-support workspace for complex operational readiness decisions.

It turns seven directional inputs into:

- a recommendation: **Proceed**, **Proceed with guardrails**, or **Rework before committing**
- an overall readiness score
- a confidence level
- factor-by-factor positive and negative contributions
- a plain-language rationale
- concrete next steps

## Product flow

1. Open the workspace to see recent analyses and aggregate confidence.
2. Start a new analysis and describe the decision context.
3. Score strategic alignment, financial readiness, technical readiness, team readiness, market evidence, risk exposure, and timeline pressure.
4. Review the explainability view and challenge the factors before taking the recommendation into a meeting.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/decisionlens-xai run dev
```

The API is served under `/api` and the web app under `/`.

## Validation

```bash
pnpm run typecheck
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/decisionlens-xai run typecheck
```

## Important scope note

The current release uses an in-memory decision store with seeded examples. It is intentionally designed as a transparent, explainable scoring engine for the AIML 02 assignment/demo. A production release should add authenticated users, persistent storage, model evaluation against labeled outcomes, calibration monitoring, and an audit trail before being used for consequential decisions.