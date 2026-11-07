/**
 * VisualizationPanel.tsx — Wrapper component for visualization elements
 * 
 * Combines Canvas2D, LossCurve, PlaybackControls, and StatusIndicator
 * into a consistent layout for all lessons.
 * Requirements: 6.3, 6.4
 */

import Canvas2D from './Canvas2D';
import LossCurve from './LossCurve';
import { PlaybackControls } from './PlaybackControls';
import { StatusIndicator } from './StatusIndicator';
import SigmoidCurve from './SigmoidCurve';
import { useState } from 'react';
import { useElementSize } from '../hooks/useElementSize';

interface VisualizationPanelProps {
    // Training state
    engineState: any | null;
    lossHistory: number[];
    isPlaying: boolean;
    isPaused: boolean;
    isConverged: boolean;
    iteration?: number;
    maxIterations?: number;

    // Control handlers
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    speedMs: number;
    onSpeedChange: (ms: number) => void;
}

export function VisualizationPanel({
    engineState,
    lossHistory,
    isPlaying,
    isPaused,
    isConverged,
    iteration = 0,
    maxIterations,
    onPlay,
    onPause,
    onStep,
    onReset,
    speedMs,
    onSpeedChange,
}: VisualizationPanelProps) {
    const [logRegView, setLogRegView] = useState<'scatter' | 'heatmap' | 'sigmoid'>('scatter');
    const [modelRef, { width: modelWidth }] = useElementSize();
    const [lossRef, { width: lossWidth }] = useElementSize();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Status indicator at the top */}
            <StatusIndicator
                isPlaying={isPlaying}
                isPaused={isPaused}
                isConverged={isConverged}
                iteration={iteration}
                maxIterations={maxIterations}
            />

            {/* Playback controls */}
            <div id="playback-controls">
                <PlaybackControls
                    engineState={engineState}
                    isPlaying={isPlaying}
                    isPaused={isPaused}
                    isConverged={isConverged}
                    speedMs={speedMs}
                    onPlay={onPlay}
                    onPause={onPause}
                    onStep={onStep}
                    onReset={onReset}
                    onSpeedChange={onSpeedChange}
                />
            </div>

            {/* Main visualization area with Canvas and Loss Curve side by side */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-6">
                {/* Canvas visualization OR Sigmoid Curve */}
                <div className="flex min-w-0 flex-col items-center relative w-full h-full">
                    <div className="flex flex-wrap gap-2 w-full justify-between items-center mb-3 px-2">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            {engineState?.algorithm === 'logisticRegression' && logRegView === 'sigmoid' ? 'Sigmoid Concept Curve' : 'Data Visualization'}
                        </h3>
                        {engineState?.algorithm === 'logisticRegression' && (
                            <select
                                aria-label="Visualization view"
                                className="min-w-0 max-w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 text-gray-700"
                                value={logRegView}
                                onChange={(e) => setLogRegView(e.target.value as any)}
                            >
                                <option value="scatter">2D Scatter Boundary</option>
                                <option value="heatmap">2D Probability Heatmap</option>
                                <option value="sigmoid">1D Sigmoid Curve</option>
                            </select>
                        )}
                    </div>
                    <div ref={modelRef} className="w-full max-w-[400px] min-h-[240px]">
                        {modelWidth > 0 && (engineState?.algorithm === 'logisticRegression' && logRegView === 'sigmoid' ? (
                            <SigmoidCurve state={engineState} width={modelWidth} height={Math.max(240, modelWidth)} />
                        ) : (
                            <Canvas2D
                                state={engineState}
                                width={modelWidth}
                                height={Math.max(240, modelWidth)}
                                showGrid={true}
                                viewMode={logRegView === 'heatmap' ? 'heatmap' : 'scatter'}
                            />
                        ))}
                    </div>
                </div>

                {/* Loss curve */}
                <div className="flex min-w-0 flex-col items-center">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Loss Over Time
                    </h3>
                    <div ref={lossRef} className="w-full max-w-[400px] min-h-[240px]">
                        {lossWidth > 0 && (
                            <LossCurve
                                lossHistory={lossHistory}
                                startIteration={Math.max(1, iteration - lossHistory.length + 1)}
                                width={lossWidth}
                                height={Math.max(240, lossWidth)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
