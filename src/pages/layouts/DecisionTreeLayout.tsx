/**
 * DecisionTreeLayout.tsx — Layout for Decision Tree visualization
 * 
 * Implements the lesson page layout for decision tree algorithm.
 * Uses BaseLayout with tree-specific controls and dual-panel visualization.
 * Requirements: 10.1, 10.2, 10.3
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTreeController, TreeParams } from '../../hooks/useTreeController';
import { useLayoutError, useCodePanelState } from '../../hooks/useLayoutHooks';
import { getDefaultDataset } from '../../utils/layoutUtils';
import { TreeParameterControls } from '../../components/TreeParameterControls';
import { StatusIndicator } from '../../components/StatusIndicator';
import { PlaybackControls } from '../../components/PlaybackControls';
import TreeDiagram from '../../components/TreeDiagram';
import DecisionRegions from '../../components/DecisionRegions';
import { TreeStatistics } from '../../components/TreeStatistics';
import { ResponsiveWrapper } from '../../components/ResponsiveWrapper';
import { BaseLayout } from '../../components/BaseLayout';

interface DecisionTreeLayoutProps {
    algorithm: 'decisionTree';
}

export const DecisionTreeLayout: React.FC<DecisionTreeLayoutProps> = ({ algorithm }) => {
    // State management - Requirements: 10.1

    // Initial parameters for decision tree
    const [params, setParams] = useState<TreeParams>({
        maxDepth: 3,
        criterion: 'gini',
        minSamplesSplit: 2,
    });

    // Dataset state - use getDefaultDataset utility
    const [dataset] = useState(getDefaultDataset(algorithm));

    // Playback speed state (ms per step; default 500ms)
    const [speedMs, setSpeedMs] = useState(500);

    // Shared hooks - Requirements: 10.1, 10.4
    const { error, clearError } = useLayoutError();
    const {
        isExpanded: codePanelExpanded,
        toggle: toggleCodePanel
    } = useCodePanelState(false);

    // Help modal state
    const [helpModalOpen, setHelpModalOpen] = useState(false);

    // Highlight state management - Requirements: 5.1, 5.2, 5.3
    const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
    const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);

    // Zoom/pan state management - Requirements: 6.1, 6.2, 6.3, 6.4
    // Note: TreeDiagram manages its own zoom/pan state internally
    const [zoomLevel] = useState(1.0);
    const [panOffset] = useState({ x: 0, y: 0 });

    // Tree controller hook - Requirements: 1.1, 1.2, 1.3, 1.4
    const [treeState, controls] = useTreeController(
        algorithm,
        dataset,
        params,
        speedMs
    );

    // Parameter change handler - Requirements: 2.1, 2.2, 2.3, 2.5
    const handleParamsChange = useCallback((newParams: Partial<TreeParams>) => {
        // Pause building if active (handled by TreeParameterControls)
        const updatedParams = { ...params, ...newParams };
        setParams(updatedParams);
        // Call controls.updateParams to reset tree with new params
        controls.updateParams(updatedParams);
    }, [params, controls]);

    // Highlight handlers - Requirements: 5.1, 5.2, 5.3
    const handleNodeHover = useCallback((nodeId: string | null) => {
        setHighlightedNode(nodeId);
        // Sync with region highlight
        if (nodeId) {
            setHighlightedRegion(nodeId);
        }
    }, []);

    const handleRegionHover = useCallback((regionId: string | null) => {
        setHighlightedRegion(regionId);
        // Sync with node highlight
        if (regionId) {
            setHighlightedNode(regionId);
        }
    }, []);

    // Keyboard shortcut handlers - Requirements: 10.2
    const handlePlayPause = useCallback(() => {
        if (treeState.isBuilding) {
            controls.pause();
        } else {
            controls.play();
        }
    }, [treeState.isBuilding, controls]);

    const handleToggleHelp = useCallback(() => {
        setHelpModalOpen(!helpModalOpen);
    }, [helpModalOpen]);

    // Controls slot content - Requirements: 2.1, 2.2, 2.3
    const controlsSlot = useMemo(() => (
        <TreeParameterControls
            params={params}
            isBuilding={treeState.isBuilding}
            onParamsChange={handleParamsChange}
            onPause={controls.pause}
        />
    ), [params, treeState.isBuilding, handleParamsChange, controls.pause]);

    // Get current depth from tree state
    const currentDepth = treeState.treeState?.currentDepth || 0;
    const maxDepth = params.maxDepth;

    // Visualization slot content - Requirements: 3.1, 3.2, 4.1, 4.2
    const visualizationSlot = useMemo(() => (
        <div className="space-y-6">
            {/* Status Indicator - shows current tree building state */}
            <StatusIndicator
                isPlaying={treeState.isBuilding}
                isPaused={treeState.isPaused}
                isConverged={treeState.isComplete}
                currentDepth={currentDepth}
                maxDepth={maxDepth}
            />

            {/* Playback Controls - play, pause, step, reset buttons */}
            <PlaybackControls
                isPlaying={treeState.isBuilding}
                isPaused={treeState.isPaused}
                isConverged={treeState.isComplete}
                onPlay={controls.play}
                onPause={controls.pause}
                onStep={controls.step}
                onReset={controls.reset}
                speedMs={speedMs}
                onSpeedChange={setSpeedMs}
            />

            {/* Tree Statistics - Requirements: 9.1, 9.2, 9.3, 9.4, 9.5 */}
            <TreeStatistics treeState={treeState.treeState} />

            {/* TreeDiagram and DecisionRegions side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col flex-1 h-full">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Tree Structure
                    </h3>
                    <ResponsiveWrapper minHeight={400} className="w-full flex-1 min-h-[400px]">
                        {({ width, height }) => (
                            <TreeDiagram
                                treeData={treeState.treeState!}
                                currentDepth={currentDepth}
                                highlightedNode={highlightedNode}
                                onNodeHover={handleNodeHover}
                                zoom={zoomLevel}
                                pan={panOffset}
                                width={width}
                                height={height}
                            />
                        )}
                    </ResponsiveWrapper>
                </div>
                <div className="flex flex-col flex-1 h-full">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Decision Regions
                    </h3>
                    <ResponsiveWrapper minHeight={400} className="w-full flex-1 min-h-[400px]">
                        {({ width, height }) => (
                            <DecisionRegions
                                treeData={treeState.treeState}
                                dataset={treeState.treeState?.dataset || { X: [], y: [] }}
                                highlightedRegion={highlightedRegion}
                                onRegionHover={handleRegionHover}
                                width={width}
                                height={height}
                            />
                        )}
                    </ResponsiveWrapper>
                </div>
            </div>
        </div>
    ), [
        treeState.isBuilding,
        treeState.isPaused,
        treeState.isComplete,
        treeState.treeState,
        currentDepth,
        maxDepth,
        controls.play,
        controls.pause,
        controls.step,
        controls.reset,
        speedMs,
        highlightedNode,
        highlightedRegion,
        handleNodeHover,
        handleRegionHover,
        zoomLevel,
        panOffset,
    ]);

    // Memoize keyboard handlers to prevent unnecessary re-renders
    const keyboardHandlers = useMemo(() => ({
        onPlayPause: handlePlayPause,
        onStep: controls.step,
        onReset: controls.reset,
        onToggleCodePanel: toggleCodePanel,
        onToggleHelp: handleToggleHelp,
    }), [handlePlayPause, controls.step, controls.reset, toggleCodePanel, handleToggleHelp]);

    // Render BaseLayout with all slots and handlers - Requirements: 10.1, 10.2, 10.3
    return (
        <BaseLayout
            algorithm={algorithm}
            controlsSlot={controlsSlot}
            visualizationSlot={visualizationSlot}
            // Combine errors from layout and tree controller
            error={error || treeState.error}
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
