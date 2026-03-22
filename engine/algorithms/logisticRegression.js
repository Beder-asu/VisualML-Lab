/**
 * engine/algorithms/logisticRegression.js — Step function for Logistic Regression
 * Requirements: 1.2, 1.4, 1.5
 */

import { prependOnes, matvec, matTvec, scale, sub } from '../../port/math.js';
import { validateParams } from '../validate.js';

/**
 * Sigmoid activation: 1 / (1 + e^(-x))
 * @param {Float64Array} x
 * @returns {Float64Array}
 */
function sigmoid(x) {
    const out = new Float64Array(x.length);
    for (let i = 0; i < x.length; i++) out[i] = 1 / (1 + Math.exp(-x[i]));
    return out;
}

/**
 * Advance Logistic Regression training by one gradient descent step.
 * Extracts the inner loop body from port/LogisticRegression.js.
 * Computes binary cross-entropy loss.
 *
 * @param {Object} state  - Current training state (not mutated)
 * @param {Object} params - Hyperparameters: { lr, nIter }
 * @returns {Object} new state
 */
function stepLogisticRegression(state, params) {
    validateParams(params, 'logisticRegression');

    // Requirements 1.5: converged state is a fixed point
    if (state.iteration >= params.nIter) {
        return { ...state, converged: true };
    }

    const { weights, bias, dataset } = state;
    const { X, y } = dataset;
    const { lr } = params;
    const m = X.length;

    // Build combined weight vector [bias, ...weights] for prependOnes approach
    const newX = prependOnes(X); // m × (n+1), first col is ones

    // Combined weight vector: [bias, w0, w1, ...]
    const w = new Float64Array(weights.length + 1);
    w[0] = bias;
    for (let i = 0; i < weights.length; i++) w[i + 1] = weights[i];

    // yHat = sigmoid(newX @ w)
    const yHat = sigmoid(matvec(newX, w));

    // residual = yHat - y
    const residual = sub(yHat, Float64Array.from(y));

    // Binary cross-entropy loss: BCE = -(1/m) * sum(y*log(yHat) + (1-y)*log(1-yHat))
    let bce = 0;
    const eps = 1e-15; // clip to avoid log(0)
    for (let i = 0; i < m; i++) {
        const p = Math.min(Math.max(yHat[i], eps), 1 - eps);
        bce += y[i] * Math.log(p) + (1 - y[i]) * Math.log(1 - p);
    }
    bce = -bce / m;

    // dw = (1/m) * newX.T @ residual
    const dw = scale(matTvec(newX, residual), 1 / m);

    // w -= lr * dw
    const newW = sub(w, scale(dw, lr));

    return {
        ...state,
        bias: newW[0],
        weights: Array.from(newW.slice(1)),
        loss: bce,
        iteration: state.iteration + 1,
        converged: false,
    };
}

export default stepLogisticRegression;
