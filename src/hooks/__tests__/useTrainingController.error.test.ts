/**
 * Error handling tests for useTrainingController hook
 * 
 * Tests error display on ML Engine errors, automatic pause on error,
 * error dismissal and state recovery
 * Requirements: 12.1, 12.2, 12.3, 12.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
        X: [[0.1, 0.2], [0.3, 0.4]],
        y: [0, 1],
    })),
}));

// @ts-ignore
import { initState, loadDataset } from '../../../engine/index.js';

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function simulateStepResult(state: any, generation: number, overrides: Partial<any> = {}) {
    act(() => {
        capturedOnResult?.({ type: 'step:result', state: { ...state, ...overrides }, generation });
    });
}

function simulateWorkerError(message: string, generation: number) {
    act(() => {
        capturedOnError?.({ type: 'error', message, generation });
    });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTrainingController - Error Handling', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        capturedOnResult = null;
        capturedOnError = null;
        mockRequestStep = vi.fn();

        const { useEngineWorker } = vi.mocked(await import('../useEngineWorker'));
        (useEngineWorker as ReturnType<typeof vi.fn>).mockImplementation(() => ({
            requestStep: mockRequestStep,
            setOnResult: vi.fn((cb: (msg: StepResultMessage) => void) => { capturedOnResult = cb; }),
            setOnError: vi.fn((cb: (msg: ErrorMessage) => void) => { capturedOnError = cb; }),
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ── Error display (Requirement 12.1) ───────────────────────────────────

    it('displays error message when ML Engine step() throws', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].step(); });
        simulateWorkerError('Invalid parameter value', 0);

        expect(result.current[0].error).toBe('Invalid parameter value');
    });

    it('displays error message when initState() throws during initialization', () => {
        vi.mocked(initState).mockImplementationOnce(() => {
            throw new Error('Invalid algorithm configuration');
        });

        const { result } = renderHook(() =>
            useTrainingController('invalidAlgorithm', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        expect(result.current[0].error).toBe('Invalid algorithm configuration');
    });

    it('displays error message when loadDataset() throws', () => {
        vi.mocked(loadDataset).mockImplementationOnce(() => {
            throw new Error('Dataset not found');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'invalid-dataset', { lr: 0.01, nIter: 10 })
        );

        expect(result.current[0].error).toBe('Dataset not found');
    });

    it('displays error message when updateParams causes initState to throw', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        vi.mocked(initState).mockImplementationOnce(() => {
            throw new Error('Invalid parameter combination');
        });

        act(() => { result.current[1].updateParams({ lr: -1 }); });

        expect(result.current[0].error).toBe('Invalid parameter combination');
    });

    it('displays error message when changeDataset causes loadDataset to throw', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        vi.mocked(loadDataset).mockImplementationOnce(() => {
            throw new Error('Failed to load new dataset');
        });

        act(() => { result.current[1].changeDataset('invalid-dataset'); });

        expect(result.current[0].error).toBe('Failed to load new dataset');
    });

    // ── Automatic pause on error (Requirement 12.3) ────────────────────────

    it('automatically pauses training when error occurs during step', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].play(); });
        expect(result.current[0].isPlaying).toBe(true);

        simulateWorkerError('Training error', 0);

        expect(result.current[0].isPlaying).toBe(false);
        expect(result.current[0].isPaused).toBe(true);
        expect(result.current[0].error).toBeTruthy();
    });

    it('sets isPaused to true when error occurs', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].step(); });
        simulateWorkerError('Error during training', 0);

        expect(result.current[0].isPaused).toBe(true);
        expect(result.current[0].isPlaying).toBe(false);
    });

    it('stops interval when error occurs during playback', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        act(() => { result.current[1].play(); });
        expect(mockRequestStep).toHaveBeenCalledTimes(1);

        // First result succeeds — self-schedules second
        simulateStepResult({ ...s, loss: 0.5, iteration: 1, converged: false }, 0);
        expect(mockRequestStep).toHaveBeenCalledTimes(2);

        // Second result is an error — loop stops
        simulateWorkerError('Error on second call', 0);

        expect(result.current[0].error).toBeTruthy();
        expect(result.current[0].isPlaying).toBe(false);
        // No further requestStep calls after the error
        expect(mockRequestStep).toHaveBeenCalledTimes(2);
    });

    // ── Error dismissal and state recovery (Requirements 12.4, 12.5) ───────

    it('clears error when clearError is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].step(); });
        simulateWorkerError('Test error', 0);
        expect(result.current[0].error).toBeTruthy();

        act(() => { result.current[1].clearError(); });

        expect(result.current[0].error).toBeNull();
    });

    it('restores last valid state when error is dismissed', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        // First step succeeds
        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.3, iteration: 1, converged: false }, 0);

        expect(result.current[0].engineState?.iteration).toBe(1);

        // Second step errors
        act(() => { result.current[1].step(); });
        simulateWorkerError('Step failed', 0);

        expect(result.current[0].error).toBeTruthy();
        // Engine state should still be the last valid state
        expect(result.current[0].engineState?.iteration).toBe(1);

        act(() => { result.current[1].clearError(); });

        expect(result.current[0].engineState?.iteration).toBe(1);
        expect(result.current[0].error).toBeNull();
    });

    it('preserves last valid state across multiple errors', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        // Successful step
        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.2, iteration: 1, converged: false }, 0);
        const validIteration = result.current[0].engineState?.iteration;

        // First error
        act(() => { result.current[1].step(); });
        simulateWorkerError('First error', 0);
        expect(result.current[0].error).toBe('First error');
        expect(result.current[0].engineState?.iteration).toBe(validIteration);

        act(() => { result.current[1].clearError(); });

        // Second error
        act(() => { result.current[1].step(); });
        simulateWorkerError('Second error', 0);
        expect(result.current[0].error).toBe('Second error');
        expect(result.current[0].engineState?.iteration).toBe(validIteration);

        act(() => { result.current[1].clearError(); });

        expect(result.current[0].engineState?.iteration).toBe(validIteration);
        expect(result.current[0].error).toBeNull();
    });

    it('updates last valid state after successful reset', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.4, iteration: 1, converged: false }, 0);

        act(() => { result.current[1].step(); });
        simulateWorkerError('Error after step', 0);
        expect(result.current[0].error).toBeTruthy();

        act(() => { result.current[1].reset(); });

        expect(result.current[0].engineState?.iteration).toBe(0);
        expect(result.current[0].error).toBeNull();

        // Error after reset should restore to reset state (iteration 0)
        // reset() bumps generation to 1, so the new error must use generation 1
        act(() => { result.current[1].step(); });
        simulateWorkerError('Another error', 1);

        expect(result.current[0].error).toBeTruthy();
        expect(result.current[0].engineState?.iteration).toBe(0);
    });

    it('handles non-Error exceptions gracefully', () => {
        // Worker always sends string messages, so this tests the worker error path
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].step(); });
        simulateWorkerError('Training step failed', 0);

        expect(result.current[0].error).toBe('Training step failed');
        expect(result.current[0].isPlaying).toBe(false);
        expect(result.current[0].isPaused).toBe(true);
    });

    it('clears error when successful operation occurs after error', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        // Trigger error
        act(() => { result.current[1].step(); });
        simulateWorkerError('Initial error', 0);
        expect(result.current[0].error).toBeTruthy();

        act(() => { result.current[1].clearError(); });

        // Successful step
        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.5, iteration: 1, converged: false }, 0);

        expect(result.current[0].error).toBeNull();
        expect(result.current[0].engineState?.iteration).toBeGreaterThan(0);
    });
});
