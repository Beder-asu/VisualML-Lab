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
import type { StepResultMessage, ErrorMessage } from '../../types/worker';

// ── Mock ML Engine ────────────────────────────────────────────────────────────
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
    loadDataset: vi.fn((name: string) => ({
        name,
        X: [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]],
        y: [0, 1, 0],
    })),
}));

// ── Mock useEngineWorker ──────────────────────────────────────────────────────
let capturedOnResult: ((msg: StepResultMessage) => void) | null = null;
let capturedOnError: ((msg: ErrorMessage) => void) | null = null;
let mockRequestStep: ReturnType<typeof vi.fn>;

vi.mock('../useEngineWorker', () => ({
    useEngineWorker: vi.fn(() => ({
        requestStep: mockRequestStep,
        setOnResult: vi.fn((cb: (msg: StepResultMessage) => void) => {
            capturedOnResult = cb;
        }),
        setOnError: vi.fn((cb: (msg: ErrorMessage) => void) => {
            capturedOnError = cb;
        }),
    })),
}));

// ── Arbitraries ───────────────────────────────────────────────────────────────

const ALGORITHMS = ['linearRegression', 'logisticRegression', 'svm'];
const DATASET_NAMES = ['iris-2d', 'blobs', 'linear'];

const arbAlgorithm = fc.constantFrom(...ALGORITHMS);
const arbDatasetName = fc.constantFrom(...DATASET_NAMES);

const arbParams = fc.record({
    lr: fc.double({ min: 0.001, max: 1.0, noNaN: true }),
    nIter: fc.integer({ min: 5, max: 100 }),
});

const arbStepCount = fc.integer({ min: 1, max: 10 });
const arbLoss = fc.double({ min: 0.001, max: 10.0, noNaN: true });

beforeEach(async () => {
    vi.clearAllMocks();
    capturedOnResult = null;
    capturedOnError = null;
    mockRequestStep = vi.fn();

    const { useEngineWorker } = vi.mocked(
        await import('../useEngineWorker')
    );
    (useEngineWorker as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        requestStep: mockRequestStep,
        setOnResult: vi.fn((cb: (msg: StepResultMessage) => void) => {
            capturedOnResult = cb;
        }),
        setOnError: vi.fn((cb: (msg: ErrorMessage) => void) => {
            capturedOnError = cb;
        }),
    }));
});

// ── Property 1: Loss history accumulation ────────────────────────────────────
// Feature: visualml-ui, Property 1: Loss history accumulation
// Validates: Requirements 4.2

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
                fc.array(arbLoss, { minLength: 10, maxLength: 10 }),
                (algorithm, datasetName, params, stepCount, losses) => {
                    const { result } = renderHook(() =>
                        useTrainingController(algorithm, datasetName, params, 0)
                    );

                    const [initialState] = result.current;
                    if (!initialState.engineState || initialState.error) return true;

                    const baseState = initialState.engineState;

                    for (let i = 0; i < stepCount; i++) {
                        const lengthBefore = result.current[0].lossHistory.length;

                        if (result.current[0].isConverged) break;

                        act(() => { result.current[1].step(); });

                        const loss = losses[i % losses.length];
                        act(() => {
                            capturedOnResult?.({
                                type: 'step:result',
                                state: { ...baseState, loss, iteration: i + 1, converged: false },
                                generation: 0,
                            });
                        });

                        if (result.current[0].error) break;

                        expect(result.current[0].lossHistory.length).toBe(lengthBefore + 1);
                        expect(result.current[0].lossHistory[result.current[0].lossHistory.length - 1]).toBe(loss);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ── Property 2: Error handling robustness ────────────────────────────────────
// Feature: visualml-ui, Property 2: Error handling robustness
// Validates: Requirements 12.1

describe('Property 2: Error handling robustness', () => {
    it('for any error from the worker, the controller catches it and pauses', () => {
        // Feature: visualml-ui, Property 2: Error handling robustness
        // Validates: Requirements 12.1
        fc.assert(
            fc.property(
                arbAlgorithm,
                arbDatasetName,
                arbParams,
                fc.string({ minLength: 1 }),
                (algorithm, datasetName, params, errorMessage) => {
                    const { result } = renderHook(() =>
                        useTrainingController(algorithm, datasetName, params, 0)
                    );

                    const [initialState] = result.current;
                    if (!initialState.engineState || initialState.error) return true;

                    act(() => { result.current[1].step(); });

                    act(() => {
                        capturedOnError?.({ type: 'error', message: errorMessage, generation: 0 });
                    });

                    expect(result.current[0].isPlaying).toBe(false);
                    expect(result.current[0].isPaused).toBe(true);
                    expect(result.current[0].error).toBe(errorMessage);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
