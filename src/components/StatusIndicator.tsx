/**
 * StatusIndicator.tsx — Training status display
 * 
 * Displays current training status with iteration count and convergence messages.
 * Requirements: 9.1, 9.2, 9.3, 9.4, 12.4
 */

import { CheckCircle, Loader2, Pause, Play } from 'lucide-react';

interface StatusIndicatorProps {
    isPlaying: boolean;
    isPaused?: boolean; // Optional for backward compatibility
    isConverged: boolean;
    iteration?: number;
    maxIterations?: number;
    // For tree-specific status
    currentDepth?: number;
    maxDepth?: number;
}

export function StatusIndicator({
    isPlaying,
    isConverged,
    iteration = 0,
    maxIterations,
    currentDepth,
    maxDepth,
}: StatusIndicatorProps) {
    // Determine status message and styling
    let statusText: string;
    let statusColor: string;
    let Icon: React.ComponentType<{ className?: string }>;
    let ariaLabel: string;

    // For tree visualization, use depth instead of iteration
    const displayValue = currentDepth !== undefined ? currentDepth : iteration;
    const displayMax = maxDepth !== undefined ? maxDepth : maxIterations;
    const displayLabel = currentDepth !== undefined ? 'Depth' : 'Iteration';

    if (isConverged) {
        // Requirements 9.3, 12.4: Display "Converged" or "Complete" message with success indicator
        const completeText = currentDepth !== undefined ? 'Complete' : 'Converged';
        statusText = completeText;
        statusColor = 'text-green-600 bg-green-50 border-green-200';
        Icon = CheckCircle;
        ariaLabel = `Training complete at ${displayLabel.toLowerCase()} ${displayValue}${displayMax ? ` of ${displayMax}` : ''}`;
    } else if (isPlaying) {
        // Requirements 9.1, 12.4: Display "Training..." or "Building..." with count
        const actionText = currentDepth !== undefined ? 'Building tree' : 'Training';
        statusText = `${actionText}... (${displayLabel} ${displayValue}${displayMax ? `/${displayMax}` : ''})`;
        statusColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
        Icon = Loader2;
        ariaLabel = `${actionText} in progress, ${displayLabel.toLowerCase()} ${displayValue}${displayMax ? ` of ${displayMax}` : ''}`;
    } else if (displayValue > 0) {
        // Requirements 9.2, 12.4: Display "Paused" indicator whenever steps have been taken
        statusText = `Paused (${displayLabel} ${displayValue}${displayMax ? `/${displayMax}` : ''})`;
        statusColor = 'text-gray-600 bg-gray-50 border-gray-200';
        Icon = Pause;
        ariaLabel = `Paused at ${displayLabel.toLowerCase()} ${displayValue}${displayMax ? ` of ${displayMax}` : ''}`;
    } else {
        // Requirements 9.4, 12.4: Display "Ready to train" or "Ready to build" message
        const readyText = currentDepth !== undefined ? 'Ready to build' : 'Ready to train';
        statusText = readyText;
        statusColor = 'text-gray-600 bg-gray-50 border-gray-200';
        Icon = Play;
        ariaLabel = readyText;
    }

    return (
        <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusColor} transition-colors duration-100`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={ariaLabel}
        >
            <Icon
                className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`}
                aria-hidden="true"
            />
            <span className="text-sm font-medium">{statusText}</span>
        </div>
    );
}
