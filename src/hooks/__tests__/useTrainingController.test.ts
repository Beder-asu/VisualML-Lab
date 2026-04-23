/**
 * Unit tests for useTrainingController hook
 * 
 * Tests play/pause/step/reset state transitions, convergence detection, and error state management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.3
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
// We capture the callbacks so tests can simulate worker responses.
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

/** Simulate the worker returning a successful step result */
function simulateStepResult(
    state: any,
    generation: number,
    overrides: Partial<any> = {}
) {
    act(() => {
        capturedOnResult?.({
            type: 'step:result',
            state: { ...state, ...overrides },
            generation,
        });
    });
}

/** Simulate the worker returning an error */
function simulateWorkerError(message: string, generation: number) {
    act(() => {
        capturedOnError?.({ type: 'error', message, generation });
    });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTrainingController', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        capturedOnResult = null;
        capturedOnError = null;
        mockRequestStep = vi.fn();

        // Re-apply the mock so each test gets fresh captured callbacks
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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ── Initialization ──────────────────────────────────────────────────────

    it('initializes with correct default state', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const [state] = result.current;
        expect(state.engineState).toBeTruthy();
        expect(state.lossHistory).toEqual([]);
        expect(state.isPlaying).toBe(false);
        expect(state.isPaused).toBe(false);
        expect(state.isConverged).toBe(false);
        expect(state.error).toBeNull();
    });

    it('handles initialization errors gracefully', () => {
        vi.mocked(initState).mockImplementationOnce(() => {
            throw new Error('Invalid algorithm');
        });

        const { result } = renderHook(() =>
            useTrainingController('invalidAlgorithm', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const [state] = result.current;
        expect(state.engineState).toBeNull();
        expect(state.error).toContain('Invalid algorithm');
    });

    // ── Play / Pause (Requirements 1.1, 1.2) ───────────────────────────────

    it('transitions to playing when play is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => { result.current[1].play(); });

        expect(result.current[0].isPlaying).toBe(true);
        expect(result.current[0].isPaused).toBe(false);
    });

    it('posts a step request when play is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].play(); });

        expect(mockRequestStep).toHaveBeenCalledTimes(1);
    });

    it('transitions to paused when pause is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => { result.current[1].play(); });
        act(() => { result.current[1].pause(); });

        expect(result.current[0].isPlaying).toBe(false);
        expect(result.current[0].isPaused).toBe(true);
    });

    // ── Step result handling ────────────────────────────────────────────────

    it('updates engineState when worker returns a result', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });

        simulateStepResult(
            { ...initialState, loss: 0.5, iteration: 1, converged: false },
            0 // generation 0
        );

        expect(result.current[0].engineState?.iteration).toBe(1);
        expect(result.current[0].engineState?.loss).toBe(0.5);
    });

    it('appends loss to history when worker returns a result', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });

        simulateStepResult({ ...initialState, loss: 0.42, iteration: 1, converged: false }, 0);

        expect(result.current[0].lossHistory).toEqual([0.42]);
    });

    it('self-schedules next step when playing and not converged', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });
        expect(mockRequestStep).toHaveBeenCalledTimes(1);

        simulateStepResult({ ...initialState, loss: 0.5, iteration: 1, converged: false }, 0);

        expect(mockRequestStep).toHaveBeenCalledTimes(2);
    });

    it('pendingStepRef prevents double-sending concurrent step requests', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].play(); });
        expect(mockRequestStep).toHaveBeenCalledTimes(1);

        // While the first step is still in-flight (no result yet), calling play again
        // should not post a second concurrent request because pendingStepRef is true
        act(() => { result.current[1].play(); });
        expect(mockRequestStep).toHaveBeenCalledTimes(1);
    });

    it('stops self-scheduling when paused before result arrives', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });
        act(() => { result.current[1].pause(); });

        simulateStepResult({ ...initialState, loss: 0.5, iteration: 1, converged: false }, 0);

        // No additional requestStep after pause
        expect(mockRequestStep).toHaveBeenCalledTimes(1);
    });

    it('ignores stale generation results', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });
        act(() => { result.current[1].reset(); }); // bumps generation to 1

        // Deliver result for old generation 0 — should be ignored
        simulateStepResult({ ...initialState, loss: 0.99, iteration: 1, converged: false }, 0);

        expect(result.current[0].engineState?.iteration).toBe(0);
        expect(result.current[0].lossHistory).toEqual([]);
    });

    // ── Convergence (Requirement 1.5) ───────────────────────────────────────

    it('detects convergence and stops playing', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });

        simulateStepResult({ ...initialState, loss: 0.01, iteration: 1, converged: true }, 0);

        expect(result.current[0].isConverged).toBe(true);
        expect(result.current[0].isPlaying).toBe(false);
    });

    it('detects convergence when iteration reaches nIter', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });

        simulateStepResult({ ...initialState, loss: 0.5, iteration: 10, converged: false }, 0);

        expect(result.current[0].isConverged).toBe(true);
    });

    it('does not self-schedule after convergence', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });
        expect(mockRequestStep).toHaveBeenCalledTimes(1);

        simulateStepResult({ ...initialState, loss: 0.01, iteration: 1, converged: true }, 0);

        expect(mockRequestStep).toHaveBeenCalledTimes(1); // no extra call
    });

    // ── Error handling (Requirements 12.1, 12.3) ───────────────────────────

    it('sets error state and stops playing when worker returns an error', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].play(); });

        simulateWorkerError('Step failed', 0);

        expect(result.current[0].error).toContain('Step failed');
        expect(result.current[0].isPlaying).toBe(false);
        expect(result.current[0].isPaused).toBe(true);
    });

    it('ignores stale generation errors', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].play(); });
        act(() => { result.current[1].reset(); }); // bumps generation to 1

        simulateWorkerError('Old error', 0); // stale generation

        expect(result.current[0].error).toBeNull();
    });

    // ── stepOnce (Requirement 1.3) ──────────────────────────────────────────

    it('posts exactly one step request when stepOnce is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        act(() => { result.current[1].step(); });

        expect(mockRequestStep).toHaveBeenCalledTimes(1);
    });

    it('does not self-schedule after stepOnce result', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        expect(mockRequestStep).toHaveBeenCalledTimes(1);

        simulateStepResult({ ...initialState, loss: 0.5, iteration: 1, converged: false }, 0);

        expect(mockRequestStep).toHaveBeenCalledTimes(1); // no extra call
    });

    // ── Reset (Requirement 1.4) ─────────────────────────────────────────────

    it('resets to initial state', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].play(); });
        simulateStepResult({ ...initialState, loss: 0.5, iteration: 1, converged: false }, 0);

        act(() => { result.current[1].reset(); });

        expect(result.current[0].engineState?.iteration).toBe(0);
        expect(result.current[0].lossHistory).toEqual([]);
        expect(result.current[0].isPlaying).toBe(false);
        expect(result.current[0].isConverged).toBe(false);
    });

    it('stops playback when reset is called during training', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => { result.current[1].play(); });
        act(() => { result.current[1].reset(); });

        expect(result.current[0].isPlaying).toBe(false);
    });

    // ── Parameter updates (Requirements 2.1, 2.5) ──────────────────────────

    it('pauses training when params are updated during playback', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => { result.current[1].play(); });
        act(() => { result.current[1].updateParams({ lr: 0.05 }); });

        expect(result.current[0].isPlaying).toBe(false);
    });

    it('resets state when params are updated', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...initialState, loss: 0.5, iteration: 1, converged: false }, 0);

        act(() => { result.current[1].updateParams({ lr: 0.05 }); });

        expect(result.current[0].engineState?.iteration).toBe(0);
    });

    // ── Dataset changes (Requirements 7.2, 7.4) ────────────────────────────

    it('pauses training when dataset is changed during playback', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => { result.current[1].play(); });
        act(() => { result.current[1].changeDataset('blobs'); });

        expect(result.current[0].isPlaying).toBe(false);
    });

    it('resets state when dataset is changed', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const initialState = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...initialState, loss: 0.5, iteration: 1, converged: false }, 0);

        act(() => { result.current[1].changeDataset('blobs'); });

        expect(result.current[0].engineState?.iteration).toBe(0);
        expect(loadDataset).toHaveBeenCalledWith('blobs');
    });

    // ── Loss history (Requirements 4.2, 4.4, 4.5) ──────────────────────────

    it('appends loss value to history after each step result', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.5, iteration: 1, converged: false }, 0);
        expect(result.current[0].lossHistory).toEqual([0.5]);

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.4, iteration: 2, converged: false }, 0);
        expect(result.current[0].lossHistory).toEqual([0.5, 0.4]);
    });

    it('clears loss history on reset', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.5, iteration: 1, converged: false }, 0);

        act(() => { result.current[1].reset(); });

        expect(result.current[0].lossHistory).toEqual([]);
    });

    it('clears loss history when params are updated', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.5, iteration: 1, converged: false }, 0);

        act(() => { result.current[1].updateParams({ lr: 0.05 }); });

        expect(result.current[0].lossHistory).toEqual([]);
    });

    it('clears loss history when dataset is changed', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 }, 0)
        );

        const s = result.current[0].engineState!;

        act(() => { result.current[1].step(); });
        simulateStepResult({ ...s, loss: 0.5, iteration: 1, converged: false }, 0);

        act(() => { result.current[1].changeDataset('blobs'); });

        expect(result.current[0].lossHistory).toEqual([]);
    });

    it('caps loss history at 200 points using a ring buffer', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 300 }, 0)
        );

        const s = result.current[0].engineState!;

        // Simulate 201 step results
        for (let i = 1; i <= 201; i++) {
            act(() => { result.current[1].step(); });
            simulateStepResult({ ...s, loss: i * 0.01, iteration: i, converged: false }, 0);
        }

        expect(result.current[0].lossHistory.length).toBe(200);
    });
});
