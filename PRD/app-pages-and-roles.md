## app-flow-pages-and-roles.md

### Site map (top-level pages)

* Homepage
* Lesson Page
* Progress Page (optional MVP+)
* Auth Page (login/signup)

---

### Purpose of each page

**Homepage**

* Introduce platform
* Showcase interactive ML preview
* Entry point to algorithms

**Lesson Page (core product)**

* Learn + experiment + inspect code
* Run training playback
* Adjust parameters

**Progress Page**

* Track completed lessons
* Suggest next steps

**Auth Page**

* Handle login/signup
* Enable progress saving

---

### User roles & access levels

**Guest (default)**

* Access all lessons
* Run experiments
* No progress saved

**Logged-in user**

* Save progress
* Resume lessons
* Track completion

👉 No complex roles needed for MVP

---

### Primary user journeys

#### 1. Explore an algorithm (core journey)

1. Land on Homepage
2. Click an algorithm (e.g., Gradient Descent)
3. Enter Lesson Page and press ▶ Play

---

#### 2. Experiment with parameters

1. Open lesson
2. Adjust slider (e.g., learning rate)
3. Watch visualization update instantly

---

#### 3. Learn from code

1. Scroll to code panel
2. View JS / Python implementation
3. Connect logic to visualization

---

### Lesson Page structure (critical)

```id="d0q0g7"
[ Left Panel ]   Concept explanation
[ Right Panel ]  Visualization + controls
[ Bottom Panel ] Code viewer
```

---

### Interaction flow inside Lesson Page

1. User enters lesson
2. Dataset loads (Iris or synthetic)
3. Initial state rendered
4. User presses ▶ Play
5. Training loop runs step-by-step
6. User adjusts parameters → state resets
7. Visualization updates

---

### Key UI states

**Initial**

* Model not started
* Prompt: “Start the experiment”

**Running**

* Animation active
* Controls visible

**Paused**

* State frozen
* Step button enabled

**Completed**

* Model converged
* Message: “Training complete”

---

### Navigation principles

* Keep navigation minimal
* Always allow quick return to Homepage
* Avoid deep nested routes

---

### UX rules (important)

* One clear action per screen
* Controls always visible
* Feedback always immediate
* No hidden states

---

### Final product flow summary

* User enters → sees live ML demo
* Clicks lesson → runs experiment
* Adjusts parameters → sees instant change
* Opens code → understands logic

👉 This loop = core product value
