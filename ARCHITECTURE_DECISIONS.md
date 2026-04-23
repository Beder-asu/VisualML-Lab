# VisualML Lab — Architecture Decisions

> Output of the Deep System Design Review.
> Each decision is recorded with its rationale and implementation priority.

---

## Section 1 — Architecture

### 1B: engine/port staging rule
`port/` stays as a staging area for new algorithms. Nothing in `src/` ever imports from `port/` directly — only `engine/index.js` does. An algorithm graduates from `port/` to `engine/algorithms/` once it passes property tests and is registered in the `engine/index.js` dispatch switch.

**Why:** Prevents components from bypassing validation and the clean engine API as new algorithms are added.

---

### 2A: Web Worker for ML computation
Before tree-based models ship, move the ML engine step computation into a Web Worker. The worker receives serialized state + params, runs the step, and posts back the result. The main thread handles only rendering.

**Why:** Decision Tree and Random Forest `fit()` are synchronous and expensive. Running them on the main thread will freeze the UI. Web Workers are the correct isolation boundary.

**Note:** Tree model visualization strategy (step-by-step vs. full-run) is a separate open decision — deferred until tree models are ready to ship.

---

### 3A: Route-level code splitting
Add `React.lazy` + `Suspense` for `LessonPage` and `DataVizCheatSheetPage`. Also configure Vite `build.rollupOptions.output.manualChunks` to split heavy vendor libraries (`react-syntax-highlighter`, `d3`) into separate chunks.

**Why:** `react-syntax-highlighter` alone is ~300KB. Everything loads on the first page hit today. Route-level splitting means the homepage loads fast and lesson content loads on demand.

---

### 4A: localStorage for progress tracking (no backend for MVP)
Progress tracking uses `localStorage` only. No Express backend, no MongoDB. When auth is needed, migrate to Supabase free tier (replaces Express + MongoDB entirely).

**Why:** Zero infra cost, works offline, fits the zero-budget constraint. Cross-device sync is not an MVP requirement.

---

## Section 2 — Infrastructure & DevOps

*(Deferred — to be addressed in a dedicated DevOps session)*

Flagged issues for later:
- No CI/CD pipeline (tests never run automatically)
- Vercel preview deployments not being used deliberately as staging
- Zero observability (no error tracking, no analytics)
- No bundle size analysis in the build pipeline

---

## Section 3 — Security & Reliability

### 3.1A: Allow-list validation at the React boundary
In `LessonPage.tsx`, validate the `algorithm` param from `useParams` against an explicit allow-list before passing it to `useTrainingController`. If the value is not in `['linearRegression', 'logisticRegression', 'svm']`, redirect to the homepage.

**Why:** URL params flow directly into `initState`. Invalid values cause engine errors whose messages get surfaced raw to the user. Validate at the boundary, fail fast with a clean redirect.

**Where:** `src/pages/LessonPage.tsx`

---

### 3.2A: Hard iteration ceiling in executeStep
Add a `MAX_SAFE_ITERATIONS` constant (e.g., 10,000) in `useTrainingController`. If `engineState.iteration` exceeds this ceiling, force-stop the loop and surface a warning toast.

**Why:** If a future algorithm has a bug and never sets `converged: true`, and `nIter` is large, the RAF loop runs until the tab is closed. A hard ceiling is a cheap safety net.

**Where:** `src/hooks/useTrainingController.ts`

---

### 3.3A: Schema versioning for localStorage
When building the localStorage progress layer, wrap all stored data in a versioned envelope: `{ version: 1, data: {...} }`. On read, check the version and migrate or clear stale data.

**Why:** localStorage persists across app updates. Without versioning, old data silently breaks deserialization when the schema changes.

**Where:** Build this into the localStorage utility from day one (not retrofitted later).

---

### 3.4A: Content Security Policy via vercel.json
Add a `vercel.json` with CSP headers. For a fully client-side app: `default-src 'self'`, allow `'unsafe-inline'` for styles (Tailwind), block everything else. Test carefully — misconfigured CSP breaks things.

**Why:** No CSP means any injected script runs with full page access. One-time fix.

**Where:** `vercel.json` (create if it doesn't exist)

---

## Section 4 — Performance & Cost

### 4.2A: Lazy dataset construction
Change `datasets.js` to build datasets lazily — construct on first access, cache the result. Use a `Map` with a factory function per dataset name instead of building all three at module load time.

**Why:** All datasets are built eagerly even if the user only visits one lesson. Establishes the right pattern before larger datasets are added.

**Where:** `engine/datasets.js`

---

### 4.3A: Ring buffer for loss history
Replace the current lossy downsampling in `useTrainingController` with a fixed-size circular buffer (e.g., last 200 points). No decimation, O(1) insertion, always shows the most recent N steps accurately.

**Why:** The current approach keeps every other element when history exceeds 100 points. This misses spikes, oscillations, and convergence patterns — exactly the things the loss curve is supposed to teach.

**Where:** `src/hooks/useTrainingController.ts`

---

### 4.4A: Memoize getDecisionBoundary in useVisualization
In `useVisualization`, add a `useRef` for previous `weights` and `bias`. Only call `getDecisionBoundary` when they actually change. Skip the call (and the 200ms animation) on re-renders where weights are unchanged.

**Why:** `getDecisionBoundary` is called on every state update, including pause events and unrelated re-renders. Eliminates redundant computation and unnecessary animation triggers.

**Where:** `src/hooks/useVisualization.ts`

---

## Open Decisions

| Decision | Status | Notes |
|---|---|---|
| Tree model step-by-step visualization strategy | Open | Deferred until tree models are ready to ship. Options: breadth-first step (A) vs. full-run in Web Worker (B) |
| DevOps / CI/CD pipeline | Deferred | Flagged, not prioritized for MVP |
| Auth migration to Supabase | Future | Trigger: when cross-device progress sync becomes a requirement |
