/**
 * StatusIndicator.tsx — Training status display
 * 
 * Displays current training status with iteration count and convergence messages.
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { CheckCircle, Loader2, Pause, Play } from 'lucide-react';

interface StatusIndicatorProps {
    isPlaying: boolean;
    isPaused: boolean;
    isConverged: boolean;
    iteration?: number;
    maxIterations?: number;
}

export function StatusIndicator({
    isPlaying,
    isPaused,
    isConverged,
    iteration = 0,
    maxIterations,
}: StatusIndicatorProps) {
    // Determine status message and styling
    let statusText: string;
    let statusColor: string;
    let Icon: React.ComponentType<{ className?: string }>;

    if (isConverged) {
        // Requirements 9.3: Display "Converged" message with success indicator
        statusText = 'Converged';
        statusColor = 'text-green-600 bg-green-50 border-green-200';
        Icon = CheckCircle;
    } else if (isPlaying) {
        // Requirements 9.1: Display "Training..." with iteration count
        statusText = `Training... (Iteration ${iteration}${maxIterations ? `/${maxIterations}` : ''})`;
        statusColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
        Icon = Loader2;
    } else if (isPaused && iteration > 0) {
        // Requirements 9.2: Display "Paused" indicator
        statusText = `Paused (Iteration ${iteration}${maxIterations ? `/${maxIterations}` : ''})`;
        statusColor = 'text-gray-600 bg-gray-50 border-gray-200';
        Icon = Pause;
    } else {
        // Requirements 9.4: Display "Ready to train" message
        statusText = 'Ready to train';
        statusColor = 'text-gray-600 bg-gray-50 border-gray-200';
        Icon = Play;
    }

    return (
        <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusColor} transition-colors duration-100`}
            role="status"
            aria-live="polite"
        >
            <Icon
                className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`}
                aria-hidden="true"
            />
            <span className="text-sm font-medium">{statusText}</span>
        </div>
    );
}
