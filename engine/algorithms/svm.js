/**
 * engine/algorithms/svm.js — Step function for SVM
 * Requirements: 1.3, 1.4, 1.5
 */

import { dot, scale, sub } from '../../port/math.js';
import { validateParams } from '../validate.js';

/**
 * Advance SVM training by one sub-gradient descent step.
 * Matches port/SVM.js exactly.
 *
 * Objective: min  (1/2)||w||^2 * 2  +  C * sum_violations(hinge)
 * Gradient for w:  dw = 2w - C * sum(y_i * x_i)   for margin violators
 * Gradient for b:  db = -C * sum(y_i)               for margin violators
 *
 * Labels are treated as 0/1 and converted to -1/+1 internally.
 *
 * @param {Object} state  - Current training state (not mutated)
 * @param {Object} params - Hyperparameters: { lr, nIter, C }
 * @returns {Object} new state
 */
function stepSVM(state, params) {
    validateParams(params, 'svm');

    // Requirements 1.5: converged state is a fixed point
    if (state.iteration >= params.nIter) {
        return { ...state, converged: true };
    }

    const { weights, bias, dataset } = state;
    const { X, y } = dataset;
    const { lr, C } = params;
    const m = X.length;
    const n = weights.length;

    // Convert 0/1 labels to -1/+1 (SVM convention)
    const ySvm = y.map(label => (label === 1 ? 1 : -1));

    // Current weight vector as plain array copy (do not mutate input)
    const w = weights.slice();

    // Identify margin-violating points: y_i * (x_i · w + b) < 1
    const marginPts = [];
    for (let i = 0; i < m; i++) {
        if (ySvm[i] * (dot(X[i], w) + bias) < 1) {
            marginPts.push(i);
        }
    }

    // dw = 2w - C * sum(y_i * x_i) for margin violators
    // (gradient of ||w||^2 + C * hinge_sum w.r.t. w)
    const dw = scale(w, 2);
    for (const i of marginPts) {
        for (let j = 0; j < n; j++) {
            dw[j] -= C * ySvm[i] * X[i][j];
        }
    }

    // db = -C * sum(y_i) for margin violators
    let db = 0;
    for (const i of marginPts) db -= C * ySvm[i];

    // Update weights and bias
    const newW = sub(w, scale(dw, lr));
    const newBias = bias - lr * db;

    // Hinge loss for display: C * sum(max(0, 1 - y_i*(w·x_i + b))) + ||w||^2
    let hingeLoss = 0;
    for (let i = 0; i < m; i++) {
        const margin = ySvm[i] * (dot(X[i], newW) + newBias);
        hingeLoss += Math.max(0, 1 - margin);
    }
    let wNormSq = 0;
    for (let j = 0; j < n; j++) wNormSq += newW[j] * newW[j];
    // Normalize for display so the chart is readable regardless of m
    hingeLoss = (C * hingeLoss + wNormSq) / m;

    return {
        ...state,
        bias: newBias,
        weights: Array.from(newW),
        loss: hingeLoss,
        iteration: state.iteration + 1,
        converged: false,
    };
}

export default stepSVM;
