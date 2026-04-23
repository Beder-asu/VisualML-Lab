/**
 * TreeParameterControls.tsx — Parameter controls for Decision Tree
 * 
 * Renders sliders and dropdown for tree configuration.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TreeParams {
    maxDepth: number;        // 1-8
    criterion: 'gini' | 'entropy';
    minSamplesSplit: number; // 2-20
}

interface TreeParameterControlsProps {
    params: TreeParams;
    isBuilding: boolean;
    onParamsChange: (newParams: Partial<TreeParams>) => void;
    onPause: () => void;
}

export function TreeParameterControls({
    params,
    isBuilding,
    onParamsChange,
    onPause,
}: TreeParameterControlsProps) {
    const [localParams, setLocalParams] = useState<TreeParams>(params);
    const debounceTimerRef = useRef<number | null>(null);

    // Update local params when props change
    useEffect(() => {
        setLocalParams(params);
    }, [params]);

    /**
     * Debounced parameter change handler (100ms)
     * Pauses building before updating params (Requirements 2.5)
     */
    const handleParamChange = useCallback(
        (key: keyof TreeParams, value: number | string) => {
            // Update local state immediately for responsive UI
            setLocalParams((prev) => ({ ...prev, [key]: value }));

            // Clear existing timer
            if (debounceTimerRef.current !== null) {
                clearTimeout(debounceTimerRef.current);
            }

            // Debounce the actual param update
            debounceTimerRef.current = window.setTimeout(() => {
                // Pause if building (Requirements 2.5)
                if (isBuilding) {
                    onPause();
                }

                // Trigger param update and reset
                onParamsChange({ [key]: value });
            }, 100);
        },
        [isBuilding, onParamsChange, onPause]
    );

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current !== null) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return (
        <div
            className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            role="group"
            aria-labelledby="tree-parameter-controls-heading"
        >
            <h3
                id="tree-parameter-controls-heading"
                className="text-sm font-semibold text-gray-700 uppercase tracking-wide"
            >
                Tree Parameters
            </h3>

            {/* Max Depth Slider - Requirements 2.1, 2.4 */}
            <div className="space-y-2 pb-2">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="param-maxDepth"
                        className="text-sm font-medium text-gray-800"
                    >
                        Max Depth
                    </label>
                    <span
                        className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {localParams.maxDepth}
                    </span>
                </div>
                <input
                    id="param-maxDepth"
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={localParams.maxDepth}
                    onChange={(e) =>
                        handleParamChange('maxDepth', parseInt(e.target.value, 10))
                    }
                    disabled={isBuilding}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Max Depth: ${localParams.maxDepth}`}
                    aria-valuemin={1}
                    aria-valuemax={8}
                    aria-valuenow={localParams.maxDepth}
                />
            </div>

            {/* Criterion Dropdown - Requirements 2.2, 2.4 */}
            <div className="space-y-2 pb-2">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="param-criterion"
                        className="text-sm font-medium text-gray-800"
                    >
                        Split Criterion
                    </label>
                </div>
                <select
                    id="param-criterion"
                    value={localParams.criterion}
                    onChange={(e) =>
                        handleParamChange('criterion', e.target.value as 'gini' | 'entropy')
                    }
                    disabled={isBuilding}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Split Criterion: ${localParams.criterion}`}
                >
                    <option value="gini">Gini Impurity</option>
                    <option value="entropy">Entropy</option>
                </select>
            </div>

            {/* Min Samples Split Slider - Requirements 2.3, 2.4 */}
            <div className="space-y-2 pb-2">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="param-minSamplesSplit"
                        className="text-sm font-medium text-gray-800"
                    >
                        Min Samples Split
                    </label>
                    <span
                        className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {localParams.minSamplesSplit}
                    </span>
                </div>
                <input
                    id="param-minSamplesSplit"
                    type="range"
                    min={2}
                    max={20}
                    step={1}
                    value={localParams.minSamplesSplit}
                    onChange={(e) =>
                        handleParamChange('minSamplesSplit', parseInt(e.target.value, 10))
                    }
                    disabled={isBuilding}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Min Samples Split: ${localParams.minSamplesSplit}`}
                    aria-valuemin={2}
                    aria-valuemax={20}
                    aria-valuenow={localParams.minSamplesSplit}
                />
            </div>
        </div>
    );
}
