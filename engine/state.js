/**
 * engine/state.js — State construction and serialization
 */

import { loadDataset } from './datasets.js';
import { prependOnes } from '../port/math.js';

const SUPPORTED_ALGORITHMS = ['linearRegression', 'logisticRegression', 'svm'];

/**
 * Initialize a fresh training state.
 * @param {string} algorithm
 * @param {string|Object} dataset - dataset name or already-loaded dataset object
 * @param {Object} params
 * @returns {Object} initial state
 */
function initState(algorithm, dataset, params) {
    if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
        throw new Error(`Unsupported algorithm: '${algorithm}'. Supported: linearRegression, logisticRegression, svm`);
    }

    const ds = typeof dataset === 'string' ? loadDataset(dataset) : dataset;
    const nFeatures = ds.X[0].length;

    return {
        algorithm,
        weights: new Array(nFeatures).fill(0),
        bias: 0,
        loss: null,
        iteration: 0,
        converged: false,
        dataset: ds,
        XAug: prependOnes(ds.X),
    };
}

/**
 * Serialize state to a human-readable indented JSON string.
 * @param {Object} state
 * @returns {string}
 */
function prettyPrintState(state) {
    // Convert Float64Arrays to plain arrays for JSON serialization
    // XAug is derived from dataset.X and excluded — it will be recomputed on load
    const { XAug: _excluded, ...rest } = state;
    const serializable = {
        ...rest,
        weights: Array.from(state.weights),
        dataset: {
            ...state.dataset,
            X: state.dataset.X.map(row => Array.from(row)),
            y: Array.from(state.dataset.y),
        },
    };
    return JSON.stringify(serializable, null, 2);
}

export { initState, prettyPrintState };
