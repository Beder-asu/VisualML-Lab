/**
 * engineImportRule.ts
 *
 * IMPORT BOUNDARY RULE — Decision 1B
 * ====================================
 * Nothing in `src/` may import from `port/` directly.
 *
 * CORRECT:
 *   import { step, initState } from '../engine';        // ✅ via engine public API
 *   import { loadDataset }     from '../engine';        // ✅
 *
 * INCORRECT:
 *   import LinearRegression from '../../port/LinearRegression'; // ❌
 *   import { SVM }          from '../port/SVM';                 // ❌
 *
 * RATIONALE:
 *   The `port/` directory contains raw algorithm ports that are not yet
 *   integrated into the engine's validated, typed public API. Importing
 *   from `port/` directly bypasses input validation, state management,
 *   and the algorithm dispatch layer in `engine/index.js`.
 *
 * GRADUATION PROCESS:
 *   When a `port/` algorithm is ready to be used in the UI:
 *     1. Integrate it into `engine/algorithms/` with proper state handling.
 *     2. Register it in the `step()` dispatcher in `engine/index.js`.
 *     3. Add it to the `VALID_ALGORITHMS` allow-list in `src/pages/LessonPage.tsx`.
 *     4. Only then may `src/` code reference it — through `engine/index.js`.
 *
 * ENFORCEMENT:
 *   ESLint is not currently configured in this project. If ESLint is added,
 *   enforce this rule with `no-restricted-imports`:
 *
 *   ```json
 *   {
 *     "rules": {
 *       "no-restricted-imports": ["error", {
 *         "patterns": ["port/"]
 *       }]
 *     }
 *   }
 *   ```
 *
 * This file is intentionally empty of runtime exports. Its purpose is
 * documentation and discoverability.
 */

export { };
