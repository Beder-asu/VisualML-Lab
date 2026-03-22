/**
 * engine/algorithms/linearRegression.js — Step function for Linear Regression
 * Requirements: 1.1, 1.4, 1.5
 */

import { prependOnes, matvec, matTvec, scale, sub } from '../../port/math.js';
import { validateParams } from '../validate.js';

/**
 * Advance Linear Regression training by one gradient descent step.
 * Extracts the inner loop body from port/LinearRegression.js.
 *
 * @param {Object} state  - Current training state (not mutated)
 * @param {Object} params - Hyperparameters: { lr, nIter }
 * @returns {Object} new state
 */
function stepLinearRegression(state, params) {
    validateParams(params, 'linearRegression');

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

    // pred = newX @ w
    const pred = matvec(newX, w);

    // residual = pred - y
    const residual = sub(pred, Float64Array.from(y));

    // MSE loss = (1/m) * sum(residual^2)
    let mse = 0;
    for (let i = 0; i < residual.length; i++) mse += residual[i] * residual[i];
    mse /= m;

    // dw = (1/m) * newX.T @ residual
    const dw = scale(matTvec(newX, residual), 1 / m);

    // w -= lr * dw
    const newW = sub(w, scale(dw, lr));

    return {
        ...state,
        bias: newW[0],
        weights: Array.from(newW.slice(1)),
        loss: mse,
        iteration: state.iteration + 1,
        converged: false,
    };
}

export default stepLinearRegression;
