# VisualML usability and geometry verification

Baseline commit `84341a9`. Captured November 7, 2026.

Classifier geometry now clips the decision line and each SVM margin to the plot. The renderer aligns segment endpoints before animating, so rotating through a vertical line does not collapse the segment. The initial all-zero guide is preserved.

Gradient plots resize with their containers, retain progress during resize, and use the same geometry for pointer hit testing and drawing. The regression vertical axis is labeled **Target**. Help returns focus to its opener, the tree exposes its active node, and the Logistic Regression view picker has an accessible name. With reduced motion enabled, the decorative network is static and tree and boundary updates appear immediately.

## Chrome visual comparison

The Linear Regression lesson was paused after one real worker step at each width. The sticky header was made static during image capture so the chart crop does not contain an overlapping header. Page widths were measured with normal styling.

| Viewport | Page width before | Page width after | Before | After |
|---:|---:|---:|---|---|
| 320px | 360px | 320px | [Capture](../output/playwright/usability/before/linear-320.png) | [Capture](../output/playwright/usability/after/linear-320.png) |
| 390px | 395px | 390px | [Capture](../output/playwright/usability/before/linear-390.png) | [Capture](../output/playwright/usability/after/linear-390.png) |
| 1024px | 1028px | 1024px | [Capture](../output/playwright/usability/before/linear-1024.png) | [Capture](../output/playwright/usability/after/linear-1024.png) |
| 1440px | 1440px | 1440px | [Capture](../output/playwright/usability/before/linear-1440.png) | [Capture](../output/playwright/usability/after/linear-1440.png) |

The paused Decision Tree regions continued to redraw after resizing. See the 390px [before](../output/playwright/usability/before/tree-resized-390.png) and [after](../output/playwright/usability/after/tree-resized-390.png) views and the 1440px [before](../output/playwright/usability/before/tree-resized-1440.png) and [after](../output/playwright/usability/after/tree-resized-1440.png) views.

At [native Chrome zoom of 200%](../output/playwright/usability/after/browser-zoom.json), the measured layout viewport was 633 CSS pixels and the document was 626 CSS pixels wide. The loss plot remained inside the viewport and iteration 1 was retained.

## Regression coverage

- 93 engine tests, including finite boundary points, near-vertical lines, edge contact, and SVM margins.
- 437 UI tests, including interrupted rotation, live reduced-motion changes, Help focus restoration, and resetting the active tree node.
- 15 production-browser tests passed locally in Chrome. CI runs those scenarios in Chromium, Firefox, and WebKit, including all five viewport sizes, the three Logistic Regression views, tooltip hit testing after resizing, and keyboard and motion behavior.
- The TypeScript and Vite production build passed. Existing Vite chunk-size and jsdom canvas warnings remain.

The accessibility checks cover keyboard behavior and exposed browser semantics. No physical-device or screen-reader session was performed.
