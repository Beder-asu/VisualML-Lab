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
    // Generation counter — incremented on reset/updateParams/changeDataset to invalidate in-flight worker responses
    const generationRef = useRef<number>(0);
    // Tracks whether a step request is in-flight to prevent concurrent requests
    const pendingStepRef = useRef<boolean>(false);
    // Accepted manual steps wait for the previous result, never reuse its input.
    const queuedStepsRef = useRef(0);
    const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    /**
     * Clear any active playback loop
     */
    const clearPlayback = useCallback(() => {
        isLoopRunningRef.current = false;
        queuedStepsRef.current = 0;
        if (playbackTimerRef.current !== null) {
            clearTimeout(playbackTimerRef.current);
            playbackTimerRef.current = null;
        }
    }, []);

    /**
     * Post a step request to the worker.
     * Serialize all requests. Continuous playback is throttled after each result;
     * manual steps are drained immediately from the latest returned state.
     */
    const sendStep = useCallback(() => {
        const currentEngineState = engineStateRef.current;
        if (!currentEngineState) return;
        if (pendingStepRef.current || currentEngineState.converged ||
            currentEngineState.iteration >= paramsRef.current.nIter) return;

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
            clearPlayback();
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
            clearPlayback();
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

        if (!converged && queuedStepsRef.current > 0) {
            queuedStepsRef.current -= 1;
            sendStep();
        } else if (!converged && isLoopRunningRef.current) {
            if (speedMsRef.current > 0) {
                playbackTimerRef.current = setTimeout(() => {
                    playbackTimerRef.current = null;
                    if (isLoopRunningRef.current) sendStep();
                }, speedMsRef.current);
            } else {
                sendStep();
            }
        }

    }, [sendStep, clearPlayback]);

    /**
     * Handle an error from the worker.
     * Wired via setOnError in a useEffect below.
     */
    const handleWorkerError = useCallback((error: ErrorMessage) => {
        // Discard stale error responses
        if (error.generation !== generationRef.current) return;

        pendingStepRef.current = false;
        clearPlayback();

        setState(prevState => ({
            ...prevState,
            isPlaying: false,
            isPaused: true,
            error: error.message,
        }));
    }, [clearPlayback]);

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
        const current = engineStateRef.current;
        if (!current || current.converged || current.iteration >= paramsRef.current.nIter) return;
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
        const current = engineStateRef.current;
        if (isLoopRunningRef.current || !current || current.converged ||
            current.iteration >= paramsRef.current.nIter) return;
        if (pendingStepRef.current) {
            queuedStepsRef.current += 1;
        } else {
            sendStep();
        }
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
        clearPlayback();

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
        clearPlayback();

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
