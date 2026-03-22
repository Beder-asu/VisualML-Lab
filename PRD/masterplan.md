## masterplan.md

### 30-second elevator pitch

* VisualML Lab = **interactive ML simulator**
* Users **watch algorithms learn step-by-step**
* Sliders control behavior → **instant visual feedback**
* Code is visible → **learn by seeing + reading**

---

### Problem & mission

* ML is abstract → hard to visualize
* Tutorials explain results, not process
* Learners don’t see *how models evolve*

**Mission**

* Turn ML into a **visual, explorable system**
* Make learning feel like running experiments

---

### Target audience

* CS students learning ML basics
* Self-taught devs
* Educators teaching visually

---

### Core features

* Algorithm lessons (7 models)
* Training playback:

  * ▶ Play
  * ⏸ Pause
  * ⏭ Step
  * ⏮ Reset
* Parameter sliders (learning rate, clusters…)
* Real-time visualization (boundaries, loss, clusters)
* Code panel (JS + Python reference)
* Progress tracking (lightweight)

---

### High-level tech stack

* **Frontend**

  * React + Vite + TypeScript → fast dev + performance
  * Tailwind + shadcn/ui → clean system UI
* **Visualization**

  * D3.js + Canvas → smooth data-driven animation
* **ML Engine**

  * JavaScript (from scratch) → runs in browser (instant feedback)
* **Backend**

  * Express.js → auth + progress only
* **Database**

  * MongoDB Atlas → flexible learning data
* **Hosting**

  * Vercel (serverless)

---

### Conceptual data model

* User

  * email
  * progress[]
* Lesson

  * title
  * algorithm
  * dataset
* Progress

  * lessonId
  * completed
  * lastVisited

---

### UI design principles

* “Don’t make me think”
* Always visible:

  * controls
  * visualization
* Same layout for all lessons
* Immediate feedback on interaction
* Minimal text, maximum clarity

---

### Security & compliance

* OAuth + email login
* No sensitive data stored
* Public datasets only

---

### Phased roadmap

**MVP**

* 3 algorithms
* playback system
* sliders + visualization

**V1**

* all 7 models
* code panel
* progress tracking

---

### Risks & mitigations

* Too complex visuals → simplify to 2D
* Performance issues → small datasets (Iris)
* User confusion → consistent layout

---

### Future expansion

* Neural network visual debugger
* Custom datasets
* Educator dashboards
* Shareable experiments
