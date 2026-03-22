/**
 * Property-based tests for the Linear Regression step function.
 *
 * Covers:
 *   Property 1: Step advances state correctly (for linearRegression) — Requirements 1.1
 *   Property 2: Step is non-mutating (for linearRegression) — Requirements 1.4
 *   Property 3: Converged state is a fixed point (for linearRegression) — Requirements 1.5
 */

import fc from 'fast-check';
import { initState } from '../state.js';
import { loadDataset } from '../datasets.js';
import stepLinearRegression from '../algorithms/linearRegression.js';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

// Valid params for linear regression: lr in (0, 1], nIter in [1, 1000]
const arbLinearParams = fc.record({
    lr: fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
    nIter: fc.integer({ min: 1, max: 1000 }),
});

// A non-converged state: iteration is strictly less than nIter
const arbNonConvergedState = arbLinearParams.chain(params =>
    fc.record({
        iteration: fc.integer({ min: 0, max: params.nIter - 1 }),
    }).map(({ iteration }) => {
        const dataset = loadDataset('linear');
        const base = initState('linearRegression', dataset, params);
        // Assign a random iteration that is still < nIter
        return { state: { ...base, iteration }, params };
    })
);

// A converged state: iteration >= nIter
const arbConvergedState = arbLinearParams.chain(params =>
    fc.record({
        extra: fc.integer({ min: 0, max: 100 }),
    }).map(({ extra }) => {
        const dataset = loadDataset('linear');
        const base = initState('linearRegression', dataset, params);
        return { state: { ...base, iteration: params.nIter + extra }, params };
    })
);

// ---------------------------------------------------------------------------
// Property 1: Step advances state correctly (linearRegression)
// Feature: ml-engine, Property 1: Step advances state correctly
// Validates: Requirements 1.1
// ---------------------------------------------------------------------------

describe('Property 1: Step advances state correctly (linearRegression)', () => {
    it('for any valid non-converged state and params, step returns a state with incremented iteration, finite loss, same-length weights, and finite bias', () => {
        // Feature: ml-engine, Property 1: Step advances state correctly
        // Validates: Requirements 1.1
        fc.assert(
            fc.property(arbNonConvergedState, ({ state, params }) => {
                const next = stepLinearRegression(state, params);

                // iteration incremented by 1
                expect(next.iteration).toBe(state.iteration + 1);

                // loss is a finite number
                expect(typeof next.loss).toBe('number');
                expect(isFinite(next.loss)).toBe(true);

                // weights array has same length
                expect(next.weights).toHaveLength(state.weights.length);

                // bias is finite
                expect(isFinite(next.bias)).toBe(true);
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 2: Step is non-mutating (linearRegression)
// Feature: ml-engine, Property 2: Step is non-mutating
// Validates: Requirements 1.4
// ---------------------------------------------------------------------------

describe('Property 2: Step is non-mutating (linearRegression)', () => {
    it('for any valid state and params, calling step does not mutate the original state', () => {
        // Feature: ml-engine, Property 2: Step is non-mutating
        // Validates: Requirements 1.4
        fc.assert(
            fc.property(arbNonConvergedState, ({ state, params }) => {
                const originalWeights = [...state.weights];
                const originalBias = state.bias;
                const originalLoss = state.loss;
                const originalIteration = state.iteration;

                stepLinearRegression(state, params);

                // Original state fields must be unchanged
                expect(state.weights).toEqual(originalWeights);
                expect(state.bias).toBe(originalBias);
                expect(state.loss).toBe(originalLoss);
                expect(state.iteration).toBe(originalIteration);
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 3: Converged state is a fixed point (linearRegression)
// Feature: ml-engine, Property 3: Converged state is a fixed point
// Validates: Requirements 1.5
// ---------------------------------------------------------------------------

describe('Property 3: Converged state is a fixed point (linearRegression)', () => {
    it('for any state where iteration >= nIter, step returns converged: true with unchanged weights, bias, loss, and iteration', () => {
        // Feature: ml-engine, Property 3: Converged state is a fixed point
        // Validates: Requirements 1.5
        fc.assert(
            fc.property(arbConvergedState, ({ state, params }) => {
                const next = stepLinearRegression(state, params);

                expect(next.converged).toBe(true);
                expect(next.weights).toEqual(state.weights);
                expect(next.bias).toBe(state.bias);
                expect(next.loss).toBe(state.loss);
                expect(next.iteration).toBe(state.iteration);
            }),
            { numRuns: 100 }
        );
    });
});

// ===========================================================================
// Logistic Regression — Properties 1, 2, 3
// ===========================================================================

import stepLogisticRegression from '../algorithms/logisticRegression.js';

// Valid params for logistic regression: lr in (0, 1], nIter in [1, 1000]
const arbLogisticParams = fc.record({
    lr: fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
    nIter: fc.integer({ min: 1, max: 1000 }),
});

// A non-converged logistic state: iteration < nIter
const arbNonConvergedLogisticState = arbLogisticParams.chain(params =>
    fc.record({
        iteration: fc.integer({ min: 0, max: params.nIter - 1 }),
    }).map(({ iteration }) => {
        const dataset = loadDataset('blobs');
        const base = initState('logisticRegression', dataset, params);
        return { state: { ...base, iteration }, params };
    })
);

// A converged logistic state: iteration >= nIter
const arbConvergedLogisticState = arbLogisticParams.chain(params =>
    fc.record({
        extra: fc.integer({ min: 0, max: 100 }),
    }).map(({ extra }) => {
        const dataset = loadDataset('blobs');
        const base = initState('logisticRegression', dataset, params);
        return { state: { ...base, iteration: params.nIter + extra }, params };
    })
);

// ---------------------------------------------------------------------------
// Property 1: Step advances state correctly (logisticRegression)
// Feature: ml-engine, Property 1: Step advances state correctly
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------

describe('Property 1: Step advances state correctly (logisticRegression)', () => {
    it('for any valid non-converged state and params, step returns a state with incremented iteration, finite loss, same-length weights, and finite bias', () => {
        // Feature: ml-engine, Property 1: Step advances state correctly
        // Validates: Requirements 1.2
        fc.assert(
            fc.property(arbNonConvergedLogisticState, ({ state, params }) => {
                const next = stepLogisticRegression(state, params);

                expect(next.iteration).toBe(state.iteration + 1);
                expect(typeof next.loss).toBe('number');
                expect(isFinite(next.loss)).toBe(true);
                expect(next.weights).toHaveLength(state.weights.length);
                expect(isFinite(next.bias)).toBe(true);
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 2: Step is non-mutating (logisticRegression)
// Feature: ml-engine, Property 2: Step is non-mutating
// Validates: Requirements 1.4
// ---------------------------------------------------------------------------

describe('Property 2: Step is non-mutating (logisticRegression)', () => {
    it('for any valid state and params, calling step does not mutate the original state', () => {
        // Feature: ml-engine, Property 2: Step is non-mutating
        // Validates: Requirements 1.4
        fc.assert(
            fc.property(arbNonConvergedLogisticState, ({ state, params }) => {
                const originalWeights = [...state.weights];
                const originalBias = state.bias;
                const originalLoss = state.loss;
                const originalIteration = state.iteration;

                stepLogisticRegression(state, params);

                expect(state.weights).toEqual(originalWeights);
                expect(state.bias).toBe(originalBias);
                expect(state.loss).toBe(originalLoss);
                expect(state.iteration).toBe(originalIteration);
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 3: Converged state is a fixed point (logisticRegression)
// Feature: ml-engine, Property 3: Converged state is a fixed point
// Validates: Requirements 1.5
// ---------------------------------------------------------------------------

describe('Property 3: Converged state is a fixed point (logisticRegression)', () => {
    it('for any state where iteration >= nIter, step returns converged: true with unchanged weights, bias, loss, and iteration', () => {
        // Feature: ml-engine, Property 3: Converged state is a fixed point
        // Validates: Requirements 1.5
        fc.assert(
            fc.property(arbConvergedLogisticState, ({ state, params }) => {
                const next = stepLogisticRegression(state, params);

                expect(next.converged).toBe(true);
                expect(next.weights).toEqual(state.weights);
                expect(next.bias).toBe(state.bias);
                expect(next.loss).toBe(state.loss);
                expect(next.iteration).toBe(state.iteration);
            }),
            { numRuns: 100 }
        );
    });
});

// ===========================================================================
// SVM — Properties 1, 2, 3
// ===========================================================================

import stepSVM from '../algorithms/svm.js';

// Valid params for SVM: lr in (0, 1], nIter in [1, 1000], C in (0, 10]
const arbSVMParams = fc.record({
    lr: fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
    nIter: fc.integer({ min: 1, max: 1000 }),
    C: fc.float({ min: Math.fround(0.01), max: Math.fround(10.0), noNaN: true }),
});

// A non-converged SVM state: iteration < nIter
const arbNonConvergedSVMState = arbSVMParams.chain(params =>
    fc.record({
        iteration: fc.integer({ min: 0, max: params.nIter - 1 }),
    }).map(({ iteration }) => {
        const dataset = loadDataset('blobs');
        const base = initState('svm', dataset, params);
        return { state: { ...base, iteration }, params };
    })
);

// A converged SVM state: iteration >= nIter
const arbConvergedSVMState = arbSVMParams.chain(params =>
    fc.record({
        extra: fc.integer({ min: 0, max: 100 }),
    }).map(({ extra }) => {
        const dataset = loadDataset('blobs');
        const base = initState('svm', dataset, params);
        return { state: { ...base, iteration: params.nIter + extra }, params };
    })
);

// ---------------------------------------------------------------------------
// Property 1: Step advances state correctly (svm)
// Feature: ml-engine, Property 1: Step advances state correctly
// Validates: Requirements 1.3
// ---------------------------------------------------------------------------

describe('Property 1: Step advances state correctly (svm)', () => {
    it('for any valid non-converged state and params, step returns a state with incremented iteration, finite loss, same-length weights, and finite bias', () => {
        // Feature: ml-engine, Property 1: Step advances state correctly
        // Validates: Requirements 1.3
        fc.assert(
            fc.property(arbNonConvergedSVMState, ({ state, params }) => {
                const next = stepSVM(state, params);

                expect(next.iteration).toBe(state.iteration + 1);
                expect(typeof next.loss).toBe('number');
                expect(isFinite(next.loss)).toBe(true);
                expect(next.weights).toHaveLength(state.weights.length);
                expect(isFinite(next.bias)).toBe(true);
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 2: Step is non-mutating (svm)
// Feature: ml-engine, Property 2: Step is non-mutating
// Validates: Requirements 1.4
// ---------------------------------------------------------------------------

describe('Property 2: Step is non-mutating (svm)', () => {
    it('for any valid state and params, calling step does not mutate the original state', () => {
        // Feature: ml-engine, Property 2: Step is non-mutating
        // Validates: Requirements 1.4
        fc.assert(
            fc.property(arbNonConvergedSVMState, ({ state, params }) => {
                const originalWeights = [...state.weights];
                const originalBias = state.bias;
                const originalLoss = state.loss;
                const originalIteration = state.iteration;

                stepSVM(state, params);

                expect(state.weights).toEqual(originalWeights);
                expect(state.bias).toBe(originalBias);
                expect(state.loss).toBe(originalLoss);
                expect(state.iteration).toBe(originalIteration);
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 3: Converged state is a fixed point (svm)
// Feature: ml-engine, Property 3: Converged state is a fixed point
// Validates: Requirements 1.5
// ---------------------------------------------------------------------------

describe('Property 3: Converged state is a fixed point (svm)', () => {
    it('for any state where iteration >= nIter, step returns converged: true with unchanged weights, bias, loss, and iteration', () => {
        // Feature: ml-engine, Property 3: Converged state is a fixed point
        // Validates: Requirements 1.5
        fc.assert(
            fc.property(arbConvergedSVMState, ({ state, params }) => {
                const next = stepSVM(state, params);

                expect(next.converged).toBe(true);
                expect(next.weights).toEqual(state.weights);
                expect(next.bias).toBe(state.bias);
                expect(next.loss).toBe(state.loss);
                expect(next.iteration).toBe(state.iteration);
            }),
            { numRuns: 100 }
        );
    });
});
