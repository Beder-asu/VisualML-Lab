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
    step: vi.fn((state: any, _params: any) => ({
        ...state,
        loss: 0.5,
        iteration: state.iteration + 1,
        converged: false,
    })),
    loadDataset: vi.fn((name: string) => ({
        name,
        X: [[0.1, 0.2], [0.3, 0.4]],
        y: [0, 1],
    })),
}));

// @ts-ignore
import { initState, step, loadDataset } from '../../../engine/index.js';

describe('useTrainingController - Error Handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // ---------------------------------------------------------------------------
    // Error display on ML Engine errors (Requirement 12.1)
    // ---------------------------------------------------------------------------

    it('displays error message when ML Engine step() throws', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementationOnce(() => {
            throw new Error('Invalid parameter value');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.error).toBe('Invalid parameter value');
    });

    it('displays error message when initState() throws during initialization', () => {
        const mockInitState = vi.mocked(initState);
        mockInitState.mockImplementationOnce(() => {
            throw new Error('Invalid algorithm configuration');
        });

        const { result } = renderHook(() =>
            useTrainingController('invalidAlgorithm', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const [state] = result.current;
        expect(state.error).toBe('Invalid algorithm configuration');
    });

    it('displays error message when loadDataset() throws', () => {
        const mockLoadDataset = vi.mocked(loadDataset);
        mockLoadDataset.mockImplementationOnce(() => {
            throw new Error('Dataset not found');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'invalid-dataset', { lr: 0.01, nIter: 10 })
        );

        const [state] = result.current;
        expect(state.error).toBe('Dataset not found');
    });

    it('displays error message when updateParams causes initState to throw', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const mockInitState = vi.mocked(initState);
        mockInitState.mockImplementationOnce(() => {
            throw new Error('Invalid parameter combination');
        });

        act(() => {
            const [, controls] = result.current;
            controls.updateParams({ lr: -1 }); // Invalid learning rate
        });

        const [state] = result.current;
        expect(state.error).toBe('Invalid parameter combination');
    });

    it('displays error message when changeDataset causes loadDataset to throw', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const mockLoadDataset = vi.mocked(loadDataset);
        mockLoadDataset.mockImplementationOnce(() => {
            throw new Error('Failed to load new dataset');
        });

        act(() => {
            const [, controls] = result.current;
            controls.changeDataset('invalid-dataset');
        });

        const [state] = result.current;
        expect(state.error).toBe('Failed to load new dataset');
    });

    // ---------------------------------------------------------------------------
    // Automatic pause on error (Requirement 12.3)
    // ---------------------------------------------------------------------------

    it('automatically pauses training when error occurs during step', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementationOnce(() => {
            throw new Error('Training error');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        expect(result.current[0].isPlaying).toBe(true);

        // Advance timer to trigger step that will throw
        act(() => {
            vi.advanceTimersByTime(150);
        });

        const [state] = result.current;
        expect(state.isPlaying).toBe(false);
        expect(state.isPaused).toBe(true);
        expect(state.error).toBeTruthy();
    });

    it('sets isPaused to true when error occurs', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementationOnce(() => {
            throw new Error('Error during training');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.isPaused).toBe(true);
        expect(state.isPlaying).toBe(false);
    });

    it('stops interval when error occurs during playback', () => {
        const mockStep = vi.mocked(step);
        let callCount = 0;
        mockStep.mockImplementation(() => {
            callCount++;
            if (callCount === 2) {
                throw new Error('Error on second call');
            }
            return {
                algorithm: 'linearRegression',
                weights: [0, 0],
                bias: 0,
                loss: 0.5,
                iteration: callCount,
                converged: false,
                dataset: {},
            };
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        // Advance timer to trigger first step (succeeds)
        act(() => {
            vi.advanceTimersByTime(150);
        });

        // Advance timer to trigger second step (throws error)
        act(() => {
            vi.advanceTimersByTime(150);
        });

        const [state] = result.current;
        expect(state.error).toBeTruthy();
        expect(state.isPlaying).toBe(false);

        // Clear the error and advance timer again - should not call step anymore
        const previousCallCount = callCount;
        act(() => {
            vi.advanceTimersByTime(150);
        });

        expect(callCount).toBe(previousCallCount); // No additional calls
    });

    // ---------------------------------------------------------------------------
    // Error dismissal and state recovery (Requirements 12.4, 12.5)
    // ---------------------------------------------------------------------------

    it('clears error when clearError is called', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementationOnce(() => {
            throw new Error('Test error');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Trigger error
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].error).toBeTruthy();

        // Clear error
        act(() => {
            const [, controls] = result.current;
            controls.clearError();
        });

        const [state] = result.current;
        expect(state.error).toBeNull();
    });

    it('restores last valid state when error is dismissed', () => {
        const mockStep = vi.mocked(step);

        // First call succeeds
        mockStep.mockImplementationOnce((state: any) => ({
            ...state,
            loss: 0.3,
            iteration: 1,
            converged: false,
        }));

        // Second call throws error
        mockStep.mockImplementationOnce(() => {
            throw new Error('Step failed');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take first successful step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const validState = result.current[0].engineState;
        expect(validState?.iteration).toBe(1);
        expect(validState?.loss).toBe(0.3);

        // Take second step that fails
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].error).toBeTruthy();

        // Engine state should still be the last valid state
        expect(result.current[0].engineState?.iteration).toBe(1);
        expect(result.current[0].engineState?.loss).toBe(0.3);

        // Clear error
        act(() => {
            const [, controls] = result.current;
            controls.clearError();
        });

        // State should remain at last valid state
        const [state] = result.current;
        expect(state.engineState?.iteration).toBe(1);
        expect(state.engineState?.loss).toBe(0.3);
        expect(state.error).toBeNull();
    });

    it('preserves last valid state across multiple errors', () => {
        const mockStep = vi.mocked(step);

        // First call succeeds
        mockStep.mockImplementationOnce((state: any) => ({
            ...state,
            loss: 0.2,
            iteration: 1,
            converged: false,
        }));

        // Second call throws
        mockStep.mockImplementationOnce(() => {
            throw new Error('First error');
        });

        // Third call throws
        mockStep.mockImplementationOnce(() => {
            throw new Error('Second error');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take successful step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const validIteration = result.current[0].engineState?.iteration;

        // First error
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].error).toBe('First error');
        expect(result.current[0].engineState?.iteration).toBe(validIteration);

        // Clear first error
        act(() => {
            const [, controls] = result.current;
            controls.clearError();
        });

        // Second error
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].error).toBe('Second error');
        expect(result.current[0].engineState?.iteration).toBe(validIteration);

        // Clear second error
        act(() => {
            const [, controls] = result.current;
            controls.clearError();
        });

        // State should still be at last valid state
        expect(result.current[0].engineState?.iteration).toBe(validIteration);
        expect(result.current[0].error).toBeNull();
    });

    it('updates last valid state after successful reset', () => {
        const mockStep = vi.mocked(step);

        // First step succeeds
        mockStep.mockImplementationOnce((state: any) => ({
            ...state,
            loss: 0.4,
            iteration: 1,
            converged: false,
        }));

        // Second step throws
        mockStep.mockImplementationOnce(() => {
            throw new Error('Error after step');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take successful step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        // Take failing step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].error).toBeTruthy();

        // Reset should create new valid state
        act(() => {
            const [, controls] = result.current;
            controls.reset();
        });

        const [state] = result.current;
        expect(state.engineState?.iteration).toBe(0);
        expect(state.error).toBeNull();

        // Now if we get another error, it should restore to the reset state
        mockStep.mockImplementationOnce(() => {
            throw new Error('Another error');
        });

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].error).toBeTruthy();
        expect(result.current[0].engineState?.iteration).toBe(0); // Should be at reset state
    });

    it('handles non-Error exceptions gracefully', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementationOnce(() => {
            throw 'String error'; // Non-Error exception
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.error).toBe('Training step failed');
        expect(state.isPlaying).toBe(false);
        expect(state.isPaused).toBe(true);
    });

    it('clears error when successful operation occurs after error', () => {
        const mockStep = vi.mocked(step);

        // First call throws
        mockStep.mockImplementationOnce(() => {
            throw new Error('Initial error');
        });

        // Second call succeeds
        mockStep.mockImplementationOnce((state: any) => ({
            ...state,
            loss: 0.5,
            iteration: state.iteration + 1,
            converged: false,
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Trigger error
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].error).toBeTruthy();

        // Clear error
        act(() => {
            const [, controls] = result.current;
            controls.clearError();
        });

        // Take successful step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.error).toBeNull();
        expect(state.engineState?.iteration).toBeGreaterThan(0);
    });
});
