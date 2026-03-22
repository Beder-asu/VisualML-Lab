/**
 * LessonPage.tsx — Main lesson page with three-panel layout
 * 
 * Implements responsive grid layout with concept panel, visualization panel, and code panel.
 * Integrates training controller, keyboard shortcuts, and all UI components.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrainingController } from '../hooks/useTrainingController';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ConceptPanel } from '../components/ConceptPanel';
import { VisualizationPanel } from '../components/VisualizationPanel';
import { ParameterControls } from '../components/ParameterControls';

import { CodePanel } from '../components/CodePanel';
import { Toast } from '../components/Toast';
import { HelpModal } from '../components/HelpModal';

const LessonPage: React.FC = () => {
    const { algorithm } = useParams<{ algorithm: string }>();

    // Default algorithm if none provided
    const currentAlgorithm = algorithm || 'linearRegression';

    // Initial parameters
    const [params, setParams] = useState({
        lr: 0.01,
        nIter: 100,
        C: 1.0, // For SVM
    });

    // Fixed dataset mapping
    const getDatasetForAlgorithm = (algo: string) => {
        if (algo === 'linearRegression') return 'linear';
        if (algo === 'svm') return 'blobs';
        return 'iris-2d'; // logisticRegression
    };

    // Initial dataset
    const [dataset, setDataset] = useState(getDatasetForAlgorithm(currentAlgorithm));

    // Update dataset automatically if algorithm changes
    React.useEffect(() => {
        const newDataset = getDatasetForAlgorithm(currentAlgorithm);
        if (dataset !== newDataset) {
            handleDatasetChange(newDataset);
        }
    }, [currentAlgorithm]);

    // Code panel state
    const [codePanelExpanded, setCodePanelExpanded] = useState(false);

    // Help modal state
    const [helpModalOpen, setHelpModalOpen] = useState(false);

    // Training controller hook
    const [trainingState, controls] = useTrainingController(
        currentAlgorithm,
        dataset,
        params
    );

    // Handle parameter changes
    const handleParamsChange = (newParams: Partial<typeof params>) => {
        const updatedParams = { ...params, ...newParams };
        setParams(updatedParams);
        controls.updateParams(updatedParams);
    };

    // Handle dataset changes
    const handleDatasetChange = React.useCallback((newDataset: string) => {
        setDataset(newDataset);
        controls.changeDataset(newDataset);
    }, [controls]);

    // Handle play/pause toggle for keyboard shortcut
    const handlePlayPause = () => {
        if (trainingState.isPlaying) {
            controls.pause();
        } else {
            controls.play();
        }
    };

    // Handle code panel toggle
    const handleToggleCodePanel = () => {
        setCodePanelExpanded(!codePanelExpanded);
    };

    // Handle help modal toggle
    const handleToggleHelp = () => {
        setHelpModalOpen(!helpModalOpen);
    };

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onPlayPause: handlePlayPause,
        onStep: controls.step,
        onReset: controls.reset,
        onToggleCodePanel: handleToggleCodePanel,
        onToggleHelp: handleToggleHelp,
        enabled: true,
    });

    // Get current iteration from engine state
    const currentIteration = trainingState.engineState?.iteration || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto">
                {/* Three-panel layout: Requirements 6.1, 6.2 */}
                {/* Desktop: side-by-side, Mobile: stacked */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left panel: Concept explanation - Requirements 6.1 */}
                    <aside
                        className="lg:col-span-1"
                        aria-label="Lesson concept and explanation"
                    >
                        <ConceptPanel algorithm={currentAlgorithm} />
                    </aside>

                    {/* Right panel: Visualization and controls - Requirements 6.3, 6.4 */}
                    <main
                        className="lg:col-span-2 space-y-6"
                        aria-label="Interactive visualization and controls"
                    >
                        {/* Parameter controls and dataset selector */}
                            <ParameterControls
                                algorithm={currentAlgorithm}
                                params={params}
                                isPlaying={trainingState.isPlaying}
                                onParamsChange={handleParamsChange}
                                onPause={controls.pause}
                            />

                        {/* Visualization panel with Canvas, Loss Curve, and Controls */}
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
                        />
                    </main>
                </div>

                {/* Bottom panel: Code panel - Requirements 6.1 */}
                <section
                    className="w-full"
                    aria-label="Algorithm source code"
                >
                    <CodePanel
                        algorithm={currentAlgorithm}
                        isExpanded={codePanelExpanded}
                        onToggle={handleToggleCodePanel}
                    />
                </section>

                {/* Error display if present - Requirements 12.1, 12.2, 12.3, 12.4, 12.5 */}
                {trainingState.error && (
                    <Toast
                        message={trainingState.error}
                        onDismiss={controls.clearError}
                        type="error"
                    />
                )}

                {/* Help modal for keyboard shortcuts */}
                <HelpModal
                    isOpen={helpModalOpen}
                    onClose={() => setHelpModalOpen(false)}
                />
            </div>
        </div>
    );
};

export default LessonPage;
