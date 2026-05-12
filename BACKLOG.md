# Portfolio Improvement Backlog

Generated from architectural review — 2026-05-11.
Sources: panel review findings across Lens 1 (Technical Maturity), Lens 2 (Architect Signal),
Lens 3 (Portfolio Narrative), and Lens 4 (Anti-signals).

## Rating Keys

| Rating | Complexity | Impact / Value |
|--------|-----------|----------------|
| **L** | Low — isolated change, no cross-cutting risk, ≤90 min | Low — hygiene or cosmetic improvement |
| **M** | Medium — touches 2–4 files, requires design decision, ~half-day | Medium — materially raises portfolio signal or reduces a real risk |
| **H** | High — architectural change, new dependency, or multi-day effort | High — eliminates a critical finding or unlocks a strategic capability |

## Velocity Assumption
Sprint = 2 weeks. Estimated points (1 pt ≈ 2 hrs focused work).
Total capacity assumed: ~20 pts / sprint for a solo contributor.

---

## Sprint 1 — First-Impression Fixes & CI Baseline
**Goal:** Eliminate the two highest-visibility anti-signals and get CI green on tests before sharing the repo URL with any panel reviewer. All items are low-complexity, high-return.

| # | Item | Complexity | Impact | Points | Files / Notes |
|---|------|-----------|--------|--------|---------------|
| S1-1 | **Archive `.litcoffee` research file** — move `AI Code Generation Research 2026.litcoffee` to `docs/research/ai-tooling-landscape-2026.md`, add a one-paragraph header explaining what it is and who wrote it. Update `.gitignore` to exclude future litcoffee files. | L | H | 1 | Root → `docs/research/`. Single biggest first-impression risk. |
| S1-2 | **Add `npm test` to CI gate** — insert `run: npm test` after typecheck step in `.github/workflows/deploy-pages.yml`. Validates the "98 tests" claim is enforced, not aspirational. | L | H | 1 | `deploy-pages.yml:28` |
| S1-3 | **Fix `client/tsconfig.json` unused-locals flags** — set `"noUnusedLocals": true, "noUnusedParameters": true`. Fix any resulting warnings. These weakened flags signal the compiler is being silenced rather than satisfied. | L | M | 2 | `client/tsconfig.json:16–17` |
| S1-4 | **Add `PORTFOLIO.md` at repo root** — a 1-page framing document for a director reviewer: what problem this solves, the 3 architectural theses (LLM-engine separation, template-first narration, PII anonymization), which files to read first, and what was intentionally scoped out. Not a README duplicate — a portfolio lens document. | L | H | 2 | New file. Transforms repo from product to portfolio artifact. |
| S1-5 | **Enhance README architecture diagram** — annotate the existing ASCII diagram with "LLM: INTENT ONLY" and "ENGINE: ALL NUMBERS" labels on the respective boxes. The most important constraint in the codebase is invisible in the current diagram. | L | M | 1 | `README.md:47–65` |
| S1-6 | **Add `## Design Decisions` section to README** — 4 bullets naming the architectural theses with one-line rationale each. Link forward to ADRs (Sprint 2). Converts product doc into portfolio doc. | L | H | 1 | `README.md` — new section after Architecture. |

**Sprint 1 total: 8 pts** *(~16 hrs — fits comfortably in one sprint)*

---

## Sprint 2 — Architecture Signal & Type Safety
**Goal:** Produce the ADRs that turn implicit judgment into citable evidence. Fix the `any`-type and linter gap that undermines the TypeScript strictness claim. These are the items a director will probe in an interview.

| # | Item | Complexity | Impact | Points | Files / Notes |
|---|------|-----------|--------|--------|---------------|
| S2-1 | **Write ADR 001: LLM-Engine Separation** — document the decision, context, options considered (let LLM compute numbers, hybrid, engine-only), rationale for chosen approach, and the V1 failure mode that validated the choice. | L | H | 2 | New `docs/decisions/001-llm-engine-separation.md`. Highest-signal document missing from repo. |
| S2-2 | **Write ADR 002: Template-First Narration with LLM Opt-In** — document why `generateNarrative()` is the default, why LLM narration is opt-in, and the privacy/cost/determinism tradeoffs. | L | H | 2 | New `docs/decisions/002-template-first-narration.md` |
| S2-3 | **Write ADR 003: PII Anonymization Strategy** — document what is anonymized (person names), what is deliberately preserved (project names, financials), the threat model, and why Ollama mode is the airgap path. | L | H | 2 | New `docs/decisions/003-pii-anonymization.md` |
| S2-4 | **Add `@typescript-eslint/recommended` + fix `no-explicit-any`** — install `eslint` + `@typescript-eslint/eslint-plugin`, add `.eslintrc.json`, run against server/ and fix `chatRequest()` return type (type the OpenAI-compatible response shape), `as any[]` in `routes.ts:33`, and remaining `any` usages. | M | H | 5 | 31 `any` occurrences across `server/ai.ts`, `server/routes.ts`, `server/db.ts`, `server/engine/narrative.ts`, import handlers. |
| S2-5 | **Add Zod validation for `ScenarioOperation` at LLM output boundary** — create `server/engine/validation.ts` with a Zod schema mirroring `ScenarioOperation`, call `zodSchema.safeParse(parsed)` inside `parseIntent()` before the `as ScenarioOperation` cast. Return a typed fallback on parse failure. Addresses OWASP LLM Top 10 LLM02. | M | H | 4 | `server/ai.ts:176–182`. Eliminates silent runtime failures on malformed LLM output. |

**Sprint 2 total: 15 pts** *(~30 hrs — slightly heavy; S2-4 can slip to Sprint 3 if needed)*

---

## Sprint 3 — Security Baseline & Dependency Hygiene
**Goal:** Close the supply chain and API security gaps that a federal/DoD reviewer will flag as disqualifying. These are not portfolio-signal items — they are table-stakes for the claimed domain.

| # | Item | Complexity | Impact | Points | Files / Notes |
|---|------|-----------|--------|--------|---------------|
| S3-1 | **Add Dependabot configuration** — create `.github/dependabot.yml` for npm (root + client packages), weekly schedule, grouped security updates. Signals supply chain awareness. | L | M | 1 | New `.github/dependabot.yml`. No existing config. |
| S3-2 | **Evaluate and replace `xlsx` v0.18.5** — audit CVEs against SheetJS CE `0.18.x` line; evaluate migration to `exceljs` or SheetJS v0.20+ (commercial). Document the decision in a comment or ADR. The current version has unresolved security reports in the community fork line. | M | H | 4 | `package.json:25`. May require handler API changes in `server/import/excel/`. |
| S3-3 | **Add rate limiting on LLM-connected routes** — install `express-rate-limit`, apply a limiter to `POST /api/scenario/v2`, `POST /api/scenario/v3`, and `POST /api/scenario/v2/parse-only`. Reasonable limit: 30 req/min per IP. Addresses OWASP LLM Top 10 LLM04 (Model DoS). | L | H | 2 | `server/routes.ts`. Add before scenario route registrations. |
| S3-4 | **Add query length validation and CORS lock** — validate `query.length <= 2000` on scenario routes (prompt injection surface reduction per LLM01). Configure `cors()` with an explicit origin allowlist (`localhost:3000`, `localhost:5173`) instead of the current wildcard default. | L | M | 2 | `server/routes.ts:114`, `server/index.ts` (cors setup). |
| S3-5 | **Add file upload size limit to multer config** — set `limits: { fileSize: 10 * 1024 * 1024 }` (10 MB) on the multer instance. Current config has no upper bound on upload size. | L | M | 1 | `server/routes.ts:23` |
| S3-6 | **Add CSP headers to Express** — install `helmet`, add to `server/index.ts`. At minimum: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`. Relevant for any embedded or federated deployment context. | L | M | 2 | `server/index.ts` |

**Sprint 3 total: 12 pts** *(~24 hrs — fits with margin)*

---

## Sprint 4 — Observability & LLMOps Maturity
**Goal:** Add the operational instrumentation a director expects to see for any AI feature in a delivery lead's portfolio. These items directly address the strategic gap between "it works" and "it's operable."

| # | Item | Complexity | Impact | Points | Files / Notes |
|---|------|-----------|--------|--------|---------------|
| S4-1 | **Server-side token and cost logging** — log `tokensUsed`, `model`, `provider`, and a wall-clock duration for every LLM call in `server/ai.ts`. Write to a structured log line (JSON, `console.error` or a logger). Exposes cost-per-query data without requiring a full observability stack. | L | M | 2 | `server/ai.ts` — add to `narrateResult()`, `parseIntent()`, `agenticScenario()`. |
| S4-2 | **Add per-call latency and iteration count to V3 response** — include `iterations_used`, `total_tokens`, `wall_ms` in the `AgenticResponse` shape. Surface in UI. Enables cost awareness without a separate dashboard. | L | M | 2 | `server/ai.ts:401–407`, `server/engine/types.ts` (or add to `AgenticResponse`). |
| S4-3 | **Add prompt versioning** — extract `PARSE_INTENT_PROMPT`, `NARRATE_PROMPT`, `AGENTIC_SYSTEM_PROMPT` from `server/ai.ts` into `server/prompts/v1/` as named string exports with a version constant. Log the prompt version alongside every LLM call. This is the minimal viable prompt versioning pattern; no external tooling required. | L | M | 3 | `server/ai.ts:57–144`. Separates prompt management from client logic. |
| S4-4 | **Build a minimal intent-parsing eval harness** — create `server/engine/__tests__/intent-eval.ts` with 15–20 golden (query → expected `action`) pairs. Run with `vitest` using mocked LLM responses for determinism. Add a real-LLM eval script behind an env-flag for manual regression runs. Addresses the largest strategic gap (NIST AI RMF MEASURE-2.5). | H | H | 8 | New test file + fixture set. Most impactful single addition for a GenAI delivery lead portfolio. |
| S4-5 | **Add `structuredlog` or `pino` for server-side logging** — replace `console.log` / `console.error` with structured JSON logging. Tag LLM calls with `component: "ai"`, engine calls with `component: "engine"`. Baseline for any future OTel integration. | M | M | 3 | `server/index.ts`, `server/ai.ts`, `server/routes.ts`. |

**Sprint 4 total: 18 pts** *(~36 hrs — S4-4 is the heavy item; can be split across sprints)*

---

## Sprint 5 — Federal/Regulated Readiness Signal
**Goal:** Convert the candidate's domain expertise from claimed to demonstrated. These items do not need to be production-grade — they need to exist and show considered design.

| # | Item | Complexity | Impact | Points | Files / Notes |
|---|------|-----------|--------|--------|---------------|
| S5-1 | **Write ADR 004: Federal Deployment Guidance** — document the CUI/FOUO handling model (what data is CUI in this tool, what controls apply), recommended deployment topology for a federal environment (Ollama-only mode, network isolation, no GitHub Models API), and which NIST AI RMF controls are addressed by existing design choices. This document exists nowhere in the repo and is the single highest-signal addition for a DoD/federal context role. | M | H | 4 | New `docs/decisions/004-federal-deployment.md`. Does not require code changes. |
| S5-2 | **Add audit trail fields to scenario history** — add `source_ip`, `session_id` (generated per browser session), and `query_hash` (SHA-256 of raw query) to the `scenarios` table in `server/db.ts`. These are the minimum fields for a tamper-evident log. Do not add PII. | M | H | 4 | `server/db.ts` schema + `saveScenario()`. Aligns with NIST AI RMF GOVERN-1.1 accountability. |
| S5-3 | **Add Ollama-only mode flag and startup validation** — add a `require_local_inference` config key. When set, reject any attempt to configure the `github` provider with a clear error message. Provide a startup banner confirming airgapped mode. Makes the local-inference path an explicitly tested and documented configuration rather than an incidental option. | M | M | 3 | `server/ai.ts`, `server/index.ts`. |
| S5-4 | **Document RMF control crosswalk in `docs/reference/security.md`** — extend the existing security doc with a table mapping current design choices to NIST AI RMF practices (GOVERN-1.1, MANAGE-2.2, MEASURE-2.5, MAP-1.5). Frame it as "what this tool addresses" and "what must be handled at the deployment layer." Two pages of content, no code required. | L | H | 3 | `docs/reference/security.md`. Directly addresses the panel question: "what would you add before deploying in a DoD environment?" |

**Sprint 5 total: 14 pts** *(~28 hrs)*

---

## Backlog (Unprioritized / Future Consideration)
Items identified but deprioritized — either low impact for portfolio signal, high complexity with unclear return, or dependent on Sprint 1–5 completion.

| # | Item | Complexity | Impact | Notes |
|---|------|-----------|--------|-------|
| B-1 | Full Excel import pipeline (beyond preview) | H | M | Scoped out intentionally; document in ADR if the scope decision is final. |
| B-2 | Multi-user auth / session isolation | H | M | Out of scope for local tool; relevant if deployed as a service. |
| B-3 | OTel / Langfuse / Phoenix integration | H | M | Sprint 4 logging lays the groundwork; full tracing is a separate effort. |
| B-4 | Promptfoo eval CI gate | H | H | Requires S4-4 eval harness first; then wire into CI as a separate workflow. |
| B-5 | SBOM generation (npm audit + `cyclonedx-npm`) | M | M | Prerequisite: Dependabot (S3-1) first. |
| B-6 | CodeQL / Semgrep SAST in CI | M | M | Low friction to add; medium signal improvement. |
| B-7 | WCAG 2.2 AA accessibility audit on client | M | M | Not relevant for federal portfolio signal unless accessibility compliance is cited. |
| B-8 | Extract `server/engine/` as a publishable npm package | H | M | Architecturally clean (no external deps), high effort for uncertain return. |

---

## Summary View

| Sprint | Theme | Points | Key Deliverable |
|--------|-------|--------|-----------------|
| **Sprint 1** | First impressions + CI baseline | 8 | `.litcoffee` archived, tests in CI, `PORTFOLIO.md` live |
| **Sprint 2** | Architecture signal + type safety | 15 | 3 ADRs, Zod validation, ESLint enforced |
| **Sprint 3** | Security baseline | 12 | Rate limiting, CORS lock, Dependabot, `xlsx` audit |
| **Sprint 4** | LLMOps maturity | 18 | Eval harness (golden dataset), prompt versioning, structured logging |
| **Sprint 5** | Federal readiness | 14 | RMF crosswalk ADR, audit trail, Ollama-only mode |
| **Backlog** | Future / dependent | — | SAST, SBOM, full import pipeline, OTel |

**Critical path for portfolio review readiness: Sprint 1 → Sprint 2 (S2-1 through S2-3 only) → done.**
That is 8 + 6 = 14 pts (~28 hrs) and eliminates every finding a 15-minute panel reviewer will catch.
