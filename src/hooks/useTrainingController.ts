/**
 * useTrainingController.ts — Training controller hook
 * 
 * Manages training loop and state synchronization with ML Engine.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.3
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { TrainingState, TrainingControls } from '../types/ui';
import type { State, Params } from '../types/engine';
import type { StepResultMessage, ErrorMessage } from '../types/worker';

// Import ML Engine functions (JavaScript module with type declarations in src/types/engine.d.ts)
import { initState, loadDataset } from '../../engine/index.js';
import { useEngineWorker } from './useEngineWorker';

const MAX_SAFE_ITERATIONS = 10_000;
const LOSS_HISTORY_MAX = 200;

/**
 * Custom hook for managing training playback and state
 * 
 * @param algorithm - Algorithm name (linearRegression, logisticRegression, svm)
 * @param initialDataset - Dataset name
 * @param initialParams - Initial hyperparameters
 * @returns [TrainingState, TrainingControls]
 */
export function useTrainingController(
    algorithm: string,
    initialDataset: string,
    initialParams: Params,
    speedMs: number = 200
): [TrainingState, TrainingControls] {
    // Training state
    const [state, setState] = useState<TrainingState>(() => {
        try {
            const dataset = loadDataset(initialDataset);
            const engineState = initState(algorithm, dataset, initialParams);
            return {
                engineState,
                lossHistory: [],
                isPlaying: false,
                isPaused: false,
                isConverged: false,
                error: null,
            };
        } catch (error) {
            return {
                engineState: null,
                lossHistory: [],
                isPlaying: false,
                isPaused: false,
                isConverged: false,
                error: error instanceof Error ? error.message : 'Failed to initialize state',
            };
        }
    });

    // Refs for managing playback and last valid state
    const isLoopRunningRef = useRef<boolean>(false);
    const paramsRef = useRef<Params>(initialParams);
    const speedMsRef = useRef<number>(speedMs);
    const lastValidStateRef = useRef<State | null>(state.engineState);
    // Mirror of engineState in a ref for synchronous access
    const engineStateRef = useRef<State | null>(state.engineState);
    // Mirror of isPlaying for synchronous access in callbacks (avoids stale closure)
    const isPlayingRef = useRef<boolean>(state.isPlaying);
    // Generation counter — incremented on reset/updateParams/changeDataset to invalidate in-flight worker responses
    const generationRef = useRef<number>(0);
    // Tracks whether a step request is in-flight to prevent concurrent requests
    const pendingStepRef = useRef<boolean>(false);
    // Flag for single-step mode — prevents self-scheduling after one result
    const isSingleStepRef = useRef<boolean>(false);

    // Web Worker hook
    const { requestStep, setOnResult, setOnError } = useEngineWorker();

    // Update params ref when they change
    useEffect(() => {
        paramsRef.current = initialParams;
    }, [initialParams]);

    // Keep speedMsRef in sync
    useEffect(() => {
        speedMsRef.current = speedMs;
    }, [speedMs]);

    // Keep isPlayingRef in sync with state.isPlaying
    useEffect(() => {
        isPlayingRef.current = state.isPlaying;
    }, [state.isPlaying]);

    /**
     * Clear any active playback loop
     */
    const clearPlayback = useCallback(() => {
        isLoopRunningRef.current = false;
    }, []);

    /**
     * Post a step request to the worker.
     * pendingStepRef guard only applies during continuous play — fast-forward
     * and single-step bypass it so they are never silently dropped.
     * Speed throttling is handled by the PlaybackControls interval, not here.
     */
    const sendStep = useCallback((options: { ignorePending?: boolean } = {}) => {
        const currentEngineState = engineStateRef.current;
        if (!currentEngineState) return;
        if (pendingStepRef.current && !options.ignorePending) return;

        pendingStepRef.current = true;
        requestStep(currentEngineState, paramsRef.current, generationRef.current);
    }, [requestStep]);

    /**
     * Handle a step result from the worker.
     * Wired via setOnResult in a useEffect below.
     */
    const handleStepResult = useCallback((result: StepResultMessage) => {
        // Discard stale responses from before a reset/param-change/dataset-change
        if (result.generation !== generationRef.current) return;

        pendingStepRef.current = false;

        const newEngineState = result.state;

        // Check hard iteration ceiling
        if (newEngineState.iteration >= MAX_SAFE_ITERATIONS) {
            isLoopRunningRef.current = false;
            engineStateRef.current = newEngineState;
            lastValidStateRef.current = newEngineState;
            setState(prevState => ({
                ...prevState,
                engineState: newEngineState,
                isPlaying: false,
                error: 'Training exceeded maximum iterations (10,000). This may indicate a bug in the algorithm.',
            }));
            return;
        }

        // Check for convergence
        const converged = newEngineState.converged ||
            newEngineState.iteration >= paramsRef.current.nIter;

        engineStateRef.current = newEngineState;
        lastValidStateRef.current = newEngineState;

        if (converged) {
            isLoopRunningRef.current = false;
        }

        // Update React state with ring buffer for loss history
        setState(prevState => {
            let newLossHistory = [...prevState.lossHistory];
            if (newEngineState.loss !== null) {
                newLossHistory.push(newEngineState.loss);
                if (newLossHistory.length > LOSS_HISTORY_MAX) {
                    newLossHistory.shift();
                }
            }
            return {
                ...prevState,
                engineState: newEngineState,
                lossHistory: newLossHistory,
                isConverged: converged,
                isPlaying: converged ? false : prevState.isPlaying,
                isPaused: converged ? true : prevState.isPaused,
                error: null,
            };
        });

        // Self-scheduling: continue the loop if still playing and not single-step
        // Apply speed throttle here (not in sendStep) so single-step/fast-forward remain instant
        if (!converged && isLoopRunningRef.current && !isSingleStepRef.current) {
            if (speedMsRef.current > 0) {
                setTimeout(() => {
                    if (isLoopRunningRef.current) sendStep();
                }, speedMsRef.current);
            } else {
                sendStep();
            }
        }

        // Reset single-step flag after use
        isSingleStepRef.current = false;
    }, [sendStep]);

    /**
     * Handle an error from the worker.
     * Wired via setOnError in a useEffect below.
     */
    const handleWorkerError = useCallback((error: ErrorMessage) => {
        // Discard stale error responses
        if (error.generation !== generationRef.current) return;

        pendingStepRef.current = false;
        isLoopRunningRef.current = false;

        setState(prevState => ({
            ...prevState,
            isPlaying: false,
            isPaused: true,
            error: error.message,
        }));
    }, []);

    // Wire worker callbacks
    useEffect(() => {
        setOnResult(handleStepResult);
    }, [setOnResult, handleStepResult]);

    useEffect(() => {
        setOnError(handleWorkerError);
    }, [setOnError, handleWorkerError]);

    /**
     * Start training playback
     * Requirements: 1.1
     */
    const play = useCallback(() => {
        setState(prevState => {
            if (prevState.isConverged || !prevState.engineState) {
                return prevState;
            }
            return {
                ...prevState,
                isPlaying: true,
                isPaused: false,
                error: null,
            };
        });

        clearPlayback();
        isLoopRunningRef.current = true;
        isSingleStepRef.current = false;
        sendStep();
    }, [clearPlayback, sendStep]);

    /**
     * Pause training playback
     * Requirements: 1.2
     */
    const pause = useCallback(() => {
        clearPlayback();
        setState(prevState => ({
            ...prevState,
            isPlaying: false,
            isPaused: true,
        }));
    }, [clearPlayback]);

    /**
     * Execute a single training step
     * Requirements: 1.3
     */
    const stepOnce = useCallback(() => {
        isSingleStepRef.current = true;
        // ignorePending so fast-forward interval calls are never silently dropped
        sendStep({ ignorePending: true });
    }, [sendStep]);

    /**
     * Reset training to initial state
     * Requirements: 1.4
     */
    const reset = useCallback(() => {
        clearPlayback();
        generationRef.current += 1;
        pendingStepRef.current = false;

        setState(prevState => {
            try {
                const dataset = prevState.engineState?.dataset || loadDataset(initialDataset);
                const engineState = initState(algorithm, dataset, paramsRef.current);

                engineStateRef.current = engineState;
                lastValidStateRef.current = engineState;

                return {
                    engineState,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                };
            } catch (error) {
                return {
                    ...prevState,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: error instanceof Error ? error.message : 'Failed to reset state',
                };
            }
        });
    }, [clearPlayback, algorithm, initialDataset]);

    /**
     * Clear error and restore last valid state
     * Requirements: 12.4, 12.5
     */
    const clearError = useCallback(() => {
        const restoredState = lastValidStateRef.current;
        if (restoredState) {
            engineStateRef.current = restoredState;
        }
        setState(prevState => ({
            ...prevState,
            engineState: lastValidStateRef.current || prevState.engineState,
            error: null,
        }));
    }, []);

    /**
     * Update hyperparameters and reset
     * Requirements: 2.1, 2.2, 2.3, 2.5
     */
    const updateParams = useCallback((newParams: Partial<Params>) => {
        if (isPlayingRef.current) {
            clearPlayback();
        }

        generationRef.current += 1;
        pendingStepRef.current = false;
        paramsRef.current = { ...paramsRef.current, ...newParams };

        setState(prevState => {
            try {
                const dataset = prevState.engineState?.dataset || loadDataset(initialDataset);
                const engineState = initState(algorithm, dataset, paramsRef.current);

                engineStateRef.current = engineState;
                lastValidStateRef.current = engineState;

                return {
                    engineState,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                };
            } catch (error) {
                return {
                    ...prevState,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    error: error instanceof Error ? error.message : 'Failed to update parameters',
                };
            }
        });
    }, [clearPlayback, algorithm, initialDataset]);

    /**
     * Change dataset and reset
     * Requirements: 7.2, 7.4
     */
    const changeDataset = useCallback((datasetName: string) => {
        if (isPlayingRef.current) {
            clearPlayback();
        }

        generationRef.current += 1;
        pendingStepRef.current = false;

        setState(prevState => {
            try {
                const dataset = loadDataset(datasetName);
                const engineState = initState(algorithm, dataset, paramsRef.current);

                engineStateRef.current = engineState;
                lastValidStateRef.current = engineState;

                return {
                    engineState,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                };
            } catch (error) {
                return {
                    ...prevState,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    error: error instanceof Error ? error.message : 'Failed to change dataset',
                };
            }
        });
    }, [clearPlayback, algorithm]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearPlayback();
        };
    }, [clearPlayback]);

    // Auto-pause when converged
    useEffect(() => {
        if (state.isConverged) {
            clearPlayback();
        }
    }, [state.isConverged, clearPlayback]);

    const controls: TrainingControls = {
        play,
        pause,
        step: stepOnce,
        reset,
        updateParams,
        changeDataset,
        clearError,
    };

    return [state, controls];
}
