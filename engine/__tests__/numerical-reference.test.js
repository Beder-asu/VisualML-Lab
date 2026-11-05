import { describe, expect, it } from 'vitest';
import { initState, step } from '../index.js';

const dataset = { name: 'reference', X: [[0], [1]], y: [0, 1], task: 'regression' };
const params = { lr: 0.1, nIter: 10, C: 1 };
const mse = state => state.dataset.X.reduce((sum, row, i) =>
    sum + (state.bias + row.reduce((s, x, j) => s + x * state.weights[j], 0) - state.dataset.y[i]) ** 2, 0) / state.dataset.X.length;

describe('independent numerical reference cases', () => {
    it('preserves the half-MSE update and reports full MSE at returned linear weights', () => {
        let state = step(initState('linearRegression', dataset, params), params);
        expect(state.weights[0]).toBeCloseTo(0.05, 12);
        expect(state.bias).toBeCloseTo(0.05, 12);
        expect(state.loss).toBeCloseTo(0.40625, 12);
        for (let i = 0; i < 4; i++) {
            state = step(state, params);
            expect(state.loss).toBeCloseTo(mse(state), 12);
        }
    });
    it('matches a finite-difference half-MSE gradient at a nonzero model', () => {
        const state = { ...initState('linearRegression', dataset, params), weights: [0.2], bias: 0.1 };
        const next = step(state, params);
        const eps = 1e-6;
        const weightDerivative = (mse({ ...state, weights: [0.2 + eps] }) - mse({ ...state, weights: [0.2 - eps] })) / (4 * eps);
        const biasDerivative = (mse({ ...state, bias: 0.1 + eps }) - mse({ ...state, bias: 0.1 - eps })) / (4 * eps);
        expect((state.weights[0] - next.weights[0]) / params.lr).toBeCloseTo(weightDerivative, 8);
        expect((state.bias - next.bias) / params.lr).toBeCloseTo(biasDerivative, 8);
    });
    it('reports logistic BCE at the returned model, including its first update', () => {
        let state = step(initState('logisticRegression', { ...dataset, task: 'classification' }, params), params);
        expect(state.weights[0]).toBeCloseTo(0.025, 12);
        expect(state.bias).toBe(0);
        expect(state.loss).toBeCloseTo(-(Math.log(0.5) + Math.log(1 / (1 + Math.exp(-0.025)))) / 2, 12);
        for (let i = 0; i < 4; i++) {
            state = step(state, params);
            const probabilities = [1 / (1 + Math.exp(-state.bias)), 1 / (1 + Math.exp(-state.weights[0] - state.bias))];
            const expected = -(Math.log(1 - probabilities[0]) + Math.log(probabilities[1])) / 2;
            expect(state.loss).toBeCloseTo(expected, 12);
        }
    });
    it('keeps the SVM display objective aligned with its returned weights', () => {
        const ds = { ...dataset, X: [[0, 0], [1, 1]], task: 'classification' };
        const state = step(initState('svm', ds, params), { ...params, lr: 0.01 });
        expect(state.weights).toEqual([0.01, 0.01]);
        expect(state.bias).toBe(0);
        expect(state.loss).toBeCloseTo(0.9901, 12);
    });
});
