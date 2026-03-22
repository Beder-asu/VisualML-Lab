/**
 * engine/index.js — Public API for the ML Engine
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
