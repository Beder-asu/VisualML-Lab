/**
 * Property-based tests for state serialization round trip.
 *
 * Covers:
 *   Property 7: State serialization round trip — Requirements 5.1, 5.2
 *
 * For any algorithm, valid state s, and valid params,
 * step(JSON.parse(JSON.stringify(s)), params) SHALL produce a state with the
 * same weights, bias, loss, and iteration as step(s, params).
 */

import fc from 'fast-check';
import { initState } from '../state.js';
import { loadDataset } from '../datasets.js';
import { step } from '../index.js';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbLinearParams = fc.record({
    lr: fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
    nIter: fc.integer({ min: 2, max: 1000 }),
});

const arbLogisticParams = fc.record({
    lr: fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
    nIter: fc.integer({ min: 2, max: 1000 }),
});

const arbSVMParams = fc.record({
    lr: fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
    nIter: fc.integer({ min: 2, max: 1000 }),
    C: fc.float({ min: Math.fround(0.01), max: Math.fround(10.0), noNaN: true }),
});

/**
 * Build a non-converged state for the given algorithm/dataset/params,
 * optionally with a random iteration so weights may be non-zero.
 */
function makeState(algorithm, datasetName, params, iteration = 0) {
    const dataset = loadDataset(datasetName);
    const base = initState(algorithm, dataset, params);
    return { ...base, iteration };
}

// ---------------------------------------------------------------------------
// Property 7: State serialization round trip
// Feature: ml-engine, Property 7: State serialization round trip
// Validates: Requirements 5.1, 5.2
// ---------------------------------------------------------------------------

describe('Property 7: State serialization round trip', () => {
    it('linearRegression — step(JSON.parse(JSON.stringify(s)), params) equals step(s, params)', () => {
        // Feature: ml-engine, Property 7: State serialization round trip
        // Validates: Requirements 5.1, 5.2
        fc.assert(
            fc.property(
                arbLinearParams,
                fc.integer({ min: 0, max: 498 }),
                (params, iteration) => {
                    const s = makeState('linearRegression', 'linear', params, iteration);
                    // Ensure not converged so step actually computes
                    if (s.iteration >= params.nIter) return;

                    const direct = step(s, params);
                    const roundTripped = step(JSON.parse(JSON.stringify(s)), params);

                    expect(roundTripped.weights).toHaveLength(direct.weights.length);
                    direct.weights.forEach((w, i) =>
                        expect(roundTripped.weights[i]).toBeCloseTo(w, 10)
                    );
                    expect(roundTripped.bias).toBeCloseTo(direct.bias, 10);
                    expect(roundTripped.loss).toBeCloseTo(direct.loss, 10);
                    expect(roundTripped.iteration).toBe(direct.iteration);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('logisticRegression — step(JSON.parse(JSON.stringify(s)), params) equals step(s, params)', () => {
        // Feature: ml-engine, Property 7: State serialization round trip
        // Validates: Requirements 5.1, 5.2
        fc.assert(
            fc.property(
                arbLogisticParams,
                fc.integer({ min: 0, max: 498 }),
                (params, iteration) => {
                    const s = makeState('logisticRegression', 'blobs', params, iteration);
                    if (s.iteration >= params.nIter) return;

                    const direct = step(s, params);
                    const roundTripped = step(JSON.parse(JSON.stringify(s)), params);

                    expect(roundTripped.weights).toHaveLength(direct.weights.length);
                    direct.weights.forEach((w, i) =>
                        expect(roundTripped.weights[i]).toBeCloseTo(w, 10)
                    );
                    expect(roundTripped.bias).toBeCloseTo(direct.bias, 10);
                    expect(roundTripped.loss).toBeCloseTo(direct.loss, 10);
                    expect(roundTripped.iteration).toBe(direct.iteration);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('svm — step(JSON.parse(JSON.stringify(s)), params) equals step(s, params)', () => {
        // Feature: ml-engine, Property 7: State serialization round trip
        // Validates: Requirements 5.1, 5.2
        fc.assert(
            fc.property(
                arbSVMParams,
                fc.integer({ min: 0, max: 498 }),
                (params, iteration) => {
                    const s = makeState('svm', 'blobs', params, iteration);
                    if (s.iteration >= params.nIter) return;

                    const direct = step(s, params);
                    const roundTripped = step(JSON.parse(JSON.stringify(s)), params);

                    expect(roundTripped.weights).toHaveLength(direct.weights.length);
                    direct.weights.forEach((w, i) =>
                        expect(roundTripped.weights[i]).toBeCloseTo(w, 10)
                    );
                    expect(roundTripped.bias).toBeCloseTo(direct.bias, 10);
                    expect(roundTripped.loss).toBeCloseTo(direct.loss, 10);
                    expect(roundTripped.iteration).toBe(direct.iteration);
                }
            ),
            { numRuns: 100 }
        );
    });
});
