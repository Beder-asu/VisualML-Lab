## implementation-plan.md

### Step-by-step build sequence

#### Phase 1 — ML Engine (core logic)

* Define `state` structure for each algorithm

  * Example: `{ weights, loss, dataPoints }`
* Build `step(state, params)` for:

  * Linear Regression
  * Gradient Descent
  * K-Means
* Return **next state only** (no loops)
* Test each in console with small dataset (Iris subset)

---

#### Phase 2 — Dataset module

* Add built-in datasets:

  * Iris (2D projection)
  * Synthetic (blobs, lines)
* Create utility:

  * `loadDataset(name)`
* Normalize data for visualization

---

#### Phase 3 — Visualization engine

* Build reusable components:

  * Grid / axes
  * Data points renderer
  * Line / boundary renderer
* Use:

  * D3 for scales
  * Canvas for performance
* Ensure:

  * Smooth transitions on state change

---

#### Phase 4 — Training controller (core UX)

* Implement controls:

  * ▶ play → loop `step()`
  * ⏸ pause → stop loop
  * ⏭ step → single iteration
  * ⏮ reset → initial state
* Add speed control (interval timing)

---

#### Phase 5 — Lesson page layout

* Build 3-panel layout:

  * Left → explanation
  * Right → visualization
  * Bottom → code panel
* Add tabs:

  * Learn / Experiment / Code

---

#### Phase 6 — Parameter playground

* Add sliders:

  * learning rate
  * iterations
  * cluster count
* On change:

  * reset state
  * re-render instantly

---

#### Phase 7 — Code panel

* Show:

  * JS implementation (primary)
  * Python reference (secondary)
* Add:

  * collapsible sections
  * syntax highlighting

---

#### Phase 8 — Backend (minimal)

* Setup Express.js
* Endpoints:

  * auth (login/signup)
  * progress save/load
* Connect to MongoDB Atlas

---

#### Phase 9 — Progress tracking

* Track:

  * visited lessons
  * completed lessons
* Show progress bar

---

#### Phase 10 — Deployment

* Frontend → Vercel
* Backend → Vercel serverless / Render
* MongoDB Atlas → connect via env vars if needed [state ahead]

---

### Timeline with checkpoints

* ML engine (2 algorithms)
* dataset module

* visualization engine
* training controller

* lesson UI
* parameter sliders

* remaining algorithms
* code panel


---

### Team roles & rituals

**Roles**

* 1 Frontend/ML dev (you)
* Optional: UI polish later

**Weekly ritual**

* 30-min usability test (3 users)
* Ask:

  * “What confused you?”
  * “What felt unclear?”

Fix top 3 issues weekly.

---

### Optional integrations & stretch goals

* AI assistant (explain training behavior)
* Code-to-visual sync highlighting
* Export experiment as GIF
* Shareable lesson links
* Dark mode toggle
