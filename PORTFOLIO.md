# Portfolio Lens — fin-impact-tool

This document is for a technical reviewer evaluating this repository as a work sample. It is not a user guide or a getting-started document; that is what the README is for. The goal here is to explain what design problems this codebase is solving, what tradeoffs were made deliberately, and where to look if you want to see the most signal-dense code.

---

## Purpose

`fin-impact-tool` is a locally-hosted financial impact analysis tool for project managers. It lets a PM ask natural-language questions ("What if we replace the Senior Developer with two Mid-level Developers on Project Alpha?") and get back structured financial analysis: cost deltas, margin change, burn rate impact, EVM metrics.

The distinguishing characteristic is the architecture of the AI layer: the LLM is used as an intent parser, not as a calculator. Every financial number in every response comes from a deterministic TypeScript engine. The LLM never produces a number.

This was a deliberate response to an earlier version where the LLM was asked to produce financial projections directly. That approach produced hallucinated figures. The current architecture eliminates that failure mode by design.

---

## Architectural Theses

### 1. LLM-engine separation

The LLM's role is narrow and explicit: take a natural-language query and return a typed `ScenarioOperation` JSON object. The engine's role is separate and exclusive: take that operation and compute the result. These two concerns never mix.

The boundary is enforced structurally. `server/engine/` has no imports from `ai.ts` and no awareness of any LLM provider. `ai.ts` calls `parseIntent()` to get an operation, then calls `executeScenario()` from the engine to compute results. Swapping the model, switching providers, or running with no LLM at all does not change the numbers — only the parsing step changes.

The practical consequence: the same query run against `openai/gpt-4.1` via GitHub Models and `llama3.2` via Ollama will produce the same financial output as long as both parse the intent correctly. The calculation is provider-independent.

### 2. Template-first narration

`generateNarrative()` in `server/engine/narrative.ts` produces a structured markdown response from a `ScenarioResult` with no LLM call. This is the default behavior.

LLM narration is opt-in and additive. A user can run fully offline with Ollama or with no LLM configured at all; they still get complete, structured financial output. The narrative layer never blocks the calculation layer.

This was a deliberate scope decision. It means the tool is testable end-to-end without any LLM credentials, which is why the E2E tests for the AI workflow use mocked responses rather than live API calls.

### 3. PII anonymization at the trust boundary

Before any data reaches a cloud LLM provider, `buildAnonymizedContextSnapshot()` in `server/db.ts` replaces person names with `Staff-1`, `Staff-2`, etc. Project names and financial figures are preserved — the LLM needs them to parse intent correctly — but individual names are stripped.

The anonymization happens once, at the boundary function that constructs the context snapshot for the LLM. It is not scattered across prompts or left to convention. The AGENTS.md marks this function as privacy-critical and explicitly calls out that no change should allow real names to reach external APIs.

---

## What to Read First

| File | What it shows |
|------|---------------|
| `server/engine/` | Core domain library. Pure TypeScript functions with no I/O, no side effects. 98 unit tests across 7 files. This is where the financial logic lives. |
| `server/engine/scenarios.ts` | Immutable staffing mutation functions. All return new arrays; inputs are never modified. The `calcScenarioImpact()` function computes before/after deltas. |
| `server/engine/evm.ts` | Full EVM implementation: CPI, SPI, four EAC variants, ETC, VAC, TCPI. Shows the depth of the financial domain model. |
| `server/ai.ts` | LLM client with vendor abstraction for GitHub Models and Ollama. Contains the V2 structured parsing path and the V3 agentic tool-calling loop (8-iteration max with a fallback summary if the limit is reached). |
| `server/db.ts` (specifically `buildAnonymizedContextSnapshot`) | The trust boundary for cloud LLM requests. Worth reading for the anonymization pattern. |
| `tests/e2e/ui/ai-workflow.spec.ts` | Playwright E2E tests for the non-deterministic AI path, using mocked responses. Shows how to test an LLM-integrated workflow without live API calls. |
| `AGENTS.md` | The guide written for AI coding assistants working in this repo. Signals intentional documentation practice and explicit design constraints recorded for future contributors. |

---

## Intentional Scope Limits

These are features that were considered and deliberately not completed in the current version.

**Excel import is preview-only.** The import endpoint (`POST /api/import/excel`) parses an uploaded workbook and returns sheet names plus the first 20 rows of up to 10 sheets. The mapping step — connecting detected columns to the SQLite schema — is deferred. This was scoped out because the shape detection problem (identifying which column is a bill rate versus a cost rate across arbitrarily formatted workbooks) is a separate feature with its own complexity surface. Shipping preview-only was the right stopping point for this sprint.

**No multi-user auth.** The tool is designed for a single PM running it locally. The Express server binds to `localhost` only and is not accessible from other machines. Adding auth would be the right first step before any network exposure, but it is out of scope for a local single-user tool.

**No cloud hosting.** Data lives in a local SQLite file. This is a deliberate portability choice, not a gap. It also keeps the privacy story simple: all project and staffing data stays on the user's machine unless the user explicitly configures a cloud LLM provider.

---

## Tech Stack Choices

| Component | Choice | Why |
|-----------|--------|-----|
| Calculation engine | Pure TypeScript, no framework | The engine needed to be independently testable and free of I/O dependencies. A framework would have added abstractions without adding value to what is fundamentally a set of math functions. |
| Database | SQLite via `better-sqlite3` | Zero configuration, single file, fully portable. The synchronous API is appropriate for a local single-user tool and avoids async complexity in the data layer. |
| LLM providers | GitHub Models API + Ollama | GitHub Models fits a PAT-authenticated environment with model flexibility. Ollama provides a fully local fallback that requires no credentials and keeps all inference on the machine. The abstraction in `ai.ts` keeps provider switching to a config value. |
| Unit tests | Vitest | Co-located with the TypeScript source, fast, and compatible with the ESM module setup. The 98 engine tests are the primary correctness gate for the financial calculations. |
| E2E tests | Playwright | The UI-level AI workflow tests mock the LLM response layer so the tests are deterministic and do not require live API credentials in CI. |
| Frontend | React 19 + Vite + Tailwind | Vite's dev server with proxy handles the split between the frontend dev port and the Express API port without configuration overhead. React 19 for access to the concurrent rendering improvements. Tailwind to keep styling local to components. |

---

## V3 Agentic Loop

The V3 endpoint (`POST /api/scenario/v3`) implements a tool-calling loop where the LLM can call `executeScenario()` multiple times before producing a final narrative. The loop has a hard cap of 8 iterations. If the model has not produced a `finish_reason: stop` by that point, the server calls `requestFinalSummary()` to force a text response from whatever scenarios have been explored.

This is worth noting because it is the one place where the LLM has more latitude — it chooses which scenarios to run and in what order. The constraint that keeps this safe is the same as in V2: each tool call still goes through `executeScenario()`, so the engine, not the model, produces every number in the result set.
