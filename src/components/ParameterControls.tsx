/**
 * ParameterControls.tsx — Parameter slider controls
 * 
 * Renders dynamic sliders based on algorithm with debounced onChange handlers.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface Params {
    lr: number;
    nIter: number;
    C?: number; // For SVM
}

interface ParameterControlsProps {
    algorithm: string;
    params: Params;
    isPlaying: boolean;
    onParamsChange: (newParams: Partial<Params>) => void;
    onPause?: () => void;
}

interface SliderConfig {
    key: keyof Params;
    label: string;
    min: number;
    max: number;
    step: number;
    format?: (value: number) => string;
}

/**
 * Get slider configurations based on algorithm
 */
function getSliderConfigs(algorithm: string): SliderConfig[] {
    switch (algorithm) {
        case 'linearRegression':
            return [
                {
                    key: 'lr',
                    label: 'Learning Rate',
                    min: 0.01,
                    max: 2.50,
                    step: 0.01,
                    format: (v) => v.toFixed(2),
                },
                {
                    key: 'nIter',
                    label: 'Max Iterations',
                    min: 10,
                    max: 500,
                    step: 10,
                },
            ];
        case 'logisticRegression':
            return [
                {
                    key: 'lr',
                    label: 'Learning Rate',
                    min: 0.01,
                    max: 4.00,
                    step: 0.01,
                    format: (v) => v.toFixed(2),
                },
                {
                    key: 'nIter',
                    label: 'Max Iterations',
                    min: 10,
                    max: 2000,
                    step: 50,
                },
            ];
        case 'svm':
        default:
            return [
                {
                    key: 'lr',
                    label: 'Learning Rate',
                    min: 0.001,
                    max: 0.500,
                    step: 0.001,
                    format: (v) => v.toFixed(3),
                },
                {
                    key: 'nIter',
                    label: 'Max Iterations',
                    min: 10,
                    max: 1000,
                    step: 10,
                },
                {
                    key: 'C',
                    label: 'C (Regularization)',
                    min: 0.01,
                    max: 50.00,
                    step: 0.01,
                    format: (v) => v.toFixed(2),
                },
            ];
    }
}

export function ParameterControls({
    algorithm,
    params,
    isPlaying,
    onParamsChange,
    onPause,
}: ParameterControlsProps) {
    const [localParams, setLocalParams] = useState<Params>(params);
    const debounceTimerRef = useRef<number | null>(null);

    // Update local params when props change
    useEffect(() => {
        setLocalParams(params);
    }, [params]);

    /**
     * Debounced parameter change handler (100ms)
     * Requirements: 2.1, 2.2, 2.3, 2.5
     */
    const handleParamChange = useCallback(
        (key: keyof Params, value: number) => {
            // Update local state immediately for responsive UI
            setLocalParams((prev) => ({ ...prev, [key]: value }));

            // Clear existing timer
            if (debounceTimerRef.current !== null) {
                clearTimeout(debounceTimerRef.current);
            }

            // Debounce the actual param update
            debounceTimerRef.current = window.setTimeout(() => {
                // Pause if playing (Requirements 2.5)
                if (isPlaying && onPause) {
                    onPause();
                }

                // Trigger param update and reset
                onParamsChange({ [key]: value });
            }, 100);
        },
        [isPlaying, onParamsChange, onPause]
    );

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current !== null) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const sliderConfigs = getSliderConfigs(algorithm);

    return (
        <div
            className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            role="group"
            aria-labelledby="parameter-controls-heading"
        >
            <h3
                id="parameter-controls-heading"
                className="text-sm font-semibold text-gray-700 uppercase tracking-wide"
            >
                Parameters
            </h3>
            {sliderConfigs.map((config) => {
                const value = localParams[config.key] as number;
                const displayValue = config.format ? config.format(value) : value;

                return (
                    <div key={config.key} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label
                                htmlFor={`param-${config.key}`}
                                className="text-sm font-medium text-gray-600"
                            >
                                {config.label}
                            </label>
                            <span
                                className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {displayValue}
                            </span>
                        </div>
                        <input
                            id={`param-${config.key}`}
                            type="range"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={value}
                            onChange={(e) =>
                                handleParamChange(config.key, parseFloat(e.target.value))
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            aria-label={`${config.label}: ${displayValue}`}
                            aria-valuemin={config.min}
                            aria-valuemax={config.max}
                            aria-valuenow={value}
                            aria-valuetext={String(displayValue)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
