# Subproject List

Confirmed subprojects and candidate areas with rationale for include/exclude decisions.

---

## Confirmed Subprojects

### 1. `client/` — React Frontend

**Indicators:**
- Independent `package.json` with its own `name` (`fin-impact-client`), `version`, and `scripts`
- Separate TypeScript config (`client/tsconfig.json`)
- Distinct build tool: Vite + Tailwind
- No cross-dependency on server runtime (communicates via REST API only)
- Independent `npm run dev`, `build`, `preview` lifecycle

**Verdict:** ✅ Confirmed subproject — independent build artifact, deployable separately.

---

### 2. `server/engine/` — Financial Calculation Engine

**Indicators:**
- Cohesive domain with 10+ focused TypeScript modules (`labor.ts`, `margin.ts`, `budget.ts`, `evm.ts`, `utilization.ts`, `scenarios.ts`, `portfolio.ts`, `matching.ts`, `narrative.ts`, `executor.ts`)
- Dedicated type system (`types.ts`) with no external imports beyond itself
- Own test suite in `server/engine/__tests__/` — 98 tests across 7 files
- Pure functions; zero side effects; no I/O (no DB/HTTP calls)
- Barrel export via `index.ts`
- Could be extracted to an npm package with minimal refactoring

**Verdict:** ✅ Confirmed subproject — coherent domain library with self-contained tests. Not independently published yet, but architecturally distinct.

---

### 3. `server/import/excel/` — Excel Import Module

**Indicators:**
- Distinct domain (Excel/XLSX workbook parsing)
- Versioned handler API (`v1/`, `v2/`, `shared/` sub-directories)
- Barrel export via `index.ts`
- Dedicated Playwright E2E tests under `tests/e2e/excel/`
- Uses `SheetJS` (xlsx) separately from other server logic

**Verdict:** ✅ Confirmed subproject — separate feature area with its own versioned API surface and test suite.

---

## Excluded Candidates

### `server/` (root server, minus engine and import)

Contains `index.ts`, `db.ts`, `ai.ts`, `routes.ts`. These are tightly coupled to each other and the Express application lifecycle. No independent build. No separate test suite.

**Verdict:** ❌ Not a subproject — part of the monolithic server application.

### `tests/e2e/`

Contains Playwright E2E tests. Not an independent deliverable; depends on the running application. No own `package.json`.

**Verdict:** ❌ Not a subproject — test suite, not a deployable artifact.

---

## Summary Table

| Path                   | Type             | Own package.json | Own tests | Verdict             |
|------------------------|------------------|-----------------|-----------|---------------------|
| `client/`              | React app        | ✅               | Playwright | ✅ Subproject        |
| `server/engine/`       | Calc library     | ❌ (inline)      | ✅ vitest  | ✅ Subproject        |
| `server/import/excel/` | Feature module   | ❌ (inline)      | ✅ Playwright | ✅ Subproject     |
| `server/` (root)       | Express app      | root             | —         | ❌ Monolith layer    |
| `tests/e2e/`           | Test suite       | ❌               | self       | ❌ Test artifact     |
