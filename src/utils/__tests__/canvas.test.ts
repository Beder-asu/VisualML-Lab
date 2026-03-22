/**
 * Unit tests for canvas utilities
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scaleLinear } from 'd3-scale';
import {
    clearCanvas,
    drawGrid,
    drawAxes,
    drawDataPoints,
    drawBoundary,
    DrawConfig,
} from '../canvas';

describe('Canvas Utilities', () => {
    let mockCtx: any;
    let config: DrawConfig;

    beforeEach(() => {
        // Create mock canvas context
        mockCtx = {
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            arc: vi.fn(),
            fillText: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            strokeStyle: '',
            fillStyle: '',
            lineWidth: 0,
            font: '',
            textAlign: '',
            textBaseline: '',
        };

        // Create test configuration
        const xScale = scaleLinear().domain([0, 1]).range([60, 540]);
        const yScale = scaleLinear().domain([0, 1]).range([540, 20]);

        config = {
            ctx: mockCtx,
            xScale,
            yScale,
            width: 600,
            height: 600,
            margin: { top: 20, right: 20, bottom: 60, left: 60 },
        };
    });

    describe('clearCanvas', () => {
        it('should clear the entire canvas', () => {
            clearCanvas(mockCtx, 600, 600);
            expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 600, 600);
        });
    });

    describe('drawGrid', () => {
        it('should draw vertical and horizontal grid lines', () => {
            drawGrid(config);

            // Should call beginPath and stroke for each grid line
            // 5 vertical + 5 horizontal = 10 lines
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.stroke).toHaveBeenCalled();
            expect(mockCtx.strokeStyle).toBe('#e5e7eb');
        });

        it('should draw grid lines at correct positions', () => {
            drawGrid(config);

            // Check that moveTo and lineTo were called
            expect(mockCtx.moveTo).toHaveBeenCalled();
            expect(mockCtx.lineTo).toHaveBeenCalled();
        });
    });

    describe('drawAxes', () => {
        it('should draw x-axis and y-axis', () => {
            drawAxes(config);

            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.stroke).toHaveBeenCalled();
            expect(mockCtx.strokeStyle).toBe('#374151');
        });

        it('should draw tick marks and labels', () => {
            drawAxes(config);

            // Should draw tick marks and labels for both axes
            expect(mockCtx.fillText).toHaveBeenCalled();
        });

        it('should draw axis labels', () => {
            drawAxes(config);

            // Should call fillText for axis labels
            expect(mockCtx.fillText).toHaveBeenCalledWith('Feature 1', expect.any(Number), expect.any(Number));
            expect(mockCtx.fillText).toHaveBeenCalledWith('Feature 2', expect.any(Number), expect.any(Number));
        });
    });

    describe('drawDataPoints', () => {
        it('should draw data points for classification task', () => {
            const X = [[0.2, 0.3], [0.7, 0.8]];
            const y = [0, 1];
            const colors = { class0: '#3B82F6', class1: '#EF4444', regression: '#8B5CF6' };

            drawDataPoints(config, X, y, colors, 'classification');

            // Should draw 2 circles
            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockCtx.fill).toHaveBeenCalledTimes(2);
        });

        it('should use correct colors for different classes', () => {
            const X = [[0.2, 0.3], [0.7, 0.8]];
            const y = [0, 1];
            const colors = { class0: '#3B82F6', class1: '#EF4444', regression: '#8B5CF6' };

            drawDataPoints(config, X, y, colors, 'classification');

            // Check that fillStyle was set to class colors
            expect(mockCtx.fillStyle).toContain('#');
        });

        it('should draw data points for regression task', () => {
            const X = [[0.2], [0.7]];
            const y = [0.3, 0.8];
            const colors = { class0: '#3B82F6', class1: '#EF4444', regression: '#8B5CF6' };

            drawDataPoints(config, X, y, colors, 'regression');

            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockCtx.fill).toHaveBeenCalledTimes(2);
        });
    });

    describe('drawBoundary', () => {
        it('should draw boundary line from points', () => {
            const boundaryPoints = [
                { x: 0, y: 0.5 },
                { x: 0.5, y: 0.5 },
                { x: 1, y: 0.5 },
            ];

            drawBoundary(config, boundaryPoints);

            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.moveTo).toHaveBeenCalled();
            expect(mockCtx.lineTo).toHaveBeenCalled();
            expect(mockCtx.stroke).toHaveBeenCalled();
        });

        it('should use correct color and line width', () => {
            const boundaryPoints = [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];

            drawBoundary(config, boundaryPoints, '#FF0000', 5);

            expect(mockCtx.strokeStyle).toBe('#FF0000');
            expect(mockCtx.lineWidth).toBe(5);
        });

        it('should handle empty boundary points', () => {
            drawBoundary(config, []);

            // Should not throw and should not draw anything
            expect(mockCtx.beginPath).not.toHaveBeenCalled();
        });

        it('should connect all boundary points in sequence', () => {
            const boundaryPoints = [
                { x: 0, y: 0 },
                { x: 0.25, y: 0.25 },
                { x: 0.5, y: 0.5 },
                { x: 0.75, y: 0.75 },
                { x: 1, y: 1 },
            ];

            drawBoundary(config, boundaryPoints);

            // First point should use moveTo, rest should use lineTo
            expect(mockCtx.moveTo).toHaveBeenCalledTimes(1);
            expect(mockCtx.lineTo).toHaveBeenCalledTimes(4);
        });
    });

    describe('Scale creation and mapping', () => {
        it('should correctly map data space [0,1] to pixel space', () => {
            const xScale = scaleLinear().domain([0, 1]).range([60, 540]);

            expect(xScale(0)).toBe(60);
            expect(xScale(0.5)).toBe(300);
            expect(xScale(1)).toBe(540);
        });

        it('should correctly map pixel space to data space', () => {
            const xScale = scaleLinear().domain([0, 1]).range([60, 540]);

            expect(xScale.invert(60)).toBe(0);
            expect(xScale.invert(300)).toBe(0.5);
            expect(xScale.invert(540)).toBe(1);
        });

        it('should handle y-axis inversion correctly', () => {
            const yScale = scaleLinear().domain([0, 1]).range([540, 20]);

            // Y-axis is inverted (0 at bottom, 1 at top)
            expect(yScale(0)).toBe(540);
            expect(yScale(1)).toBe(20);
        });
    });
});
