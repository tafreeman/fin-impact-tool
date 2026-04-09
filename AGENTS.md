# AGENTS.md — AI Coding Assistant Guide

This file is the canonical reference for AI coding assistants (GitHub Copilot, Claude, Cursor, etc.) working in the `fin-impact-tool` repository. Read it before making changes.

---

## What This Repository Is

A **portable, browser-based financial impact analysis tool** for project managers. It combines a deterministic TypeScript calculation engine with an optional LLM layer (GitHub Models API or local Ollama) to answer natural-language scenario questions ("What if we swap the Senior Dev for two Mid-level Devs on Project Alpha?").

Runs locally on Node.js. No cloud hosting, no user accounts, no telemetry. Data lives in a single SQLite file (`data/finimpact.db`).

---

## Repository Layout

```
fin-impact-tool/
├── server/            Express + TypeScript API server
│   ├── engine/        Financial calculation engine (pure functions, own tests)
│   └── import/excel/  Excel workbook preview module
├── client/            React 19 + Vite + Tailwind SPA (separate package.json)
├── tests/e2e/         Playwright end-to-end tests
├── _analysis/         Documentation audit artifacts (not shipped)
└── data/              SQLite database (auto-created, gitignored)
```

See [`README.md`](README.md) for full project structure and quick-start commands.

---

## Build, Test, and Run Commands

```bash
# Install all dependencies (root + client)
npm run install:all

# Development mode (hot reload — server :3000, client :5173)
npm run dev

# Production build (builds client, serves via Express)
npm run build
npm start

# Unit tests (Vitest — engine only)
npx vitest run

# E2E tests (Playwright — requires running server)
npm run test:e2e

# One-click Windows launcher
start.bat
```

---

## Architecture and Data Flow

### Scenario Pipeline (V2 — primary path)

```
User query (natural language)
  → POST /api/scenario/v2
  → parseIntent()         [LLM: anonymized context → ScenarioOperation JSON]
  → executeScenario()     [deterministic engine: no LLM]
  → generateNarrative()   [template-based by default; LLM opt-in]
  → V2Response { engine, narrative, model }
```

### Key Design Constraint

**The calculation engine never calls the LLM.** The LLM only parses intent (input) and optionally narrates results (output). All financial numbers come from the engine.

---

## Critical Code Areas

### `server/engine/` — The Calculation Engine

This is the core domain logic. It is:
- **Pure functions only** — no I/O, no side effects
- **Immutable** — mutation functions return new arrays, never modify inputs
- **Well-tested** — 98 unit tests cover all modules
- **Type-safe** — `types.ts` is the single source of truth for all interfaces

**Before modifying any engine module:**
1. Read [`server/engine/README.md`](server/engine/README.md)
2. Run `npx vitest run` and confirm all tests pass
3. Run tests again after your change

### `server/db.ts` — Privacy-Sensitive

`buildAnonymizedContextSnapshot()` strips person names (PII) before sending context to the LLM. Person names are replaced with `Staff-N`. **Do not modify this function in a way that could leak real names to external APIs.**

### `server/ai.ts` — LLM Client

Supports two providers: `github` (GitHub Models API, requires PAT) and `ollama` (local). Provider is set via the `llm_provider` config key in SQLite. Do not hardcode provider logic.

---

## Conventions

### TypeScript

- `server/` uses CommonJS-compatible ESM (`"type": "module"` implied by tsx)
- `client/` uses standard ESM modules
- Prefer `interface` over `type` for object shapes in `server/engine/types.ts`
- Import engine types with the `.js` extension suffix (ESM requirement): `import { ... } from "./types.js"`

### Error Handling

- Express route handlers return `{ error: string }` JSON on failure with appropriate HTTP status
- Engine functions use `safeDivide()` to avoid `NaN`/`Infinity` — never let divide-by-zero propagate

### Formatting

- Dollar amounts: `roundDollars()` (2 decimal places)
- Percentages: `roundPct()` (1 decimal place)
- Client-side: use `format.ts` helpers (`formatCurrency`, `formatPct`, `formatDelta`)

### Database

- Schema is auto-initialized on first run via `initSchema()` in `server/db.ts`
- WAL journal mode is always enabled for concurrent read safety
- All queries use `better-sqlite3` (synchronous API — no async/await needed)

---

## Testing Guidance

### Unit tests (engine)

- Test files live in `server/engine/__tests__/*.test.ts`
- Use Vitest (`npx vitest run`)
- Tests must remain deterministic — no randomness, no time-dependent logic

### E2E tests (Playwright)

- UI tests: `tests/e2e/ui/`
- Excel import tests: `tests/e2e/excel/`
- Follow the AAA pattern (Arrange → Act → Assert)
- See [`playwright-tester-training-prompt.md`](playwright-tester-training-prompt.md) for full Playwright conventions

### Do not:

- Remove or weaken existing tests
- Add `page.waitForTimeout()` (hardcoded sleeps) in Playwright tests
- Use `{ force: true }` on Playwright click actions

---

## LLM Provider Notes

When generating code that interacts with the AI layer:

- Always go through `parseIntent()` / `narrateResult()` / `agenticScenario()` in `server/ai.ts` — do not call LLM APIs directly from routes
- The LLM receives **anonymized** context (no real person names) — preserve this
- The default model is `openai/gpt-4.1` for the `github` provider
- Ollama default model is `llama3.2`

---

## What Not To Change Without Discussion

- `server/engine/types.ts` — changing interfaces here breaks the engine, tests, routes, and client simultaneously
- `buildAnonymizedContextSnapshot()` in `server/db.ts` — privacy-critical
- `seedSampleData()` in `server/db.ts` — used by E2E tests; changing seed values breaks hardcoded test assertions
- `playwright.config.ts` — affects all E2E test behavior

---

## Subproject Documentation

| Subproject | README |
|------------|--------|
| Calculation engine | [`server/engine/README.md`](server/engine/README.md) |
| React frontend | [`client/README.md`](client/README.md) |
| Excel import module | [`server/import/excel/README.md`](server/import/excel/README.md) |
