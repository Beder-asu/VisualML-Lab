/**
 * LossCurve.test.tsx — Unit tests for loss curve visualization
 * 
 * Tests loss history appending, history clearing on reset, and downsampling logic.
 * Requirements: 4.2, 4.4, 4.5
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LossCurve from '../LossCurve';

describe('LossCurve', () => {
    // ---------------------------------------------------------------------------
    // Rendering tests
    // ---------------------------------------------------------------------------

    it('renders without crashing with empty loss history', () => {
        const { container } = render(<LossCurve lossHistory={[]} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with default dimensions when not specified', () => {
        const { container } = render(<LossCurve lossHistory={[1.0, 0.8, 0.6]} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '400');
        expect(svg).toHaveAttribute('height', '200');
    });

    it('renders with custom dimensions when specified', () => {
        const { container } = render(
            <LossCurve lossHistory={[1.0, 0.8, 0.6]} width={600} height={300} />
        );
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '600');
        expect(svg).toHaveAttribute('height', '300');
    });

    it('renders SVG with chart group', () => {
        const { container } = render(<LossCurve lossHistory={[1.0, 0.8, 0.6]} />);
        const chartGroup = container.querySelector('.chart-group');
        expect(chartGroup).toBeInTheDocument();
    });

    // ---------------------------------------------------------------------------
    // Loss history appending (Requirement 4.2)
    // ---------------------------------------------------------------------------

    it('displays all loss values from history', () => {
        const lossHistory = [1.0, 0.8, 0.6, 0.4, 0.2];
        const { container } = render(<LossCurve lossHistory={lossHistory} />);

        // Check that data points are rendered for each loss value
        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(lossHistory.length);
    });

    it('updates visualization when loss history grows', () => {
        const { container, rerender } = render(<LossCurve lossHistory={[1.0]} />);

        let points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(1);

        // Append new loss value
        rerender(<LossCurve lossHistory={[1.0, 0.8]} />);

        points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(2);

        // Append another loss value
        rerender(<LossCurve lossHistory={[1.0, 0.8, 0.6]} />);

        points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(3);
    });

    it('renders loss curve line when history has data', () => {
        const { container } = render(<LossCurve lossHistory={[1.0, 0.8, 0.6]} />);

        const lossCurveLine = container.querySelector('.loss-line');
        expect(lossCurveLine).toBeInTheDocument();
        expect(lossCurveLine).toHaveAttribute('d'); // Has path data
    });

    it('handles single loss value', () => {
        const { container } = render(<LossCurve lossHistory={[0.5]} />);

        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(1);

        const lossCurveLine = container.querySelector('.loss-line');
        expect(lossCurveLine).toBeInTheDocument();
    });

    // ---------------------------------------------------------------------------
    // History clearing on reset (Requirement 4.4)
    // ---------------------------------------------------------------------------

    it('clears visualization when loss history is reset to empty', () => {
        const { container, rerender } = render(
            <LossCurve lossHistory={[1.0, 0.8, 0.6, 0.4]} />
        );

        let points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(4);

        // Reset to empty history
        rerender(<LossCurve lossHistory={[]} />);

        points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(0);
    });

    it('starts fresh after reset', () => {
        const { container, rerender } = render(
            <LossCurve lossHistory={[1.0, 0.8, 0.6]} />
        );

        let points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(3);

        // Reset
        rerender(<LossCurve lossHistory={[]} />);

        points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(0);

        // Start fresh with new data
        rerender(<LossCurve lossHistory={[2.0, 1.5]} />);

        points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(2);
    });

    // ---------------------------------------------------------------------------
    // Downsampling for large histories (Requirement 4.5)
    // ---------------------------------------------------------------------------

    it('handles large loss histories without performance issues', () => {
        // Create a large history (200 points)
        const largeLossHistory = Array.from({ length: 200 }, (_, i) => 1.0 - i * 0.005);

        const { container } = render(<LossCurve lossHistory={largeLossHistory} />);

        // Should render all points (downsampling happens in the controller, not the component)
        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(200);
    });

    it('maintains readability with many data points', () => {
        // Create history with 150 points
        const lossHistory = Array.from({ length: 150 }, (_, i) => 1.0 - i * 0.006);

        const { container } = render(<LossCurve lossHistory={lossHistory} />);

        // Verify axes are still rendered
        const xAxisLabels = container.querySelectorAll('.x-axis-labels text');
        const yAxisLabels = container.querySelectorAll('.y-axis-labels text');

        expect(xAxisLabels.length).toBeGreaterThan(0);
        expect(yAxisLabels.length).toBeGreaterThan(0);

        // Verify loss line is rendered
        const lossCurveLine = container.querySelector('.loss-line');
        expect(lossCurveLine).toBeInTheDocument();
    });

    // ---------------------------------------------------------------------------
    // Axis rendering (Requirement 4.3)
    // ---------------------------------------------------------------------------

    it('displays iteration number on x-axis', () => {
        const { container } = render(<LossCurve lossHistory={[1.0, 0.8, 0.6, 0.4]} />);

        // Check for x-axis label
        const xAxisLabel = Array.from(container.querySelectorAll('text')).find(
            el => el.textContent === 'Iteration'
        );
        expect(xAxisLabel).toBeInTheDocument();
    });

    it('displays loss value on y-axis', () => {
        const { container } = render(<LossCurve lossHistory={[1.0, 0.8, 0.6, 0.4]} />);

        // Check for y-axis label
        const yAxisLabel = Array.from(container.querySelectorAll('text')).find(
            el => el.textContent === 'Loss'
        );
        expect(yAxisLabel).toBeInTheDocument();
    });

    it('renders x-axis tick marks', () => {
        const { container } = render(<LossCurve lossHistory={[1.0, 0.8, 0.6, 0.4, 0.2]} />);

        const xAxisTicks = container.querySelectorAll('.x-axis line');
        expect(xAxisTicks.length).toBeGreaterThan(0);
    });

    it('renders y-axis tick marks', () => {
        const { container } = render(<LossCurve lossHistory={[1.0, 0.8, 0.6, 0.4, 0.2]} />);

        const yAxisTicks = container.querySelectorAll('.y-axis line');
        expect(yAxisTicks.length).toBeGreaterThan(0);
    });

    // ---------------------------------------------------------------------------
    // Auto-scaling y-axis (Design requirement)
    // ---------------------------------------------------------------------------

    it('auto-scales y-axis based on loss range', () => {
        const { container, rerender } = render(
            <LossCurve lossHistory={[1.0, 0.9, 0.8]} />
        );

        let yAxisLabels = container.querySelectorAll('.y-axis-labels text');
        const firstLabels = Array.from(yAxisLabels).map(el => el.textContent);

        // Change to different loss range
        rerender(<LossCurve lossHistory={[5.0, 4.5, 4.0]} />);

        yAxisLabels = container.querySelectorAll('.y-axis-labels text');
        const secondLabels = Array.from(yAxisLabels).map(el => el.textContent);

        // Labels should be different due to auto-scaling
        expect(firstLabels).not.toEqual(secondLabels);
    });

    it('handles all losses being the same value', () => {
        const { container } = render(<LossCurve lossHistory={[0.5, 0.5, 0.5, 0.5]} />);

        // Should still render without errors
        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(4);

        const lossCurveLine = container.querySelector('.loss-line');
        expect(lossCurveLine).toBeInTheDocument();
    });

    it('handles very small loss values', () => {
        const { container } = render(
            <LossCurve lossHistory={[0.001, 0.0008, 0.0006, 0.0004]} />
        );

        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(4);

        const yAxisLabels = container.querySelectorAll('.y-axis-labels text');
        expect(yAxisLabels.length).toBeGreaterThan(0);
    });

    it('handles very large loss values', () => {
        const { container } = render(
            <LossCurve lossHistory={[1000, 800, 600, 400]} />
        );

        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(4);

        const yAxisLabels = container.querySelectorAll('.y-axis-labels text');
        expect(yAxisLabels.length).toBeGreaterThan(0);
    });

    // ---------------------------------------------------------------------------
    // Edge cases
    // ---------------------------------------------------------------------------

    it('handles negative loss values gracefully', () => {
        const { container } = render(<LossCurve lossHistory={[-1.0, -0.5, 0.0, 0.5]} />);

        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(4);
    });

    it('handles decreasing then increasing loss values', () => {
        const { container } = render(
            <LossCurve lossHistory={[1.0, 0.5, 0.3, 0.4, 0.6]} />
        );

        const points = container.querySelectorAll('.loss-points circle');
        expect(points).toHaveLength(5);

        const lossCurveLine = container.querySelector('.loss-line');
        expect(lossCurveLine).toBeInTheDocument();
    });
});
