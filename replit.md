# DecisionLens XAI

An explainable AI decision-support workspace that turns operational readiness inputs into recommendations, confidence levels, factor contributions, and next steps.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/decisionlens-xai/src/App.tsx` — complete web experience and client-side route surface
- `artifacts/decisionlens-xai/src/index.css` — DecisionLens visual system and responsive layout
- `artifacts/api-server/src/routes/decisions.ts` — deterministic explainable scoring engine and decision endpoints
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/api-client-react/src/generated/` — generated React Query client
- `lib/api-zod/src/generated/` — generated request validation and response types

## Architecture decisions

- The scoring engine intentionally exposes factor-level contributions rather than returning a black-box label.
- Risk exposure and timeline pressure are inverted before scoring because lower values represent better readiness.
- The first release uses a small in-memory workspace dataset so the demo is immediately usable without account setup.
- OpenAPI is the source of truth for the API; generated React Query hooks and Zod schemas keep the UI and server aligned.

## Product

- Start a new operational readiness analysis from seven directional inputs.
- Receive a recommendation: proceed, proceed with guardrails, or rework before committing.
- Review overall score, confidence level, factor impact, rationale, and suggested next steps.
- Search and filter decision history, with a full explainability view for every saved decision.

## User preferences

- Prioritize a polished user experience and complete the project as far as possible before reporting leftovers.

## Gotchas

- The API service must be running for the dashboard data and analysis flow to work.
- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
