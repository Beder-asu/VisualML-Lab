/**
 * engine/index.js — Public API for the ML Engine
 *
 * RULE: src/ must never import from port/ directly.
 *
 * All UI code in src/ must consume algorithms through this file's exported
 * API. The port/ directory contains raw algorithm ports that have not been
 * integrated into the engine's validation and state management layer.
 *
 * To graduate a port/ algorithm to production use:
 *   1. Implement it under engine/algorithms/ with proper state handling.
 *   2. Register it in the step() dispatcher below.
 *   3. Add it to VALID_ALGORITHMS in src/pages/LessonPage.tsx.
 *   See src/utils/engineImportRule.ts for full details.
 */

import { initState, prettyPrintState } from './state.js';
import { loadDataset } from './datasets.js';
import { getDecisionBoundary } from './boundary.js';
import stepLinearRegression from './algorithms/linearRegression.js';
import stepLogisticRegression from './algorithms/logisticRegression.js';
import stepSVM from './algorithms/svm.js';

/**
 * Dispatch to the correct algorithm step function based on state.algorithm
 * @param {Object} state
 * @param {Object} params
 * @returns {Object} new state
 */
function step(state, params) {
    switch (state.algorithm) {
        case 'linearRegression':
            return stepLinearRegression(state, params);
        case 'logisticRegression':
            return stepLogisticRegression(state, params);
        case 'svm':
            return stepSVM(state, params);
        default:
            throw new Error(`Unsupported algorithm: '${state.algorithm}'. Supported: linearRegression, logisticRegression, svm`);
    }
}

export { initState, step, getDecisionBoundary, prettyPrintState, loadDataset };
