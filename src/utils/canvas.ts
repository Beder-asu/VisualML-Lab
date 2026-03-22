/**
 * Canvas drawing utilities for visualization
 */

import { ScaleLinear } from 'd3-scale';

export interface DrawConfig {
    ctx: CanvasRenderingContext2D;
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
}

/**
 * Clear the entire canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.clearRect(0, 0, width, height);
}

/**
 * Draw grid lines on the canvas
 */
export function drawGrid(config: DrawConfig): void {
    const { ctx, xScale, yScale, width, height, margin } = config;

    ctx.strokeStyle = '#e5e7eb'; // light gray
    ctx.lineWidth = 1;

    // Vertical grid lines at 0, 0.25, 0.5, 0.75, 1.0
    const xTicks = [0, 0.25, 0.5, 0.75, 1.0];
    xTicks.forEach(tick => {
        const x = xScale(tick);
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, height - margin.bottom);
        ctx.stroke();
    });

    // Horizontal grid lines at 0, 0.25, 0.5, 0.75, 1.0
    const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
    yTicks.forEach(tick => {
        const y = yScale(tick);
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
    });
}

/**
 * Draw axes with labels and tick marks
 */
export function drawAxes(config: DrawConfig): void {
    const { ctx, xScale, yScale, width, height, margin } = config;

    ctx.strokeStyle = '#374151'; // dark gray
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();

    // Draw tick marks and labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X-axis ticks
    const xTicks = [0, 0.25, 0.5, 0.75, 1.0];
    xTicks.forEach(tick => {
        const x = xScale(tick);
        // Tick mark
        ctx.beginPath();
        ctx.moveTo(x, height - margin.bottom);
        ctx.lineTo(x, height - margin.bottom + 5);
        ctx.stroke();
        // Label
        ctx.fillText(tick.toFixed(2), x, height - margin.bottom + 8);
    });

    // Y-axis ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
    yTicks.forEach(tick => {
        const y = yScale(tick);
        // Tick mark
        ctx.beginPath();
        ctx.moveTo(margin.left - 5, y);
        ctx.lineTo(margin.left, y);
        ctx.stroke();
        // Label
        ctx.fillText(tick.toFixed(2), margin.left - 8, y);
    });

    // Axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Feature 1', width / 2, height - margin.bottom + 30);

    ctx.save();
    ctx.translate(margin.left - 40, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Feature 2', 0, 0);
    ctx.restore();
}

/**
 * Draw data points on the canvas
 */
export function drawDataPoints(
    config: DrawConfig,
    X: number[][],
    y: number[],
    colors: { class0: string; class1: string; regression: string },
    task: string,
    hoveredIndex: number | null = null
): void {
    const { ctx, xScale, yScale } = config;
    const radius = 4;

    X.forEach((point, i) => {
        const px = xScale(point[0]);
        const py = yScale(point[1] !== undefined ? point[1] : y[i]);

        ctx.beginPath();
        // Slightly enlarge the hovered point
        ctx.arc(px, py, i === hoveredIndex ? radius + 2 : radius, 0, 2 * Math.PI);

        if (task === 'regression') {
            ctx.fillStyle = colors.regression;
        } else {
            ctx.fillStyle = y[i] === 0 ? colors.class0 : colors.class1;
        }

        ctx.fill();
        
        if (i === hoveredIndex) {
            ctx.strokeStyle = '#111827'; // Dark bold stroke for hover
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
        }
        ctx.stroke();
    });
}

/**
 * Draw decision boundary or regression line
 */
export function drawBoundary(
    config: DrawConfig,
    boundaryPoints: Array<{ x: number; y: number }>,
    color: string = '#4F46E5',
    lineWidth: number = 2,
    isDashed: boolean = false
): void {
    const { ctx, xScale, yScale } = config;

    if (boundaryPoints.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    if (typeof ctx.setLineDash === 'function') {
        if (isDashed) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
    }
    
    ctx.beginPath();

    boundaryPoints.forEach((point, i) => {
        const px = xScale(point.x);
        const py = yScale(point.y);

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    });

    ctx.stroke();
    
    if (typeof ctx.setLineDash === 'function') {
        ctx.setLineDash([]); // Reset for other drawings
    }
}
