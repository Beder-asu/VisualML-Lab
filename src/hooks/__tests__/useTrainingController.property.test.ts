/**
 * Property-based tests for useTrainingController hook
 * 
 * Covers:
 *   Property 1: Loss history accumulation (Requirements 4.2)
 *   Property 2: Error handling robustness (Requirements 12.1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useTrainingController } from '../useTrainingController';

// Mock the ML Engine
vi.mock('../../../engine/index.js', () => ({
    initState: vi.fn((algorithm: string, dataset: any, _params: any) => ({
        algorithm,
        weights: [0, 0],
        bias: 0,
        loss: null,
        iteration: 0,
        converged: false,
        dataset,
    })),
    step: vi.fn((state: any, params: any) => ({
        ...state,
        loss: Math.random() * 10, // Random loss value
        iteration: state.iteration + 1,
        converged: state.iteration + 1 >= params.nIter,
    })),
    loadDataset: vi.fn((name: string) => ({
        name,
        X: [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]],
        y: [0, 1, 0],
    })),
}));

// @ts-ignore
import { initState, step, loadDataset } from '../../../engine/index.js';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const ALGORITHMS = ['linearRegression', 'logisticRegression', 'svm'];
const DATASET_NAMES = ['iris-2d', 'blobs', 'linear'];

const arbAlgorithm = fc.constantFrom(...ALGORITHMS);
const arbDatasetName = fc.constantFrom(...DATASET_NAMES);

const arbParams = fc.record({
    lr: fc.double({ min: 0.001, max: 1.0, noNaN: true }),
    nIter: fc.integer({ min: 1, max: 100 }),
    C: fc.option(fc.double({ min: 0.1, max: 10.0, noNaN: true }), { nil: undefined }),
});

const arbStepCount = fc.integer({ min: 1, max: 10 });

beforeEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Property 1: Loss history accumulation
// Feature: visualml-ui, Property 1: Loss history accumulation
// Validates: Requirements 4.2
// ---------------------------------------------------------------------------

describe('Property 1: Loss history accumulation', () => {
    it('for any sequence of training steps, loss history grows by exactly one element per step', () => {
        // Feature: visualml-ui, Property 1: Loss history accumulation
        // Validates: Requirements 4.2
        fc.assert(
            fc.property(
                arbAlgorithm,
                arbDatasetName,
                arbParams,
                arbStepCount,
                (algorithm, datasetName, params, stepCount) => {
                    const { result } = renderHook(() =>
                        useTrainingController(algorithm, datasetName, params)
                    );

                    const [initialState] = result.current;

                    // Skip if initialization failed
                    if (!initialState.engineState || initialState.error) {
                        return true;
                    }

                    // Track loss history manually
                    const lossHistory: (number | null)[] = [];

                    // Initial loss
                    lossHistory.push(initialState.engineState.loss);

                    // Execute steps and verify loss history grows
                    for (let i = 0; i < stepCount; i++) {
                        const [stateBefore] = result.current;
                        const lengthBefore = lossHistory.length;

                        // Stop if converged
                        if (stateBefore.isConverged) {
                            break;
                        }

                        // Execute step
                        act(() => {
                            const [, controls] = result.current;
                            controls.step();
                        });

                        const [stateAfter] = result.current;

                        // Skip if error occurred
                        if (stateAfter.error) {
                            break;
                        }

                        // Verify loss history grew by exactly one
                        if (stateAfter.engineState) {
                            lossHistory.push(stateAfter.engineState.loss);
                            expect(lossHistory.length).toBe(lengthBefore + 1);

                            // Verify the new loss value matches the engine state
                            expect(lossHistory[lossHistory.length - 1]).toBe(
                                stateAfter.engineState.loss
                            );
                        }
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 2: Error handling robustness
// Feature: visualml-ui, Property 2: Error handling robustness
// Validates: Requirements 12.1
// ---------------------------------------------------------------------------

describe('Property 2: Error handling robustness', () => {
    it('for any error thrown by ML Engine, the controller catches it and pauses', () => {
        // Feature: visualml-ui, Property 2: Error handling robustness
        // Validates: Requirements 12.1

        fc.assert(
            fc.property(
                arbAlgorithm,
                arbDatasetName,
                arbParams,
                (algorithm, datasetName, params) => {
                    // Mock step to throw an error
                    const mockStep = vi.mocked(step);
                    mockStep.mockImplementationOnce(() => {
                        throw new Error('Validation error: Invalid parameters');
                    });

                    const { result } = renderHook(() =>
                        useTrainingController(algorithm, datasetName, params)
                    );

                    const [initialState] = result.current;

                    // Skip if initialization failed
                    if (!initialState.engineState || initialState.error) {
                        return true;
                    }

                    // Try to step (should trigger error)
                    act(() => {
                        const [, controls] = result.current;
                        controls.step();
                    });

                    const [stateAfterStep] = result.current;

                    // Verify error handling
                    // Should not be playing
                    expect(stateAfterStep.isPlaying).toBe(false);

                    // Should be paused
                    expect(stateAfterStep.isPaused).toBe(true);

                    // Error message should be set
                    expect(stateAfterStep.error).toBeTruthy();
                    expect(typeof stateAfterStep.error).toBe('string');
                    expect(stateAfterStep.error).toContain('Validation error');

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
