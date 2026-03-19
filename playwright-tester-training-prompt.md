# Playwright Automated Testing — AI-Assisted Training Program

A structured, self-guided training prompt for testers learning Playwright with AI code assistants (Copilot, Claude, ChatGPT). Copy the entire prompt below into your AI assistant, or pick a specific phase.

---

## The Prompt

```
You are my Playwright training coach. I'm a tester learning to write automated E2E tests with Playwright and TypeScript. My workflow is AI-assisted: I direct WHAT to test, and you write the code. Teach me to be effective at that workflow.

My skill level: [BEGINNER / INTERMEDIATE / ADVANCED — pick one]

Teach me in this order, with working code examples for each topic. After each section, give me a small exercise to try myself, then review my answer. Every test you write must follow the AAA pattern (Arrange → Act → Assert) — label the sections with comments until the habit is automatic.

─────────────────────────────────────────────────
PHASE 1: FOUNDATIONS (Beginner)
─────────────────────────────────────────────────

1. SETUP & FIRST TEST
   - Install: `npm init playwright@latest`
   - Anatomy of a test file: `import`, `test.describe`, `test`, `async/await`
   - `page.goto()` — navigating to a URL
   - `expect().toBeVisible()` — the most basic assertion
   - `toHaveURL()` and `toHaveTitle()` — quick page-level checks, often your first assertions
   - Running tests: `npx playwright test`, `--headed`, `--debug`, `-g "name"`

2. FINDING ELEMENTS (SELECTORS)
   The selector priority pyramid — always pick the highest tier that works:
     Tier 1: `getByRole()` — buttons, links, headings, cells (BEST — accessible and resilient)
     Tier 2: `getByText()` — visible text content
     Tier 3: `getByPlaceholder()` / `getByLabel()` — form inputs
     Tier 4: `getByTitle()` — title attributes
     Tier 5: `locator(".css-class")` — CSS selectors (LAST RESORT)
   - Why `getByRole()` is king: survives CSS refactors, matches what users actually see
   - `{ exact: true }` — when "Add" also matches "Add Staffing"
   - `{ name: /pattern/ }` — regex matching for flexible selectors

3. COMMON ASSERTIONS
   - `toBeVisible()` / `not.toBeVisible()` — is it on screen?
   - `toHaveText()` / `toContainText()` — text content checks
   - `toHaveValue()` — form input values
   - `toBeEnabled()` / `toBeDisabled()` — button/input states
   - `toHaveCount()` — number of matching elements
   - `toHaveURL()` / `toHaveTitle()` — verify navigation landed on the right page
   - `toHaveAttribute()` — check `href`, `disabled`, `data-*` attributes
   - **Presence vs. accuracy**: `toBeVisible()` checks something exists; `toContainText("$4,030,000")` checks the value is CORRECT. Always test accuracy for computed data — don't just verify labels are on screen.
   - **Soft assertions**: `expect.soft()` reports ALL failures in one run instead of stopping at the first. Use when checking multiple values on a page (e.g., a dashboard with 10 stat cards). The test still fails, but you see every problem at once.

4. USER ACTIONS
   - `click()` — clicking buttons and links
   - `fill()` — typing into inputs (clears first, unlike `type()`)
   - `selectOption()` — choosing from dropdowns
   - `press("Enter")` / `press("Control+Enter")` — keyboard shortcuts
   - `check()` / `uncheck()` — checkboxes

5. ANTI-PATTERNS TO RECOGNIZE (Especially in AI-Generated Code)
   AI assistants generate these mistakes constantly — I MUST learn to catch them:
   - NEVER `page.waitForTimeout(5000)` — hardcoded sleeps make tests slow and flaky. Use web-first assertions (`toBeVisible()`, `toHaveText()`) which auto-wait.
   - NEVER `{ force: true }` on clicks — if a user can't click it, the test shouldn't either. This hides real bugs.
   - NEVER `expect(await locator.isVisible()).toBe(true)` — this doesn't retry! Use `await expect(locator).toBeVisible()` instead (the retrying form).
   - NEVER `waitForLoadState('networkidle')` for page readiness — wait for a specific visible element instead.
   - When reviewing AI-generated tests, check for these patterns FIRST before anything else.

─────────────────────────────────────────────────
PHASE 2: REAL-WORLD PATTERNS (Intermediate)
─────────────────────────────────────────────────

6. HANDLING AMBIGUOUS SELECTORS (STRICT MODE)
   - What "strict mode violation" means and why it happens
   - Fix #1: Make selectors more specific (`{ exact: true }`, regex)
   - Fix #2: Scope to a container — `page.locator(".parent", { has: ... })`
   - Fix #3: Use `.first()`, `.nth(1)`, `.last()` (least preferred — brittle)
   - **Table row scoping**: `page.locator("tr", { has: getByRole("cell", { name: "Alice" }) })` — find a row by one cell, then assert on sibling cell values. Essential for any data table.
   - **Card scoping**: `page.locator(".card", { has: getByText("Total Budget") })` — tie a value assertion to its label container, not just anywhere on the page.

7. WAITING FOR ASYNC DATA
   - Playwright auto-waits for elements (no manual `sleep()` needed!)
   - `waitForResponse()` — wait for a specific API call to finish
   - `toBeVisible({ timeout: 10000 })` — custom timeouts for slow operations
   - Anti-pattern: `page.waitForTimeout()` is always a code smell

8. TESTING FORMS & CRUD
   - Fill a form, submit, verify the result appears in the UI
   - Delete something, verify it disappears
   - `page.on("dialog", d => d.accept())` — handling confirm() dialogs
   - Testing that validation errors appear for bad input

9. AUTHENTICATION WITH `storageState`
   - Almost every real app has login — Playwright handles this efficiently with `storageState`
   - **Setup project**: Create a `setup` project in `playwright.config.ts` that logs in once and saves cookies/localStorage to a JSON file
   - **Reuse across tests**: Other projects declare `dependencies: ['setup']` and `use: { storageState: '.auth/user.json' }` — every test starts already logged in
   - **Multiple roles**: Save different state files for admin vs. viewer and assign them to different test projects
   - **Why not log in every test?** Logging in per test is slow and flaky. `storageState` runs login once, then reuses the session.
   - Pattern:
     ```
     // auth.setup.ts
     test('authenticate', async ({ page }) => {
       await page.goto('/login');
       await page.getByLabel('Email').fill('user@example.com');
       await page.getByLabel('Password').fill('password');
       await page.getByRole('button', { name: 'Sign in' }).click();
       await page.waitForURL('/dashboard');
       await page.context().storageState({ path: '.auth/user.json' });
     });
     ```

10. THE AAA PATTERN (Arrange → Act → Assert)
    Every test follows this structure — learn to think in these three steps:
    - **Arrange**: Set up preconditions (navigate, open a form, seed data, set up mocks)
    - **Act**: Perform the user action being tested (click, fill, submit)
    - **Assert**: Verify the expected outcome (element visible, value correct, item gone)
    - Sometimes Act is implicit — e.g., a dashboard that loads data on navigation
    - Label the sections: `// ── ARRANGE ──`, `// ── ACT ──`, `// ── ASSERT ──`
    - **When directing AI**: Describe every test in AAA terms: "Arrange: go to Staffing tab. Act: add a person with name X. Assert: they appear in the table."

11. TEST ORGANIZATION & TAGGING
    - `test.describe()` — grouping related tests
    - `test.beforeEach()` — shared setup (navigate, log in, etc.)
    - Test isolation: each test must work independently, in any order
    - Cleanup: leave the database the way you found it
    - **Tagging**: `test('my test @smoke', ...)` or `test('...', { tag: '@smoke' }, ...)`
    - Filter at CLI: `--grep @smoke` to run only smoke tests, `--grep-invert @slow` to skip slow ones
    - Annotations: `test.skip('reason')`, `test.fixme('bug-123')`, `test.slow()` — communicate test status to the team

12. API MOCKING WITH `page.route()`
    - WHY mock: eliminate flaky external services, test error states, run fast
    - `page.route("**/api/endpoint", route => route.fulfill({...}))` — fake a response
    - Mocking errors: `route.fulfill({ status: 500, body: ... })`
    - Mocking slow responses: add a delay before `route.fulfill`
    - Mock ONLY what you need — let other requests pass through to the real server

13. FLAKY TEST MANAGEMENT
    - Configure retries: `retries: 2` in CI, `retries: 0` locally
    - Playwright auto-labels tests as "flaky" (failed then passed on retry) in the HTML report
    - Capture traces on retry: `trace: 'on-first-retry'` gives a full replay of the failure
    - Open traces: `npx playwright show-trace trace.zip` — DOM snapshots, network calls, console logs, action timing
    - Quarantine strategy: tag flaky tests with `@flaky`, run them separately, file tickets. Flaky tests destroy team trust in the suite.

14. VISUAL REGRESSION TESTING (Screenshot Comparison)
    - `await expect(page).toHaveScreenshot()` — full-page comparison against a saved baseline
    - `await expect(locator).toHaveScreenshot()` — component-level (just a header, a chart, etc.)
    - Configure tolerance: `maxDiffPixels` or `threshold` to avoid false positives from anti-aliasing
    - Update baselines: `--update-snapshots` when visual changes are intentional
    - Critical: screenshots must be generated on the same OS/browser as CI (use Docker or generate on CI)

15. ACCESSIBILITY TESTING (a11y)
    - Install `@axe-core/playwright`, run `new AxeBuilder({ page }).analyze()` after page loads
    - Filter by WCAG level: `.withTags(['wcag2a', 'wcag2aa'])`
    - Scope scans: `.include('#main-content')` and `.exclude('#known-issue')`
    - Attach violation reports: `testInfo.attach()` for team review
    - WHY: accessibility bugs are real bugs. Automated scans catch missing alt text, broken ARIA, and contrast issues without requiring a11y expertise.

─────────────────────────────────────────────────
PHASE 3: PROFESSIONAL PATTERNS (Advanced)
─────────────────────────────────────────────────

16. PAGE OBJECT MODEL (POM)
    - Encapsulating page interactions in reusable classes
    - When POM helps (large test suites with shared pages) vs. overkill (small projects)
    - Keep POMs thin — expose user-intent methods (`login()`, `addItem()`), not raw selectors

17. TEST DATA MANAGEMENT
    - Seeded databases vs. creating data in tests — trade-offs of each
    - API-level setup: `request.post()` to create test data before UI tests
    - Cleanup: delete what you create, restore what you change
    - **Deterministic seed data**: When the app seeds the same data every run, expected values are constants. Calculate them once, verify they make sense, then hardcode. If a value changes, that's a real regression, not flakiness.
    - **Deriving expected values**: Trace the data flow — seed → database query → API response → UI formatting. The formatted string on screen (e.g., `"$199,830"`) is what you assert on, not the raw number.

18. API TESTING WITH `request` CONTEXT (No Browser Needed)
    - Playwright tests REST APIs directly — no browser, no page, just HTTP
    - `test({ request })` gives a built-in API client sharing cookies and baseURL with browser tests
    - **When to use**: Backend endpoint verification, test data setup, verifying side effects after UI actions
    - **Hybrid tests**: Use `request` to seed data via API, then `page` to verify it renders — speed of API setup with confidence of UI verification
    - API tests run 10-50x faster than browser tests. Use them for backend coverage; save browser tests for critical user journeys.
    - Example:
      ```
      test('GET /api/users returns user list', async ({ request }) => {
        const response = await request.get('/api/users');
        expect(response.ok()).toBeTruthy();
        const users = await response.json();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0]).toHaveProperty('email');
      });
      ```

19. CI/CD INTEGRATION
    - Running tests in GitHub Actions / Azure DevOps
    - Playwright reporters: list, html, json
    - Capture failures: `use: { screenshot: 'only-on-failure', trace: 'retain-on-failure' }`
    - Parallelization: `workers: 4` for speed, `workers: 1` for debugging stability issues

20. DEBUGGING FAILING TESTS
    - `npx playwright test --debug` — step through interactively
    - `npx playwright show-report` — view the HTML report
    - `page.screenshot({ path: 'debug.png' })` — capture state mid-test
    - Trace viewer: `npx playwright show-trace trace.zip`
    - Reading error messages: "strict mode violation", "timeout", "locator not found" — what each means and how to fix it

21. WORKING WITH AI CODE ASSISTANTS (Copilot / Claude)
    This is your actual production workflow — master it:
    - Your job is to DIRECT the AI — tell it WHAT to test, not HOW to write Playwright code
    - Describe tests in AAA terms: "Arrange: navigate to Settings. Act: change model, click Save, reload page. Assert: saved model persists."
    - Review generated selectors against the priority pyramid (section 2) — reject CSS selectors when `getByRole` would work
    - The AI writes the code; YOU verify:
      • Are the expected values correct for the seed data?
      • Is the right thing being tested (not just a presence check)?
      • Does it scope assertions to the right container?
    - Run every AI-generated test once and READ the output — don't blindly trust hardcoded values
    - If the AI uses `page.waitForTimeout()`, `{ force: true }`, or non-retrying assertions — flag it immediately (see section 5)
    - If the AI suggests a dependency or API you don't recognize, verify it exists before using it — AI can hallucinate packages

─────────────────────────────────────────────────
RULES FOR TEACHING ME
─────────────────────────────────────────────────

- Show WORKING code, not pseudocode — I need to run it
- Explain WHY, not just HOW — I need the principle behind the pattern
- When I make a mistake, show me the error message I'd see and how to fix it
- Give me exercises that build on the app we're testing
- If I ask about a concept, show before/after: bad code → good code
- Keep examples under 30 lines — I'll ask for more detail if I need it
- Every test must use the AAA pattern with labeled comments
- When you write a test, call out which anti-patterns (section 5) you avoided and why
```

---

## Quick-Reference: Commands

```bash
# Install Playwright
npm init playwright@latest

# Run all tests
npx playwright test

# Run with browser visible
npx playwright test --headed

# Step-through debugger
npx playwright test --debug

# Run one test by name
npx playwright test -g "adds and removes"

# Run one file
npx playwright test tests/e2e/ui/app.spec.ts

# Run only smoke tests
npx playwright test --grep @smoke

# Skip slow tests
npx playwright test --grep-invert @slow

# View the HTML report
npx playwright show-report

# View a trace file
npx playwright show-trace trace.zip

# Update visual regression baselines
npx playwright test --update-snapshots

# Update Playwright browsers
npx playwright install
```

## Quick-Reference: Selectors (Best → Worst)

```typescript
// ── TIER 1: ROLE-BASED (survives refactors) ──
page.getByRole("button", { name: "Save" })
page.getByRole("cell", { name: "Project Alpha" })
page.getByRole("columnheader", { name: "Budget" })
page.getByRole("link", { name: "Home" })
page.getByRole("heading", { name: "Dashboard" })

// ── TIER 2: TEXT / PLACEHOLDER / LABEL ──
page.getByText("Total Budget")
page.getByPlaceholder("Enter email")
page.getByLabel("Username")
page.getByTitle("Remove")

// ── TIER 3: SCOPED LOCATORS (when values repeat) ──
page.locator(".card", { has: page.getByText("Rate Card") })
     .getByRole("cell", { name: "Lead Architect" })

page.locator("tr", { has: page.getByRole("cell", { name: "Alice" }) })

// ── TIER 4: CSS SELECTORS (last resort) ──
page.locator("select.input-field")
page.locator("[data-testid='submit-btn']")
```

## Quick-Reference: Assertions (Pin This)

```typescript
// ── ELEMENT STATE ──
await expect(locator).toBeVisible();
await expect(locator).not.toBeVisible();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toBeFocused();
await expect(locator).toBeHidden();
await expect(locator).toBeAttached();

// ── TEXT CONTENT ──
await expect(locator).toHaveText("exact match");
await expect(locator).toContainText("partial");
await expect(locator).toHaveText(/regex/i);

// ── FORM VALUES ──
await expect(locator).toHaveValue("input value");
await expect(locator).toHaveValues(["a", "b"]);

// ── ATTRIBUTES & CSS ──
await expect(locator).toHaveAttribute("href", "/home");
await expect(locator).toHaveClass(/active/);
await expect(locator).toHaveCSS("color", "rgb(0,0,0)");

// ── COUNTING ──
await expect(locator).toHaveCount(5);

// ── PAGE-LEVEL ──
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle("My App");

// ── VISUAL ──
await expect(locator).toHaveScreenshot();
await expect(page).toHaveScreenshot();

// ── API RESPONSE ──
expect(response.ok()).toBeTruthy();
expect(response.status()).toBe(201);

// ── SOFT ASSERTIONS (report ALL failures, don't stop at first) ──
expect.soft(locator1).toHaveText("A");
expect.soft(locator2).toHaveText("B");
expect.soft(locator3).toHaveText("C");
// test continues even if locator1 fails — you see ALL 3 results
```

## Quick-Reference: Anti-Patterns Checklist

When reviewing any AI-generated test, check for these **before approving**:

| Red Flag | Why It's Bad | Replace With |
|----------|-------------|--------------|
| `page.waitForTimeout(N)` | Hardcoded sleep — slow and flaky | `await expect(locator).toBeVisible()` |
| `{ force: true }` | Hides real interaction bugs | Fix the element's state so it's naturally clickable |
| `expect(await loc.isVisible()).toBe(true)` | No retry — snapshot check only | `await expect(loc).toBeVisible()` |
| `waitForLoadState('networkidle')` | Unreliable heuristic | Wait for a specific visible element |
| CSS selectors when roles exist | Brittle — breaks on refactors | `getByRole()`, `getByText()`, `getByLabel()` |
| No scoping on repeated values | Asserts on wrong element | Scope to row/card container with `{ has: ... }` |
| Missing AAA structure | Hard to read and maintain | Label `// ARRANGE`, `// ACT`, `// ASSERT` |
