/**
 * useTreeController.ts — Tree controller hook for Decision Tree visualization
 * 
 * Manages tree building state and provides control functions for step-based tree growth.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.5, 10.4
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { loadDataset } from '../../engine/index.js';
import { initTreeState, stepDecisionTree } from '../../engine/algorithms/decisionTree.js';

/**
 * Tree node data structure
 */
export interface TreeNode {
    id: string;
    depth: number;
    feature: number | null;
    threshold: number | null;
    prediction: number | null;
    samples: number;
    impurity: number;
    left: TreeNode | null;
    right: TreeNode | null;
}

/**
 * Tree state returned by ML Engine
 */
export interface TreeState {
    algorithm: string;
    dataset: any;
    root: TreeNode;
    currentDepth: number;
    maxDepth: number;
    nodeCount: number;
    leafCount: number;
    converged: boolean;
}

/**
 * Tree parameters
 */
export interface TreeParams {
    maxDepth: number;        // 1-8
    criterion: 'gini' | 'entropy';
    minSamplesSplit: number; // 2-20
}

/**
 * Tree controller state
 */
export interface TreeControllerState {
    treeState: TreeState | null;
    isBuilding: boolean;
    isPaused: boolean;
    isComplete: boolean;
    error: string | null;
}

/**
 * Tree controller controls
 */
export interface TreeControls {
    play: () => void;
    pause: () => void;
    step: () => void;
    reset: () => void;
    updateParams: (params: Partial<TreeParams>) => void;
    changeDataset: (dataset: string) => void;
    clearError: () => void;
}

/**
 * Custom hook for managing tree building and state
 * 
 * @param algorithm - Must be 'decisionTree'
 * @param initialDataset - Dataset name
 * @param initialParams - Initial tree parameters
 * @param speedMs - Playback speed in milliseconds
 * @returns [TreeControllerState, TreeControls]
 */
export function useTreeController(
    algorithm: string,
    initialDataset: string,
    initialParams: TreeParams,
    speedMs: number = 500
): [TreeControllerState, TreeControls] {
    // Validate algorithm
    if (algorithm !== 'decisionTree') {
        throw new Error(`useTreeController expects 'decisionTree', got '${algorithm}'`);
    }

    // Initialize state
    const [state, setState] = useState<TreeControllerState>(() => {
        try {
            const dataset = loadDataset(initialDataset);
            const treeState = initTreeState('decisionTree', dataset, initialParams);
            return {
                treeState,
                isBuilding: false,
                isPaused: false,
                isComplete: false,
                error: null,
            };
        } catch (error) {
            return {
                treeState: null,
                isBuilding: false,
                isPaused: false,
                isComplete: false,
                error: error instanceof Error ? error.message : 'Failed to initialize tree',
            };
        }
    });

    // Refs for managing playback
    const intervalRef = useRef<number | null>(null);
    const paramsRef = useRef<TreeParams>(initialParams);
    const speedMsRef = useRef<number>(speedMs);
    const lastValidStateRef = useRef<TreeState | null>(state.treeState);

    // Update refs when props change
    useEffect(() => {
        paramsRef.current = initialParams;
    }, [initialParams]);

    useEffect(() => {
        speedMsRef.current = speedMs;
    }, [speedMs]);

    /**
     * Clear any active playback interval
     */
    const clearPlayback = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    /**
     * Start tree building playback
     * Requirements: 1.1
     */
    const play = useCallback(() => {
        setState(prevState => {
            if (prevState.isComplete || !prevState.treeState) {
                return prevState;
            }
            return {
                ...prevState,
                isBuilding: true,
                isPaused: false,
                error: null,
            };
        });

        // Clear any existing interval
        clearPlayback();

        // Start interval to call step repeatedly
        intervalRef.current = window.setInterval(() => {
            setState(prevState => {
                if (!prevState.treeState || prevState.isComplete) {
                    clearPlayback();
                    return prevState;
                }

                try {
                    // Call ML Engine's stepDecisionTree
                    const newTreeState = stepDecisionTree(prevState.treeState, paramsRef.current);

                    // Update last valid state
                    lastValidStateRef.current = newTreeState;

                    // Check if complete
                    const isComplete = newTreeState.converged ||
                        newTreeState.currentDepth >= paramsRef.current.maxDepth;

                    if (isComplete) {
                        clearPlayback();
                    }

                    return {
                        ...prevState,
                        treeState: newTreeState,
                        isComplete,
                        isBuilding: !isComplete,
                        isPaused: isComplete,
                        error: null,
                    };
                } catch (error) {
                    clearPlayback();
                    return {
                        ...prevState,
                        isBuilding: false,
                        isPaused: true,
                        error: error instanceof Error ? error.message : 'Failed to step tree',
                    };
                }
            });
        }, speedMsRef.current);
    }, [clearPlayback]);

    /**
     * Pause tree building
     * Requirements: 1.2
     */
    const pause = useCallback(() => {
        clearPlayback();
        setState(prevState => ({
            ...prevState,
            isBuilding: false,
            isPaused: true,
        }));
    }, [clearPlayback]);

    /**
     * Execute a single tree building step
     * Requirements: 1.3
     */
    const step = useCallback(() => {
        setState(prevState => {
            if (!prevState.treeState || prevState.isComplete) {
                return prevState;
            }

            try {
                // Call ML Engine's stepDecisionTree
                const newTreeState = stepDecisionTree(prevState.treeState, paramsRef.current);

                // Update last valid state
                lastValidStateRef.current = newTreeState;

                // Check if complete (converged or reached max depth)
                const isComplete = newTreeState.converged ||
                    newTreeState.currentDepth >= paramsRef.current.maxDepth;

                return {
                    ...prevState,
                    treeState: newTreeState,
                    isComplete,
                    isBuilding: isComplete ? false : prevState.isBuilding,
                    error: null,
                };
            } catch (error) {
                return {
                    ...prevState,
                    isBuilding: false,
                    error: error instanceof Error ? error.message : 'Failed to step tree',
                };
            }
        });
    }, []);

    /**
     * Reset tree to initial state
     * Requirements: 1.4
     */
    const reset = useCallback(() => {
        clearPlayback();

        setState(prevState => {
            try {
                const dataset = prevState.treeState?.dataset || loadDataset(initialDataset);
                const treeState = initTreeState('decisionTree', dataset, paramsRef.current);

                lastValidStateRef.current = treeState;

                return {
                    treeState,
                    isBuilding: false,
                    isPaused: false,
                    isComplete: false,
                    error: null,
                };
            } catch (error) {
                return {
                    ...prevState,
                    isBuilding: false,
                    isPaused: false,
                    isComplete: false,
                    error: error instanceof Error ? error.message : 'Failed to reset tree',
                };
            }
        });
    }, [clearPlayback, initialDataset]);

    /**
     * Update tree parameters and reset
     * Requirements: 2.1, 2.2, 2.3, 2.5
     */
    const updateParams = useCallback((newParams: Partial<TreeParams>) => {
        // Pause if currently building
        setState(prevState => {
            if (prevState.isBuilding) {
                clearPlayback();
            }
            return prevState;
        });

        // Update params ref
        paramsRef.current = { ...paramsRef.current, ...newParams };

        // Reset tree with new params
        setState(prevState => {
            try {
                const dataset = prevState.treeState?.dataset || loadDataset(initialDataset);
                const treeState = initTreeState('decisionTree', dataset, paramsRef.current);

                lastValidStateRef.current = treeState;

                return {
                    treeState,
                    isBuilding: false,
                    isPaused: false,
                    isComplete: false,
                    error: null,
                };
            } catch (error) {
                return {
                    ...prevState,
                    isBuilding: false,
                    isPaused: false,
                    error: error instanceof Error ? error.message : 'Failed to update parameters',
                };
            }
        });
    }, [clearPlayback, initialDataset]);

    /**
     * Change dataset and reset
     */
    const changeDataset = useCallback((datasetName: string) => {
        clearPlayback();

        setState(prevState => {
            try {
                const dataset = loadDataset(datasetName);
                const treeState = initTreeState('decisionTree', dataset, paramsRef.current);

                lastValidStateRef.current = treeState;

                return {
                    treeState,
                    isBuilding: false,
                    isPaused: false,
                    isComplete: false,
                    error: null,
                };
            } catch (error) {
                return {
                    ...prevState,
                    isBuilding: false,
                    isPaused: false,
                    error: error instanceof Error ? error.message : 'Failed to change dataset',
                };
            }
        });
    }, [clearPlayback]);

    /**
     * Clear error and restore last valid state
     * Requirements: 10.4
     */
    const clearError = useCallback(() => {
        const restoredState = lastValidStateRef.current;
        setState(prevState => ({
            ...prevState,
            treeState: restoredState || prevState.treeState,
            error: null,
        }));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const controls: TreeControls = {
        play,
        pause,
        step,
        reset,
        updateParams,
        changeDataset,
        clearError,
    };

    return [state, controls];
}
