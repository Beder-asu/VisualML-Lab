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
                const points = Array.isArray(res) ? res : res.boundary;

                expect(Array.isArray(points)).toBe(true);
                expect(points.length).toBe(gridSize);

                for (const pt of points) {
                    expect(typeof pt.x).toBe('number');
                    expect(typeof pt.y).toBe('number');
                    expect(pt.x).toBeGreaterThanOrEqual(0);
                    expect(pt.x).toBeLessThanOrEqual(1);
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
                const points = Array.isArray(res) ? res : res.boundary;

                expect(Array.isArray(points)).toBe(true);
                expect(points.length).toBe(gridSize);

                for (const pt of points) {
                    expect(typeof pt.x).toBe('number');
                    expect(typeof pt.y).toBe('number');
                    expect(pt.x).toBeGreaterThanOrEqual(0);
                    expect(pt.x).toBeLessThanOrEqual(1);
                }
            }),
            { numRuns: 100 }
        );
    });
});
