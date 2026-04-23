/**
 * GradientDescentLayout.tsx — Layout for gradient descent algorithms
 * 
 * Implements the lesson page layout for linearRegression, logisticRegression, and svm.
 * Uses BaseLayout with algorithm-specific controls and visualization slots.
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTrainingController } from '../../hooks/useTrainingController';
import { useLayoutError, useCodePanelState } from '../../hooks/useLayoutHooks';
import { getDefaultDataset } from '../../utils/layoutUtils';
import { ParameterControls } from '../../components/ParameterControls';
import { StatusIndicator } from '../../components/StatusIndicator';
import { PlaybackControls } from '../../components/PlaybackControls';
import { VisualizationPanel } from '../../components/VisualizationPanel';
import { BaseLayout } from '../../components/BaseLayout';

interface GradientDescentLayoutProps {
    algorithm: 'linearRegression' | 'logisticRegression' | 'svm';
}

export const GradientDescentLayout: React.FC<GradientDescentLayoutProps> = ({ algorithm }) => {
    // State management - Requirements: 2.1, 2.2

    // Initial parameters for gradient descent algorithms
    // lr: learning rate (step size for gradient descent)
    // nIter: number of iterations (training steps)
    // C: regularization parameter (SVM only)
    const [params, setParams] = useState({
        lr: 0.01,
        nIter: 100,
        C: 1.0, // For SVM
    });

    // Dataset state - use getDefaultDataset utility - Requirements: 5.5
    // Each algorithm has a default dataset that best demonstrates its capabilities
    const [dataset, setDataset] = useState(getDefaultDataset(algorithm));

    // Playback speed state (ms per step; default 100ms = ~10 steps/sec)
    // Lower values = faster training, higher values = slower (easier to observe)
    const [speedMs, setSpeedMs] = useState(100);

    // Shared hooks - Requirements: 5.2, 5.4
    // These hooks provide common functionality across all layouts
    const { error, clearError } = useLayoutError();
    const {
        isExpanded: codePanelExpanded,
        toggle: toggleCodePanel
    } = useCodePanelState(false);

    // Help modal state
    const [helpModalOpen, setHelpModalOpen] = useState(false);

    // Training controller hook - Requirements: 2.2
    // This hook manages the ML Engine worker and training state
    // It provides trainingState (current state) and controls (actions)
    const [trainingState, controls] = useTrainingController(
        algorithm,
        dataset,
        params,
        speedMs
    );

    // Parameter change handler - Requirements: 2.3
    // Design Decision: Pause training when params change to avoid confusion
    // User can see the effect of the change before resuming
    const handleParamsChange = useCallback((newParams: Partial<typeof params>) => {
        // Pause training if active
        if (trainingState.isPlaying) {
            controls.pause();
        }
        // Update params state
        const updatedParams = { ...params, ...newParams };
        setParams(updatedParams);
        // Call controls.updateParams to reset training with new params
        controls.updateParams(updatedParams);
    }, [trainingState.isPlaying, params, controls]);

    // Dataset change handler - Requirements: 2.3
    // Changing dataset resets the entire training state
    const handleDatasetChange = useCallback((newDataset: string) => {
        // Update dataset state
        setDataset(newDataset);
        // Call controls.changeDataset to reset training with new dataset
        controls.changeDataset(newDataset);
    }, [controls]);

    // Keyboard shortcut handlers - Requirements: 2.4
    // These handlers are passed to BaseLayout for keyboard integration
    const handlePlayPause = useCallback(() => {
        if (trainingState.isPlaying) {
            controls.pause();
        } else {
            controls.play();
        }
    }, [trainingState.isPlaying, controls]);

    const handleToggleHelp = useCallback(() => {
        setHelpModalOpen(!helpModalOpen);
    }, [helpModalOpen]);

    // Handle algorithm-specific dataset mapping - Requirements: 2.1, 5.5
    // When algorithm changes (e.g., navigating from linearRegression to svm),
    // automatically switch to the appropriate default dataset
    useEffect(() => {
        const newDataset = getDefaultDataset(algorithm);
        if (dataset !== newDataset) {
            handleDatasetChange(newDataset);
        }
    }, [algorithm, dataset, handleDatasetChange]);

    // Controls slot content - Requirements: 2.1
    // This is where algorithm-specific parameter controls are rendered
    // Memoized to prevent unnecessary re-renders when other state changes
    const controlsSlot = useMemo(() => (
        <ParameterControls
            algorithm={algorithm}
            params={params}
            isPlaying={trainingState.isPlaying}
            onParamsChange={handleParamsChange}
            onPause={controls.pause}
        />
    ), [algorithm, params, trainingState.isPlaying, handleParamsChange, controls.pause]);

    // Get current iteration from engine state
    // Fallback to 0 if engine state is not yet initialized
    const currentIteration = trainingState.engineState?.iteration || 0;

    // Visualization slot content - Requirements: 2.1
    // This is the main visualization area showing training progress
    // Layout: StatusIndicator + PlaybackControls + (Canvas2D | LossCurve)
    // Memoized to prevent unnecessary re-renders when other state changes
    const visualizationSlot = useMemo(() => (
        <VisualizationPanel
            engineState={trainingState.engineState}
            lossHistory={trainingState.lossHistory}
            isPlaying={trainingState.isPlaying}
            isPaused={trainingState.isPaused}
            isConverged={trainingState.isConverged}
            iteration={currentIteration}
            maxIterations={params.nIter}
            onPlay={controls.play}
            onPause={controls.pause}
            onStep={controls.step}
            onReset={controls.reset}
            speedMs={speedMs}
            onSpeedChange={setSpeedMs}
        />
    ), [
        trainingState.isPlaying,
        trainingState.isPaused,
        trainingState.isConverged,
        trainingState.engineState,
        trainingState.lossHistory,
        currentIteration,
        params.nIter,
        controls.play,
        controls.pause,
        controls.step,
        controls.reset,
        speedMs,
        setSpeedMs
    ]);

    // Memoize keyboard handlers to prevent unnecessary re-renders
    const keyboardHandlers = useMemo(() => ({
        onPlayPause: handlePlayPause,
        onStep: controls.step,
        onReset: controls.reset,
        onToggleCodePanel: toggleCodePanel,
        onToggleHelp: handleToggleHelp,
    }), [handlePlayPause, controls.step, controls.reset, toggleCodePanel, handleToggleHelp]);

    // Render BaseLayout with all slots and handlers
    // BaseLayout provides the shared shell (concept panel, code panel, etc.)
    return (
        <BaseLayout
            algorithm={algorithm}
            controlsSlot={controlsSlot}
            visualizationSlot={visualizationSlot}
            // Combine errors from layout and training controller
            error={error || trainingState.error}
            onClearError={() => {
                clearError();
                controls.clearError();
            }}
            codePanelExpanded={codePanelExpanded}
            onToggleCodePanel={toggleCodePanel}
            helpModalOpen={helpModalOpen}
            onToggleHelp={handleToggleHelp}
            // Keyboard handlers for Space, R, C, ? keys
            keyboardHandlers={keyboardHandlers}
        />
    );
};
