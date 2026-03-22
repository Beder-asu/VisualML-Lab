/**
 * PlaybackControls.tsx — Playback control buttons
 * 
 * Renders play, pause, step, and reset buttons with keyboard shortcut support.
 * Implements fast-forwarding functionality on holding the Step button.
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { useRef, useCallback, useEffect } from 'react';

interface PlaybackControlsProps {
    engineState?: any;
    isPlaying: boolean;
    isPaused: boolean;
    isConverged: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
}

export function PlaybackControls({
    engineState,
    isPlaying,
    isConverged,
    onPlay,
    onPause,
    onStep,
    onReset,
}: PlaybackControlsProps) {
    const holdTimerRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const isHoldingRef = useRef(false);

    const stopFastForward = useCallback(() => {
        if (holdTimerRef.current !== null) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        // Delay resetting the holding flag briefly to ensure the subsequent onClick gets blocked
        setTimeout(() => {
            isHoldingRef.current = false;
        }, 50);
    }, []);

    const handleStepDown = useCallback(() => {
        if (isPlaying || isConverged) return;
        
        isHoldingRef.current = false;
        
        // Start hold timer (Wait 400ms to consider it a "hold")
        holdTimerRef.current = window.setTimeout(() => {
            isHoldingRef.current = true;
            // Initiate rapid fire stepping
            intervalRef.current = window.setInterval(() => {
                onStep();
            }, 60); // fast-forward speed
        }, 400);
    }, [isPlaying, isConverged, onStep]);

    const handleStepClick = useCallback(() => {
        if (isPlaying || isConverged) return;
        if (!isHoldingRef.current) {
            onStep();
        }
    }, [isPlaying, isConverged, onStep]);

    // Safety cleanup to stop interval if component unmounts OR if training converges naturally
    useEffect(() => {
        if (isPlaying || isConverged) {
            stopFastForward();
        }
        return stopFastForward;
    }, [isPlaying, isConverged, stopFastForward]);

    return (
        <div
            className="flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            role="group"
            aria-label="Training playback controls"
        >
            {/* Play Button - Requirements 1.1 */}
            <button
                onClick={onPlay}
                disabled={isPlaying || isConverged}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Play training (Spacebar)"
                title="Play (Space)"
            >
                <Play className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Pause Button - Requirements 1.2 */}
            <button
                onClick={onPause}
                disabled={!isPlaying}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Pause training (Spacebar)"
                title="Pause (Space)"
            >
                <Pause className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Step Button - Requirements 1.3 */}
            <button
                onClick={handleStepClick}
                onMouseDown={handleStepDown}
                onMouseUp={stopFastForward}
                onMouseLeave={stopFastForward}
                onTouchStart={handleStepDown}
                onTouchEnd={stopFastForward}
                onContextMenu={(e) => e.preventDefault()}
                disabled={isPlaying || isConverged}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 select-none"
                aria-label="Step once (Right Arrow)"
                title="Step / Fast-Forward (Right Arrow)"
            >
                <SkipForward className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Reset Button - Requirements 1.4 */}
            <button
                onClick={onReset}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Reset training (R key)"
                title="Reset (R)"
            >
                <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Weights and Bias Display */}
            {engineState?.weights && (
                <div className="ml-auto flex items-center text-sm font-mono text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-200 shadow-inner overflow-x-auto whitespace-nowrap">
                    <span className="mr-4">
                        <span className="text-gray-400 select-none mr-1">W:</span>
                        [{engineState.weights.map((w: number) => w.toFixed(3)).join(', ')}]
                    </span>
                    <span>
                        <span className="text-gray-400 select-none mr-1">b:</span>
                        {engineState.bias !== undefined && engineState.bias !== null ? engineState.bias.toFixed(3) : '0.000'}
                    </span>
                </div>
            )}
        </div>
    );
}
