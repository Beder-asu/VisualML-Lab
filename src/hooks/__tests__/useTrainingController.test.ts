/**
 * Unit tests for useTrainingController hook
 * 
 * Tests play/pause/step/reset state transitions, convergence detection, and error state management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.3
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
    step: vi.fn((state: any, params: any) => ({
        ...state,
        loss: 0.5,
        iteration: state.iteration + 1,
        converged: state.iteration + 1 >= params.nIter,
    })),
    loadDataset: vi.fn((name: string) => ({
        name,
        X: [[0.1, 0.2], [0.3, 0.4]],
        y: [0, 1],
    })),
}));

// @ts-ignore
import { initState, step, loadDataset } from '../../../engine/index.js';

describe('useTrainingController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // ---------------------------------------------------------------------------
    // Initialization tests
    // ---------------------------------------------------------------------------

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
        const mockInitState = vi.mocked(initState);
        mockInitState.mockImplementationOnce(() => {
            throw new Error('Invalid algorithm');
        });

        const { result } = renderHook(() =>
            useTrainingController('invalidAlgorithm', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const [state] = result.current;

        expect(state.engineState).toBeNull();
        expect(state.error).toBeTruthy();
        expect(state.error).toContain('Invalid algorithm');
    });

    // ---------------------------------------------------------------------------
    // Play/Pause state transitions (Requirements 1.1, 1.2)
    // ---------------------------------------------------------------------------

    it('transitions from ready to playing when play is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        const [state] = result.current;
        expect(state.isPlaying).toBe(true);
        expect(state.isPaused).toBe(false);
    });

    it('transitions from playing to paused when pause is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        // Pause
        act(() => {
            const [, controls] = result.current;
            controls.pause();
        });

        const [state] = result.current;
        expect(state.isPlaying).toBe(false);
        expect(state.isPaused).toBe(true);
    });

    it('executes steps automatically when playing', async () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const mockStep = vi.mocked(step);
        mockStep.mockClear();

        // Mock step to converge immediately to prevent infinite loop
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.5,
            iteration: _params.nIter,
            converged: true,
        }));

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        // Advance timers to trigger interval
        act(() => {
            vi.advanceTimersByTime(150);
        });

        // Step should have been called
        expect(mockStep).toHaveBeenCalled();
    });

    // ---------------------------------------------------------------------------
    // Step function (Requirement 1.3)
    // ---------------------------------------------------------------------------

    it('executes a single step when step is called', () => {
        // Reset mock to increment properly
        const mockStep = vi.mocked(step);
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.5,
            iteration: state.iteration + 1,
            converged: false,
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        const [initialState] = result.current;
        const initialIteration = initialState.engineState?.iteration || 0;

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [newState] = result.current;
        expect(newState.engineState?.iteration).toBe(initialIteration + 1);
    });

    it('updates loss value after step', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.engineState?.loss).toBe(0.5); // From mock
    });

    // ---------------------------------------------------------------------------
    // Reset function (Requirement 1.4)
    // ---------------------------------------------------------------------------

    it('resets to initial state when reset is called', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take a few steps
        act(() => {
            const [, controls] = result.current;
            controls.step();
            controls.step();
        });

        // Reset
        act(() => {
            const [, controls] = result.current;
            controls.reset();
        });

        const [state] = result.current;
        expect(state.engineState?.iteration).toBe(0);
        expect(state.engineState?.loss).toBeNull();
        expect(state.isPlaying).toBe(false);
        expect(state.isPaused).toBe(false);
        expect(state.isConverged).toBe(false);
    });

    it('stops playback when reset is called during training', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        // Reset
        act(() => {
            const [, controls] = result.current;
            controls.reset();
        });

        const [state] = result.current;
        expect(state.isPlaying).toBe(false);
    });

    // ---------------------------------------------------------------------------
    // Convergence detection (Requirement 1.5)
    // ---------------------------------------------------------------------------

    it('detects convergence and auto-pauses', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.01,
            iteration: state.iteration + 1,
            converged: true, // Force convergence
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.isConverged).toBe(true);
        expect(state.isPlaying).toBe(false);
    });

    it('detects convergence when iteration reaches nIter', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.5,
            iteration: _params.nIter, // Reach max iterations
            converged: false,
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.isConverged).toBe(true);
    });

    // ---------------------------------------------------------------------------
    // Error handling (Requirements 12.1, 12.3)
    // ---------------------------------------------------------------------------

    it('catches errors during step and sets error state', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementationOnce(() => {
            throw new Error('Step failed');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        const [state] = result.current;
        expect(state.error).toBeTruthy();
        expect(state.error).toContain('Step failed');
        expect(state.isPlaying).toBe(false);
        expect(state.isPaused).toBe(true);
    });

    it('stops playback when error occurs', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementationOnce(() => {
            throw new Error('Error during step');
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        // Advance timer to trigger step
        act(() => {
            vi.advanceTimersByTime(150);
        });

        const [state] = result.current;
        expect(state.isPlaying).toBe(false);
        expect(state.error).toBeTruthy();
    });

    // ---------------------------------------------------------------------------
    // Parameter updates (Requirements 2.1, 2.5)
    // ---------------------------------------------------------------------------

    it('pauses training when params are updated during playback', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        // Update params
        act(() => {
            const [, controls] = result.current;
            controls.updateParams({ lr: 0.05 });
        });

        const [state] = result.current;
        expect(state.isPlaying).toBe(false);
    });

    it('resets state when params are updated', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take a step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        // Update params
        act(() => {
            const [, controls] = result.current;
            controls.updateParams({ lr: 0.05 });
        });

        const [state] = result.current;
        expect(state.engineState?.iteration).toBe(0);
    });

    // ---------------------------------------------------------------------------
    // Dataset changes (Requirements 7.2, 7.4)
    // ---------------------------------------------------------------------------

    it('pauses training when dataset is changed during playback', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Start playing
        act(() => {
            const [, controls] = result.current;
            controls.play();
        });

        // Change dataset
        act(() => {
            const [, controls] = result.current;
            controls.changeDataset('blobs');
        });

        const [state] = result.current;
        expect(state.isPlaying).toBe(false);
    });

    it('resets state when dataset is changed', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take a step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        // Change dataset
        act(() => {
            const [, controls] = result.current;
            controls.changeDataset('blobs');
        });

        const [state] = result.current;
        expect(state.engineState?.iteration).toBe(0);
        expect(loadDataset).toHaveBeenCalledWith('blobs');
    });

    // ---------------------------------------------------------------------------
    // Loss history management (Requirements 4.2, 4.4, 4.5)
    // ---------------------------------------------------------------------------

    it('appends loss value to history after each step', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.5,
            iteration: state.iteration + 1,
            converged: false,
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Initial state should have empty loss history
        expect(result.current[0].lossHistory).toEqual([]);

        // Take first step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].lossHistory).toEqual([0.5]);

        // Take second step
        act(() => {
            const [, controls] = result.current;
            controls.step();
        });

        expect(result.current[0].lossHistory).toEqual([0.5, 0.5]);
    });

    it('clears loss history on reset', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.5,
            iteration: state.iteration + 1,
            converged: false,
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take a few steps to build up history
        act(() => {
            const [, controls] = result.current;
            controls.step();
            controls.step();
            controls.step();
        });

        expect(result.current[0].lossHistory.length).toBe(3);

        // Reset
        act(() => {
            const [, controls] = result.current;
            controls.reset();
        });

        expect(result.current[0].lossHistory).toEqual([]);
    });

    it('clears loss history when params are updated', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.5,
            iteration: state.iteration + 1,
            converged: false,
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take a few steps
        act(() => {
            const [, controls] = result.current;
            controls.step();
            controls.step();
        });

        expect(result.current[0].lossHistory.length).toBe(2);

        // Update params
        act(() => {
            const [, controls] = result.current;
            controls.updateParams({ lr: 0.05 });
        });

        expect(result.current[0].lossHistory).toEqual([]);
    });

    it('clears loss history when dataset is changed', () => {
        const mockStep = vi.mocked(step);
        mockStep.mockImplementation((state: any, _params: any) => ({
            ...state,
            loss: 0.5,
            iteration: state.iteration + 1,
            converged: false,
        }));

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 10 })
        );

        // Take a few steps
        act(() => {
            const [, controls] = result.current;
            controls.step();
            controls.step();
        });

        expect(result.current[0].lossHistory.length).toBe(2);

        // Change dataset
        act(() => {
            const [, controls] = result.current;
            controls.changeDataset('blobs');
        });

        expect(result.current[0].lossHistory).toEqual([]);
    });

    it('downsamples loss history when it exceeds 100 points', () => {
        const mockStep = vi.mocked(step);
        let callCount = 0;
        mockStep.mockImplementation((state: any, _params: any) => {
            callCount++;
            return {
                ...state,
                loss: callCount * 0.01, // Different loss each time
                iteration: state.iteration + 1,
                converged: false,
            };
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 200 })
        );

        // Take 101 steps to trigger downsampling
        act(() => {
            const [, controls] = result.current;
            for (let i = 0; i < 101; i++) {
                controls.step();
            }
        });

        const [state] = result.current;

        // After 101 steps, downsampling should have occurred
        // The history should be reduced to approximately 50-51 points
        expect(state.lossHistory.length).toBeLessThanOrEqual(51);
        expect(state.lossHistory.length).toBeGreaterThan(0);
    });

    it('preserves loss values during downsampling', () => {
        const mockStep = vi.mocked(step);
        let callCount = 0;
        mockStep.mockImplementation((state: any, _params: any) => {
            callCount++;
            return {
                ...state,
                loss: callCount, // Use call count as loss for easy verification
                iteration: state.iteration + 1,
                converged: false,
            };
        });

        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'iris-2d', { lr: 0.01, nIter: 200 })
        );

        // Take 101 steps
        act(() => {
            const [, controls] = result.current;
            for (let i = 0; i < 101; i++) {
                controls.step();
            }
        });

        const [state] = result.current;

        // Verify that downsampled values are from the original sequence
        // After downsampling, we should have every other value
        state.lossHistory.forEach((loss) => {
            expect(loss).toBeGreaterThan(0);
            expect(loss).toBeLessThanOrEqual(101);
        });
    });
});
