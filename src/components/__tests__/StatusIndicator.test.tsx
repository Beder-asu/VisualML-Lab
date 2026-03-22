/**
 * StatusIndicator.test.tsx — Unit tests for status indicator
 * 
 * Tests status display for different training states.
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '../StatusIndicator';

describe('StatusIndicator', () => {
    // Requirements 9.4: Display "Ready to train" message
    it('displays "Ready to train" when in initial state', () => {
        render(
            <StatusIndicator
                isPlaying={false}
                isPaused={false}
                isConverged={false}
                iteration={0}
            />
        );

        expect(screen.getByText('Ready to train')).toBeInTheDocument();
    });

    // Requirements 9.1: Display "Training..." with iteration count
    it('displays "Training..." with iteration count when playing', () => {
        render(
            <StatusIndicator
                isPlaying={true}
                isPaused={false}
                isConverged={false}
                iteration={42}
            />
        );

        expect(screen.getByText(/Training\.\.\./)).toBeInTheDocument();
        expect(screen.getByText(/Iteration 42/)).toBeInTheDocument();
    });

    it('displays iteration count with max iterations when playing', () => {
        render(
            <StatusIndicator
                isPlaying={true}
                isPaused={false}
                isConverged={false}
                iteration={42}
                maxIterations={100}
            />
        );

        expect(screen.getByText(/Training\.\.\./)).toBeInTheDocument();
        expect(screen.getByText(/Iteration 42\/100/)).toBeInTheDocument();
    });

    // Requirements 9.2: Display "Paused" indicator
    it('displays "Paused" with iteration count when paused', () => {
        render(
            <StatusIndicator
                isPlaying={false}
                isPaused={true}
                isConverged={false}
                iteration={25}
            />
        );

        expect(screen.getByText(/Paused/)).toBeInTheDocument();
        expect(screen.getByText(/Iteration 25/)).toBeInTheDocument();
    });

    it('displays paused status with max iterations', () => {
        render(
            <StatusIndicator
                isPlaying={false}
                isPaused={true}
                isConverged={false}
                iteration={25}
                maxIterations={100}
            />
        );

        expect(screen.getByText(/Paused/)).toBeInTheDocument();
        expect(screen.getByText(/Iteration 25\/100/)).toBeInTheDocument();
    });

    // Requirements 9.3: Display "Converged" message with success indicator
    it('displays "Converged" when training is complete', () => {
        render(
            <StatusIndicator
                isPlaying={false}
                isPaused={false}
                isConverged={true}
                iteration={100}
            />
        );

        expect(screen.getByText('Converged')).toBeInTheDocument();
    });

    // Test ARIA attributes for accessibility
    it('has proper ARIA role and live region', () => {
        const { container } = render(
            <StatusIndicator
                isPlaying={true}
                isPaused={false}
                isConverged={false}
                iteration={10}
            />
        );

        const statusElement = container.querySelector('[role="status"]');
        expect(statusElement).toBeInTheDocument();
        expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    // Test styling classes for different states
    it('applies correct styling for training state', () => {
        const { container } = render(
            <StatusIndicator
                isPlaying={true}
                isPaused={false}
                isConverged={false}
                iteration={10}
            />
        );

        const statusElement = container.querySelector('[role="status"]');
        expect(statusElement).toHaveClass('text-indigo-600');
    });

    it('applies correct styling for converged state', () => {
        const { container } = render(
            <StatusIndicator
                isPlaying={false}
                isPaused={false}
                isConverged={true}
                iteration={100}
            />
        );

        const statusElement = container.querySelector('[role="status"]');
        expect(statusElement).toHaveClass('text-green-600');
    });

    it('applies correct styling for paused state', () => {
        const { container } = render(
            <StatusIndicator
                isPlaying={false}
                isPaused={true}
                isConverged={false}
                iteration={50}
            />
        );

        const statusElement = container.querySelector('[role="status"]');
        expect(statusElement).toHaveClass('text-gray-600');
    });

    it('applies correct styling for ready state', () => {
        const { container } = render(
            <StatusIndicator
                isPlaying={false}
                isPaused={false}
                isConverged={false}
                iteration={0}
            />
        );

        const statusElement = container.querySelector('[role="status"]');
        expect(statusElement).toHaveClass('text-gray-600');
    });
});
