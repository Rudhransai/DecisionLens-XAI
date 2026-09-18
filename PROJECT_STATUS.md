# DecisionLens XAI — Comprehensive Project Status & Roadmap

## 🎯 Executive Summary
**DecisionLens XAI** is an Explainable AI (XAI) decision-support workspace engineered for evaluating complex operational readiness decisions. Rather than treating AI decision-making as an opaque black box, DecisionLens decomposes decisions across 7 key business and technical dimensions, calculates normalized directional attributions, provides human-interpretable rationale, and suggests action items.

---

## 📊 Completed Features & Deliverables

### 1. 🧠 Core Explainable AI (XAI) Scoring Engine
- [x] **7-Factor Multidimensional Scoring**:
  - Strategic Alignment (Positive impact)
  - Financial Readiness (Positive impact)
  - Technical Readiness (Positive impact)
  - Team Readiness (Positive impact)
  - Market Evidence (Positive impact)
  - Risk Exposure (Inverted impact — lower risk increases readiness)
  - Timeline Pressure (Inverted impact — lower pressure increases readiness)
- [x] **Recommendation Categorization**:
  - `PROCEED` (Readiness Score $\ge 75\%$)
  - `PROCEED WITH GUARDRAILS` ($50\% \le \text{Readiness Score} < 75\%$)
  - `REWORK BEFORE COMMITTING` ($\text{Readiness Score} < 50\%$)
- [x] **Confidence Level Estimation**: Dynamically computed based on variance and factor alignment.
- [x] **Factor Attribution Decomposition**: Positive vs. negative contribution percentage per factor (SHAP/attribution style).
- [x] **Automated Plain-Language Rationale**: Dynamic synthesis of key blockers and drivers.
- [x] **Concrete Next Steps & Action Plan Generation**: Targeted mitigation recommendations for underperforming dimensions.

### 2. 🖥️ Interactive Web Dashboard (`artifacts/decisionlens-xai`)
- [x] **Interactive Scoring Form**: Sliders and numerical inputs for fine-tuning factors with real-time feedback.
- [x] **What-If Sensitivity Simulator**: Interactive live simulation allowing users to tweak factor values and observe instant shifts in overall score, confidence, and recommendation category.
- [x] **Radar Chart Analysis**: Multi-axis spider chart comparing actual dimension ratings against ideal readiness baselines.
- [x] **Attribution Waterfall Chart**: Visualizes positive vs. negative contributions pushing the score up or down.
- [x] **Scenario Presets**: Pre-configured templates (Aggressive Expansion, Safe Migration, Tech Debt Remediation, High-Risk Venture).
- [x] **Multi-Scenario Comparison**: Side-by-side comparison modal/view to evaluate alternative decision paths.
- [x] **Audit Trail View**: Comprehensive activity logging with timestamps, actor IDs, previous states, and diffs.
- [x] **Model Evaluation & Calibration Suite**:
  - Confusion Matrix & Performance Metrics (Accuracy, Precision, Recall, F1-Score, ROC-AUC).
  - Calibration Curve & Reliability Diagram.
- [x] **Decision Report Export Modal**: Export full decision dossiers to **PDF (Automated auto-download report using jsPDF)**, **Markdown**, **JSON**, or copy formatted summaries directly to clipboard for executive reviews.
- [x] **Decision History & Filtering**: Search, tag filtering, and sorting across saved decisions.
- [x] **Design & Aesthetics**: Sleek modern dark mode UI with glassmorphism, responsive cards, and micro-interactions.

### 3. ⚙️ Backend API & Services (`artifacts/api-server`)
- [x] **Express 5 API Server** with modular routing:
  - `POST /api/decisions/evaluate`: Real-time XAI scoring & attribution evaluation.
  - `GET /api/decisions`: Retrieve historical decisions with search, filtering, pagination.
  - `POST /api/decisions`: Store new decision evaluations.
  - `GET /api/decisions/:id`: Fetch detailed decision dossier.
  - `PUT /api/decisions/:id`: Update existing decision notes or factors.
  - `DELETE /api/decisions/:id`: Delete decisions.
  - `GET /api/decisions/metrics`: Dynamic model evaluation and calibration metrics.
  - `GET /api/decisions/audit-trail`: Audit event stream.
  - `GET /api/health`: Service health check.
- [x] **Unit & Regression Tests**: Automated test suite for scoring logic and boundary conditions (`scoring.test.ts`).

### 4. 📐 Architecture, Schemas & Type Safety
- [x] **OpenAPI 3.0 Specification (`lib/api-spec/openapi.yaml`)**: Single source of truth for API contracts.
- [x] **Automated Code Generation**:
  - Orval-generated React Query hooks (`lib/api-client-react`).
  - Zod runtime validation schemas & static TypeScript types (`lib/api-zod`).
- [x] **Database Schema**: PostgreSQL schema defined using Drizzle ORM (`lib/db/src/schema/decisions.ts`).

---

## 🚀 What Needs to Be Completed / Future Roadmap

| Priority | Feature / Task | Description | Status |
| :--- | :--- | :--- | :--- |
| **High** | **Automated PDF Report Export** | Generated clean executive briefing PDFs directly with `jsPDF` for instant download. | ✅ Completed |
| **High** | **PostgreSQL Database Integration** | Connect live Postgres database via `DATABASE_URL` and run Drizzle migrations for persistent storage across server restarts. | Pending |
| **Medium** | **User Authentication & RBAC** | Add OAuth (Google/GitHub) or JWT authentication with Role-Based Access Control (Viewer, Analyst, Executive Approver). | Pending |
| **Low** | **Custom Weight Configuration** | Allow organizational administrators to define custom weights per factor (e.g. prioritize Financial Readiness over Timeline Pressure). | Pending |
| **Low** | **Team Collaboration & Comments** | Enable inline comments and stakeholder approval workflows on specific decision dossiers. | Pending |
| **Low** | **Automated CI/CD Pipeline** | GitHub Actions workflow for automated linting, typechecking, running test suites, and Docker container build. | Pending |

---

## 🛠️ How to Run Locally

### Prerequisites
- Node.js $\ge 20$
- pnpm or npx pnpm

### Commands
```bash
# 1. Install dependencies
npx pnpm install

# 2. Codegen API types from OpenAPI spec
npx pnpm --filter @workspace/api-spec run codegen

# 3. Start Backend API Server (Port 5000)
npx pnpm --filter @workspace/api-server run dev

# 4. Start Frontend Web Application (Port 5173)
npx pnpm --filter @workspace/decisionlens-xai run dev

# 5. Run Typechecks & Tests
npx pnpm run typecheck
npx pnpm --filter @workspace/api-server test
```

---

## 📦 How to Push / Save to Your GitHub Repository

If this workspace is not yet linked to your GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add files and make initial commit
git add .
git commit -m "feat: complete DecisionLens XAI workspace with explainability engine, simulator & evaluation suite"

# 3. Rename branch to main
git branch -M main

# 4. Add your GitHub remote repository URL
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 5. Push code to GitHub
git push -u origin main
```
