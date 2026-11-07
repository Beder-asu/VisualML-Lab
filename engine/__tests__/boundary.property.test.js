/**
 * Property-based tests for engine/boundary.js
 *
 * Property 6: Decision boundary returns valid points
 * Feature: ml-engine, Property 6: Decision boundary returns valid points
 * Validates: Requirements 4.1, 4.2, 4.3
 */

import fc from 'fast-check';
import { getDecisionBoundary } from '../boundary.js';
import { initState } from '../state.js';
import { loadDataset } from '../datasets.js';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

// Random finite non-zero weight value
const arbNonZeroWeight = fc.float({ min: -10, max: 10, noNaN: true })
    .filter(w => Math.abs(w) > 1e-6);

// State with finite, non-all-zero weights for classification algorithms
const arbClassificationState = fc.record({
    w0: arbNonZeroWeight,
    w1: arbNonZeroWeight,
    bias: fc.float({ min: -5, max: 5, noNaN: true }),
    algorithm: fc.constantFrom('logisticRegression', 'svm'),
}).map(({ w0, w1, bias, algorithm }) => {
    const dataset = loadDataset('blobs');
    const base = initState(algorithm, dataset, { lr: 0.1, nIter: 100, C: 1.0 });
    return { ...base, weights: [w0, w1], bias };
});

// State with finite, non-all-zero weights for linear regression
const arbRegressionState = fc.record({
    w0: arbNonZeroWeight,
    bias: fc.float({ min: -5, max: 5, noNaN: true }),
}).map(({ w0, bias }) => {
    const dataset = loadDataset('linear');
    const base = initState('linearRegression', dataset, { lr: 0.1, nIter: 100 });
    return { ...base, weights: [w0], bias };
});

// Grid sizes to test
const arbGridSize = fc.integer({ min: 2, max: 200 });

// ---------------------------------------------------------------------------
// Property 6: Decision boundary returns valid points
// Feature: ml-engine, Property 6: Decision boundary returns valid points
// Validates: Requirements 4.1, 4.2, 4.3
// ---------------------------------------------------------------------------

describe('Property 6: Decision boundary returns valid points', () => {
    it('for any classification state with finite weights, getDecisionBoundary returns an array where every element has numeric x and y, and all x values are in [0, 1]', () => {
        // Feature: ml-engine, Property 6: Decision boundary returns valid points
        // Validates: Requirements 4.1, 4.2
        fc.assert(
            fc.property(arbClassificationState, arbGridSize, (state, gridSize) => {
                const res = getDecisionBoundary(state, gridSize);
                const points = res.boundary;

                expect(Array.isArray(points)).toBe(true);
                expect([0, gridSize]).toContain(points.length);

                for (const pt of points) {
                    expect(typeof pt.x).toBe('number');
                    expect(typeof pt.y).toBe('number');
                    expect(pt.x).toBeGreaterThanOrEqual(0);
                    expect(pt.x).toBeLessThanOrEqual(1);
                    expect(isFinite(pt.y)).toBe(true);
                    expect(pt.y).toBeGreaterThanOrEqual(0);
                    expect(pt.y).toBeLessThanOrEqual(1);
                    expect(state.weights[0] * pt.x + state.weights[1] * pt.y + state.bias).toBeCloseTo(0, 10);
                }
            }),
            { numRuns: 100 }
        );
    });

    it('for any linear regression state with finite weights, getDecisionBoundary returns an array where every element has numeric x and y, and all x values are in [0, 1]', () => {
        // Feature: ml-engine, Property 6: Decision boundary returns valid points
        // Validates: Requirements 4.3
        fc.assert(
            fc.property(arbRegressionState, arbGridSize, (state, gridSize) => {
                const res = getDecisionBoundary(state, gridSize);
                const points = res.boundary;

                expect(Array.isArray(points)).toBe(true);
                expect(points.length).toBe(gridSize);

                for (const pt of points) {
                    expect(typeof pt.x).toBe('number');
                    expect(typeof pt.y).toBe('number');
                    expect(pt.x).toBeGreaterThanOrEqual(0);
                    expect(pt.x).toBeLessThanOrEqual(1);
                    expect(isFinite(pt.y)).toBe(true);
                }
            }),
            { numRuns: 100 }
        );
    });
});

describe('visible classifier geometry', () => {
    it.each([
        [[1, 0], -0.5, { x: 0.5, y: 0 }, { x: 0.5, y: 1 }],
        [[0, 1], -0.5, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }],
        [[0, 1], 0, { x: 0, y: 0 }, { x: 1, y: 0 }],
    ])('samples the visible segment for weights %j and bias %s', (weights, bias, first, last) => {
        const { boundary } = getDecisionBoundary({ algorithm: 'logisticRegression', weights, bias }, 7);
        expect(boundary).toHaveLength(7);
        expect(boundary[0]).toEqual(first);
        expect(boundary[6]).toEqual(last);
    });

    it('clips a nearly vertical line without large or non-finite coordinates', () => {
        const { boundary } = getDecisionBoundary({
            algorithm: 'logisticRegression', weights: [1, 1e-12], bias: -0.5,
        }, 9);
        expect(boundary).toHaveLength(9);
        for (const { x, y } of boundary) {
            expect(x).toBeCloseTo(0.5, 10);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(y).toBeLessThanOrEqual(1);
            expect(x + 1e-12 * y - 0.5).toBeCloseTo(0, 13);
        }
    });

    it.each([
        [[1, 0], -2], [[1, 1], 0], [[0, 0], 1],
    ])('returns no drawable line for weights %j and bias %s', (weights, bias) => {
        expect(getDecisionBoundary({ algorithm: 'logisticRegression', weights, bias }).boundary).toEqual([]);
    });

    it('clips the SVM decision line and both margins independently', () => {
        const { boundary, marginPos, marginNeg } = getDecisionBoundary({
            algorithm: 'svm', weights: [3, 0], bias: -1.5,
        }, 8);
        for (const [points, level] of [[boundary, 0], [marginPos, 1], [marginNeg, -1]]) {
            expect(points).toHaveLength(8);
            for (const { x, y } of points) {
                expect(3 * x - 1.5).toBeCloseTo(level, 12);
                expect(y).toBeGreaterThanOrEqual(0);
                expect(y).toBeLessThanOrEqual(1);
            }
        }
        const half = getDecisionBoundary({ algorithm: 'svm', weights: [1, 0], bias: -0.5 }, 8);
        expect(half.boundary).toHaveLength(8);
        expect(half.marginPos).toEqual([]);
        expect(half.marginNeg).toEqual([]);
    });
});
