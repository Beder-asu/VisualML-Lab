/**
 * Property-based and unit tests for engine/state.js
 *
 * Covers:
 *   Property 4: initState produces a zeroed state (Requirements 2.1)
 *   Property 8: prettyPrintState produces valid JSON containing all fields (Requirements 5.3)
 *   Unit tests: initState error cases (Requirements 2.2, 2.3)
 */

import fc from 'fast-check';
import { initState, prettyPrintState } from '../state.js';
import { loadDataset } from '../datasets.js';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const ALGORITHMS = ['linearRegression', 'logisticRegression', 'svm'];
const DATASET_NAMES = ['iris-2d', 'blobs', 'linear'];

const arbAlgorithm = fc.constantFrom(...ALGORITHMS);
const arbDatasetName = fc.constantFrom(...DATASET_NAMES);

// ---------------------------------------------------------------------------
// Property 4: initState produces a zeroed state
// Feature: ml-engine, Property 4: initState produces a zeroed state
// Validates: Requirements 2.1
// ---------------------------------------------------------------------------

describe('Property 4: initState produces a zeroed state', () => {
    it('for any valid algorithm and dataset, initState returns zeroed weights, bias=0, loss=null, iteration=0, converged=false', () => {
        // Feature: ml-engine, Property 4: initState produces a zeroed state
        // Validates: Requirements 2.1
        fc.assert(
            fc.property(arbAlgorithm, arbDatasetName, (algorithm, datasetName) => {
                const dataset = loadDataset(datasetName);
                const state = initState(algorithm, dataset, {});

                // All weights must be zero
                expect(state.weights).toHaveLength(dataset.X[0].length);
                state.weights.forEach(w => expect(w).toBe(0));

                expect(state.bias).toBe(0);
                expect(state.loss).toBeNull();
                expect(state.iteration).toBe(0);
                expect(state.converged).toBe(false);
                expect(state.algorithm).toBe(algorithm);
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 8: prettyPrintState produces valid JSON containing all fields
// Feature: ml-engine, Property 8: prettyPrintState produces valid JSON containing all fields
// Validates: Requirements 5.3
// ---------------------------------------------------------------------------

describe('Property 8: prettyPrintState produces valid JSON containing all fields', () => {
    it('for any valid state, prettyPrintState returns a string that parses as valid JSON with all required fields', () => {
        // Feature: ml-engine, Property 8: prettyPrintState produces valid JSON containing all fields
        // Validates: Requirements 5.3
        fc.assert(
            fc.property(arbAlgorithm, arbDatasetName, (algorithm, datasetName) => {
                const dataset = loadDataset(datasetName);
                const state = initState(algorithm, dataset, {});

                const printed = prettyPrintState(state);

                // Must be a string
                expect(typeof printed).toBe('string');

                // Must parse as valid JSON
                let parsed;
                expect(() => { parsed = JSON.parse(printed); }).not.toThrow();

                // Must contain all required top-level state fields
                expect(parsed).toHaveProperty('algorithm');
                expect(parsed).toHaveProperty('weights');
                expect(parsed).toHaveProperty('bias');
                expect(parsed).toHaveProperty('loss');
                expect(parsed).toHaveProperty('iteration');
                expect(parsed).toHaveProperty('converged');
            }),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Unit tests: initState error cases
// Requirements: 2.2, 2.3
// ---------------------------------------------------------------------------

describe('initState — error cases', () => {
    it('throws a descriptive error for an unknown algorithm (Req 2.2)', () => {
        const dataset = loadDataset('iris-2d');
        expect(() => initState('neuralNetwork', dataset, {})).toThrow(
            "Unsupported algorithm: 'neuralNetwork'. Supported: linearRegression, logisticRegression, svm"
        );
    });

    it('throws a descriptive error for an unknown dataset name (Req 2.3)', () => {
        expect(() => initState('linearRegression', 'unknown-dataset', {})).toThrow(
            "Unsupported dataset: 'unknown-dataset'. Supported: iris-2d, blobs, linear"
        );
    });
});
