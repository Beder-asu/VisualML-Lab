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

type FeedbackType = 'info' | 'warning' | 'success' | 'error';

interface Feedback {
    message: string;
    type: FeedbackType;
}

type FeedbackTier = {
    max: number;
    message: string;
    type: FeedbackType;
};

/**
 * Returns the first tier where value <= max, falling back to the last tier.
 */
function getFeedbackForValue(tiers: FeedbackTier[], value: number): Feedback {
    for (const tier of tiers) {
        if (value <= tier.max) {
            return { message: tier.message, type: tier.type };
        }
    }
    const last = tiers[tiers.length - 1];
    return { message: last.message, type: last.type };
}

interface SliderConfig {
    key: keyof Params;
    label: string;
    min: number;
    max: number;
    step: number;
    format?: (value: number) => string;
    feedbackTiers?: FeedbackTier[];
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
                    max: 1.00,
                    step: 0.01,
                    format: (v) => v.toFixed(2),
                    feedbackTiers: [
                        { max: 0.049, message: 'Learning rate is extremely low. The model will take a very long time to learn. Keep it here to observe underfitting.', type: 'warning' },
                        { max: 0.5, message: 'Safe learning rate. The model converges efficiently. Tune within this range to find the sweetest and most effective spot.', type: 'success' },
                        { max: 0.8, message: 'Aggressive learning rate. The model learns faster but might oscillate around the minimum. Watch the loss curve bounce.', type: 'info' },
                        { max: Infinity, message: 'Dangerously high learning rate! The model will overshoot optimal weights and may diverge.', type: 'error' },
                    ],
                },
                {
                    key: 'nIter',
                    label: 'Max Iterations',
                    min: 10,
                    max: 500,
                    step: 10,
                    feedbackTiers: [
                        { max: 49, message: 'Too few iterations. The model might stop before it properly learns the patterns.', type: 'warning' },
                        { max: 200, message: 'Good balance of training time and convergence. Tune within this range to find the sweetest and most effective spot.', type: 'success' },
                        { max: Infinity, message: 'High iteration count allows for deep convergence, but might be unnecessary if the loss has already flattened out.', type: 'info' },
                    ],
                },
            ];
        case 'logisticRegression':
            return [
                {
                    key: 'lr',
                    label: 'Learning Rate',
                    min: 0.01,
                    max: 1.00,
                    step: 0.01,
                    format: (v) => v.toFixed(2),
                    feedbackTiers: [
                        { max: 0.099, message: 'Low learning rate. The decision boundary will move very slowly.', type: 'warning' },
                        { max: 0.5, message: 'Optimal range for stable, visible convergence. Tune within this range to find the sweetest and most effective spot.', type: 'success' },
                        { max: 0.8, message: 'Aggressive learning rate. The boundary might jump quickly between epochs.', type: 'info' },
                        { max: Infinity, message: 'Very high learning rate! The boundary may oscillate without settling properly.', type: 'error' },
                    ],
                },
                {
                    key: 'nIter',
                    label: 'Max Iterations',
                    min: 10,
                    max: 2000,
                    step: 50,
                    feedbackTiers: [
                        { max: 199, message: 'Logistic regression often requires more steps to separate classes. Consider increasing.', type: 'warning' },
                        { max: 1000, message: 'Optimal range for observing the sigmoid boundary taking shape.', type: 'success' },
                        { max: Infinity, message: 'High iterations ensure a very sharp boundary if the classes are linearly separable.', type: 'info' },
                    ],
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
                    feedbackTiers: [
                        { max: 0.00499, message: 'Very precise but slow updates to the support vectors.', type: 'warning' },
                        { max: 0.05, message: 'Optimal learning rate for standard convergence.', type: 'success' },
                        { max: Infinity, message: 'Too high for SVM! The margins will oscillate rapidly and struggle to settle.', type: 'error' },
                    ],
                },
                {
                    key: 'nIter',
                    label: 'Max Iterations',
                    min: 10,
                    max: 1000,
                    step: 10,
                    feedbackTiers: [
                        { max: 199, message: 'Insufficient iterations to find the maximum margin.', type: 'warning' },
                        { max: 500, message: 'Standard training length for separating simple blobs.', type: 'success' },
                        { max: Infinity, message: 'Extended training ensures the margin is maximized perfectly.', type: 'info' },
                    ],
                },
                {
                    key: 'C',
                    label: 'C (Regularization)',
                    min: 0.01,
                    max: 50.00,
                    step: 0.01,
                    format: (v) => v.toFixed(2),
                    feedbackTiers: [
                        { max: 0.999, message: 'Low C (Soft Margin). The model tolerates misclassifications to keep a wide, generalized margin.', type: 'info' },
                        { max: 10.0, message: 'Balanced regularization. Aims for a solid margin with few misclassifications.', type: 'success' },
                        { max: Infinity, message: 'High C (Hard Margin). The model strictly penalizes misclassifications, leading to a narrower margin that might overfit outliers.', type: 'warning' },
                    ],
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
                const feedback = config.feedbackTiers ? getFeedbackForValue(config.feedbackTiers, value) : null;

                return (
                    <div key={config.key} className="space-y-2 pb-2">
                        <div className="flex justify-between items-center">
                            <label
                                htmlFor={`param-${config.key}`}
                                className="text-sm font-medium text-gray-800"
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
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            aria-label={`${config.label}: ${displayValue}`}
                            aria-valuemin={config.min}
                            aria-valuemax={config.max}
                            aria-valuenow={value}
                            aria-valuetext={String(displayValue)}
                        />
                        {feedback && (
                            <div className={`mt-2 p-2.5 text-xs rounded-md border-l-4 bg-gray-50 flex items-start gap-2 ${feedback.type === 'info' ? 'border-blue-500 text-blue-800' :
                                feedback.type === 'success' ? 'border-green-500 text-green-800' :
                                    feedback.type === 'warning' ? 'border-yellow-500 text-yellow-800' :
                                        'border-red-500 text-red-800'
                                }`}>
                                <span className="mt-0.5 text-sm">
                                    {feedback.type === 'info' && '💡'}
                                    {feedback.type === 'success' && '✅'}
                                    {feedback.type === 'warning' && '⚠️'}
                                    {feedback.type === 'error' && '🚨'}
                                </span>
                                <span className="leading-relaxed font-medium">{feedback.message}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
