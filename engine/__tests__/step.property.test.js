/**
 * Property-based tests for step functions across all algorithms.
 *
 * Covers:
 *   Property 1: Step advances state correctly — Requirements 1.1, 1.2, 1.3
 *   Property 2: Step is non-mutating — Requirements 1.4
 *   Property 3: Converged state is a fixed point — Requirements 1.5
 */

import fc from 'fast-check';
import { initState } from '../state.js';
import { loadDataset } from '../datasets.js';
import stepLinearRegression from '../algorithms/linearRegression.js';
import stepLogisticRegression from '../algorithms/logisticRegression.js';
import stepSVM from '../algorithms/svm.js';

// ---------------------------------------------------------------------------
// Shared param factory
// ---------------------------------------------------------------------------

/**
 * Returns an fc.record for valid params for the given algorithm.
 * SVM includes C; linear and logistic do not.
 */
function makeArbParams(algorithm) {
    const base = {
        lr: fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
        nIter: fc.integer({ min: 1, max: 1000 }),
    };
    if (algorithm === 'svm') {
        return fc.record({ ...base, C: fc.float({ min: Math.fround(0.01), max: Math.fround(10.0), noNaN: true }) });
    }
    return fc.record(base);
}

// ---------------------------------------------------------------------------
// Shared arbitrary builders
// ---------------------------------------------------------------------------

function makeArbNonConvergedState(algorithm, dataset) {
    return makeArbParams(algorithm).chain(params =>
        fc.record({
            iteration: fc.integer({ min: 0, max: params.nIter - 1 }),
        }).map(({ iteration }) => {
            const base = initState(algorithm, loadDataset(dataset), params);
            return { state: { ...base, iteration }, params };
        })
    );
}

function makeArbConvergedState(algorithm, dataset) {
    return makeArbParams(algorithm).chain(params =>
        fc.record({
            extra: fc.integer({ min: 0, max: 100 }),
        }).map(({ extra }) => {
            const base = initState(algorithm, loadDataset(dataset), params);
            return { state: { ...base, iteration: params.nIter + extra }, params };
        })
    );
}

// ---------------------------------------------------------------------------
// Shared test runner
// ---------------------------------------------------------------------------

/**
 * Registers the 3 standard step property describe-blocks for one algorithm.
 *
 * @param {string} algorithmName  - display name used in describe labels
 * @param {Function} stepFn       - the step function under test
 * @param arbNonConvergedState    - fc arbitrary producing { state, params } where iteration < nIter
 * @param arbConvergedState       - fc arbitrary producing { state, params } where iteration >= nIter
 */
function runStepProperties(algorithmName, stepFn, arbNonConvergedState, arbConvergedState) {
    // -----------------------------------------------------------------------
    // Property 1: Step advances state correctly
    // Feature: ml-engine, Property 1: Step advances state correctly
    // -----------------------------------------------------------------------
    describe(`Property 1: Step advances state correctly (${algorithmName})`, () => {
        it('for any valid non-converged state and params, step returns a state with incremented iteration, finite loss, same-length weights, and finite bias', () => {
            // Feature: ml-engine, Property 1: Step advances state correctly
            // Validates: Requirements 1.1, 1.2, 1.3
            fc.assert(
                fc.property(arbNonConvergedState, ({ state, params }) => {
                    const next = stepFn(state, params);

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

    // -----------------------------------------------------------------------
    // Property 2: Step is non-mutating
    // Feature: ml-engine, Property 2: Step is non-mutating
    // -----------------------------------------------------------------------
    describe(`Property 2: Step is non-mutating (${algorithmName})`, () => {
        it('for any valid state and params, calling step does not mutate the original state', () => {
            // Feature: ml-engine, Property 2: Step is non-mutating
            // Validates: Requirements 1.4
            fc.assert(
                fc.property(arbNonConvergedState, ({ state, params }) => {
                    const originalWeights = [...state.weights];
                    const originalBias = state.bias;
                    const originalLoss = state.loss;
                    const originalIteration = state.iteration;

                    stepFn(state, params);

                    expect(state.weights).toEqual(originalWeights);
                    expect(state.bias).toBe(originalBias);
                    expect(state.loss).toBe(originalLoss);
                    expect(state.iteration).toBe(originalIteration);
                }),
                { numRuns: 100 }
            );
        });
    });

    // -----------------------------------------------------------------------
    // Property 3: Converged state is a fixed point
    // Feature: ml-engine, Property 3: Converged state is a fixed point
    // -----------------------------------------------------------------------
    describe(`Property 3: Converged state is a fixed point (${algorithmName})`, () => {
        it('for any state where iteration >= nIter, step returns converged: true with unchanged weights, bias, loss, and iteration', () => {
            // Feature: ml-engine, Property 3: Converged state is a fixed point
            // Validates: Requirements 1.5
            fc.assert(
                fc.property(arbConvergedState, ({ state, params }) => {
                    const next = stepFn(state, params);

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
}

// ---------------------------------------------------------------------------
// Run properties for each algorithm
// ---------------------------------------------------------------------------

runStepProperties(
    'linearRegression',
    stepLinearRegression,
    makeArbNonConvergedState('linearRegression', 'linear'),
    makeArbConvergedState('linearRegression', 'linear')
);

runStepProperties(
    'logisticRegression',
    stepLogisticRegression,
    makeArbNonConvergedState('logisticRegression', 'blobs'),
    makeArbConvergedState('logisticRegression', 'blobs')
);

runStepProperties(
    'svm',
    stepSVM,
    makeArbNonConvergedState('svm', 'blobs'),
    makeArbConvergedState('svm', 'blobs')
);
