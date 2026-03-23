/**
 * useTrainingController.ts — Training controller hook
 * 
 * Manages training loop and state synchronization with ML Engine.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.3
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { TrainingState, TrainingControls } from '../types/ui';

// Import ML Engine functions (CommonJS module)
// @ts-ignore - ML Engine is JavaScript
import * as engine from '../../engine/index.js';

const { initState, step, loadDataset } = engine;

interface Params {
    lr: number;
    nIter: number;
    C?: number; // For SVM
}

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
    initialParams: Params
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

    // Refs for managing playback interval and last valid state
    const intervalRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const paramsRef = useRef<Params>(initialParams);
    const lastValidStateRef = useRef<TrainingState['engineState']>(state.engineState);

    // Update params ref when they change
    useEffect(() => {
        paramsRef.current = initialParams;
    }, [initialParams]);

    /**
     * Clear any active intervals/animation frames
     */
    const clearPlayback = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    /**
     * Execute a single training step
     * Requirements: 1.3, 12.1
     */
    const executeStep = useCallback(() => {
        setState(prevState => {
            if (!prevState.engineState) {
                return prevState;
            }

            try {
                // Call ML Engine step function
                const newEngineState = step(prevState.engineState, paramsRef.current);

                // Add loss value to history (Requirements 4.2)
                const newLossHistory = [...prevState.lossHistory, newEngineState.loss];

                // Note: We keep all history points. The LossCurve component will handle
                // display optimization if needed (Requirements 4.5)

                // Check for convergence (Requirements 1.5)
                const converged = newEngineState.converged ||
                    newEngineState.iteration >= paramsRef.current.nIter;

                // Save last valid state (Requirements 12.5)
                lastValidStateRef.current = newEngineState;

                return {
                    ...prevState,
                    engineState: newEngineState,
                    lossHistory: newLossHistory,
                    isConverged: converged,
                    isPlaying: converged ? false : prevState.isPlaying,
                    isPaused: converged ? true : prevState.isPaused,
                    error: null,
                };
            } catch (error) {
                // Requirements 12.1: Handle errors gracefully
                clearPlayback();
                return {
                    ...prevState,
                    isPlaying: false,
                    isPaused: true,
                    error: error instanceof Error ? error.message : 'Training step failed',
                };
            }
        });
    }, [clearPlayback]);

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

        // Clear any existing interval
        clearPlayback();

        // Start new interval for continuous stepping
        intervalRef.current = window.setInterval(() => {
            animationFrameRef.current = requestAnimationFrame(() => {
                executeStep();
            });
        }, 100); // 100ms per step (configurable)
    }, [clearPlayback, executeStep]);

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
        executeStep();
    }, [executeStep]);

    /**
     * Reset training to initial state
     * Requirements: 1.4
     */
    const reset = useCallback(() => {
        clearPlayback();

        setState(prevState => {
            try {
                const dataset = prevState.engineState?.dataset || loadDataset(initialDataset);
                const engineState = initState(algorithm, dataset, paramsRef.current);

                // Save last valid state (Requirements 12.5)
                lastValidStateRef.current = engineState;

                return {
                    engineState,
                    lossHistory: [], // Clear history on reset (Requirements 4.4)
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
        // Pause if playing (Requirements 2.5)
        if (state.isPlaying) {
            clearPlayback();
        }

        paramsRef.current = { ...paramsRef.current, ...newParams };

        // Reset training state
        setState(prevState => {
            try {
                const dataset = prevState.engineState?.dataset || loadDataset(initialDataset);
                const engineState = initState(algorithm, dataset, paramsRef.current);

                // Save last valid state (Requirements 12.5)
                lastValidStateRef.current = engineState;

                return {
                    engineState,
                    lossHistory: [], // Clear history on reset
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
    }, [state.isPlaying, clearPlayback, algorithm, initialDataset]);

    /**
     * Change dataset and reset
     * Requirements: 7.2, 7.4
     */
    const changeDataset = useCallback((datasetName: string) => {
        // Pause if playing (Requirements 7.4)
        if (state.isPlaying) {
            clearPlayback();
        }

        setState(prevState => {
            try {
                const dataset = loadDataset(datasetName);
                const engineState = initState(algorithm, dataset, paramsRef.current);

                // Save last valid state (Requirements 12.5)
                lastValidStateRef.current = engineState;

                return {
                    engineState,
                    lossHistory: [], // Clear history on dataset change
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
    }, [state.isPlaying, clearPlayback, algorithm]);

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
