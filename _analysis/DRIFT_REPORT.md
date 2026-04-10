# Documentation Drift Report

Contradictions, stale content, and gaps found between code and existing documentation.

---

## Drift Items

### DRIFT-001 — README API table is incomplete

**Severity:** Medium  
**File:** `README.md` (API Endpoints section)  
**Finding:** The table lists only 13 endpoints. The actual `server/routes.ts` exposes 17 routes, including:
- `POST /api/scenario/v2` (listed as `/api/scenario` — wrong path)
- `POST /api/scenario/v2/parse-only` (missing)
- `POST /api/scenario/v3` (missing)
- `POST /api/import/excel/v2` (missing)
- `GET /api/scenarios` (listed correctly)

The entry `POST /api/scenario` in the README does not match the actual route `POST /api/scenario/v2`.

**Resolution:** Updated the API Endpoints table in `README.md` to reflect all current routes with correct paths and descriptions.

---

### DRIFT-002 — README omits Ollama/local LLM support

**Severity:** Medium  
**File:** `README.md` (Tech Stack table, AI section, Quick Start)  
**Finding:** The README describes only the GitHub Models API provider. The codebase (`server/ai.ts`) fully supports a second LLM provider: `ollama` (local Ollama server). Config keys `llm_provider`, `ollama_model`, and `ollama_endpoint` are already functional. The Settings panel likely exposes these options.

**Resolution:** Updated README to mention Ollama as a supported local alternative and added it to the Tech Stack table.

---

### DRIFT-003 — README architecture diagram uses generic "models.github.ai" — omits Ollama path

**Severity:** Low  
**File:** `README.md` (Architecture section)  
**Finding:** The ASCII architecture diagram shows only the GitHub Models API path. There is no Ollama branch.

**Resolution:** Added a note below the diagram explaining the Ollama alternative path rather than complicating the diagram.

---

### DRIFT-004 — `server/engine/` has no documentation

**Severity:** High  
**File:** `server/engine/` (missing README)  
**Finding:** The calculation engine is the most complex and test-covered subproject in the repository, but has no documentation. Module responsibilities, public API surfaces, and how to run the test suite are undocumented.

**Resolution:** Created `server/engine/README.md` documenting the engine architecture, modules, types, and test commands.

---

### DRIFT-005 — `client/` has no documentation

**Severity:** Medium  
**File:** `client/` (missing README)  
**Finding:** The React frontend is an independent build artifact with its own `package.json` but no README. Component responsibilities, build commands, and API proxy configuration are not documented.

**Resolution:** Created `client/README.md`.

---

### DRIFT-006 — `server/import/excel/` has no documentation

**Severity:** Medium  
**File:** `server/import/excel/` (missing README)  
**Finding:** The Excel import module has a versioned API (`v1`, `v2`) and its own test fixtures but no documentation explaining the import flow, response shapes, or planned V2 differentiation.

**Resolution:** Created `server/import/excel/README.md`.

---

### DRIFT-007 — No agent-configuration documentation

**Severity:** Low  
**File:** Repository root (no AGENTS.md)  
**Finding:** No agent-config files exist (no `.claude/`, `.cursor/`, `.github/copilot-instructions.md`). There is no canonical human-readable guide explaining the repository to AI coding assistants.  
`playwright-tester-training-prompt.md` contains useful Playwright guidance but is framed as a training document, not agent configuration.

**Resolution:** Created `AGENTS.md` at repo root with repository overview, conventions, build/test commands, and notes on critical code areas.

---

### DRIFT-008 — README project structure tree is stale

**Severity:** Low  
**File:** `README.md` (Project Structure section)  
**Finding:** The tree omits `server/engine/`, `server/import/`, `tests/`, `playwright.config.ts`, and newer client components (`ScenarioCards.tsx`, `format.ts`).

**Resolution:** Updated the Project Structure tree in `README.md`.

---

## Non-Issues (Verified Accurate)

- README Quick Start commands match `package.json` scripts.
- Sample seed data (3 projects, 8 labor categories, 8 staffing assignments) matches `server/db.ts` `seedSampleData()`.
- Security notes (PAT stored locally, localhost-only binding) match `server/index.ts` and `server/db.ts`.
- Tech stack table entries (Express, SQLite, better-sqlite3, React 19, Vite, Tailwind, react-markdown, SheetJS) all match `package.json` and `client/package.json`.
