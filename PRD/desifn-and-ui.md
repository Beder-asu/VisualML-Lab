## design-guidelines.md

### Emotional tone

Feels like a calm machine learning laboratory—focused, intelligent, and quietly exploratory.

---

## Typography

### System

* **H1** → 32–40px, semi-bold (Inter / Satoshi)
* **H2** → 24–28px, medium
* **H3** → 18–20px, medium
* **Body** → 14–16px, regular
* **Code** → JetBrains Mono

### Rules

* Line height ≥ 1.6
* Clear spacing between sections
* Avoid dense text blocks

---

## Color system

### Primary

* Indigo → `#4F46E5`

### Secondary

* Teal → `#14B8A6`

### Background

* Light → `#F9FAFB`
* Dark → `#0F172A`

### Data colors

* Training → blue gradients
* Loss/error → orange/red
* Convergence → green

### Rules

* Contrast ≥ 4.5:1
* Avoid overly saturated colors
* Use color to explain, not decorate

---

## Spacing & layout

### Grid

* 8pt spacing system

### Layout structure

```
Left   → Concept
Right  → Visualization
Bottom → Code
```

### Rules

* Generous whitespace
* Clear separation between panels
* Keep controls always visible

---

## Motion & interaction

### Philosophy

Motion = explanation, not decoration

### Timing

* 150–300ms transitions

### Behaviors

* Training runs step-by-step
* Sliders trigger smooth recalculation
* Decision boundaries animate gradually

---

## Key interaction patterns

### Playback system

* ▶ Play → continuous step loop
* ⏸ Pause → freeze state
* ⏭ Step → single iteration
* ⏮ Reset → initial state

### Focus mode

* When playing:

  * dim surrounding UI slightly
  * emphasize visualization panel

---

## Visualization behavior

### Principles

* Show change over time
* Keep visuals simple (2D first)
* Avoid clutter

### Examples

* Gradient descent → moving point path
* K-Means → cluster centers shifting
* Regression → line adjusting

---

## Voice & tone

### Personality

* Calm
* Intelligent
* Supportive

### Examples

* “Adjust the learning rate and observe the change.”
* “The model is updating its weights.”
* “The model has converged.”

---

## System consistency

### Pattern

Every lesson follows:

1. Concept
2. Visualization
3. Experiment
4. Code

### Rule

* Never change layout between lessons

---

## Accessibility

* Keyboard support for controls
* ARIA labels for charts
* Focus indicators visible
* Screen-readable lesson text

---

## Emotional audit checklist

* Does the UI feel calm and focused?
* Do animations explain behavior?
* Does the user feel in control?

---

## Technical QA checklist

* Typography follows hierarchy
* Contrast meets WCAG AA+
* Interactive states are clear
* Animations stay within 150–300ms

---

## Design snapshot

### Color palette

```
Primary:   #4F46E5
Accent:    #14B8A6
Background:#F9FAFB
Error:     #F97316
Success:   #22C55E
```

---

### Typography scale

* H1 → 36px / semi-bold
* H2 → 26px / medium
* H3 → 20px / medium
* Body → 16px / regular
* Code → monospace

---

### Spacing system

* Base unit: 8px
* Sections: 24–40px spacing
* Panels: consistent padding

---

### Emotional thesis

A quiet, intelligent lab where users explore how machine learning behaves.

---

## Design Integrity Review

The system aligns well with both emotional and technical goals: calm visuals, structured layout, and purposeful motion reinforce learning.

**Improvement suggestion:**
Introduce subtle “before vs after” transitions when parameters change to strengthen cause-and-effect clarity.
