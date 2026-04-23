/**
 * Canvas2D component for visualizing ML training
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 11.1, 11.2, 11.3, 11.4, 11.5
 */

import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import {
    clearCanvas,
    drawGrid,
    drawAxes,
    drawDataPoints,
    drawBoundary,
    DrawConfig,
} from '../utils/canvas';
import { useVisualization } from '../hooks/useVisualization';
import PointTooltip from './PointTooltip';
import { getAlgorithmLabels } from '../utils/algorithmLabels';
import type { HoveredPoint } from '../types/ui';

interface Canvas2DProps {
    state: any; // ML Engine state
    width?: number;
    height?: number;
    showGrid?: boolean;
    viewMode?: 'scatter' | 'heatmap';
}

const Canvas2D: React.FC<Canvas2DProps> = ({
    state,
    width = 600,
    height = 600,
    showGrid = true,
    viewMode = 'scatter',
}) => {
    const { boundaryPoints, marginPosPoints, marginNegPoints } = useVisualization(state);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const mouseMoveFrameRef = useRef<number | null>(null);

    // Tooltip state
    const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

    // Use a ref for the render loop to avoid re-triggering useEffect continuously during hover
    const hoveredPointRef = useRef(hoveredPoint);
    useEffect(() => {
        hoveredPointRef.current = hoveredPoint;
    }, [hoveredPoint]);

    // Memoize margin to prevent unnecessary recalculations
    const margin = useMemo(() => ({
        top: 20,
        right: 20,
        bottom: 60,
        left: 60
    }), []);

    // Memoize color configuration
    const colors = useMemo(() => ({
        class0: '#3B82F6', // blue
        class1: '#EF4444', // red
        regression: '#8B5CF6', // purple
    }), []);

    // Memoize scales to avoid recreation on every render
    const xScale = useMemo(() => {
        return scaleLinear()
            .domain([0, 1])
            .range([margin.left, width - margin.right]);
    }, [width, margin]);

    const yScale = useMemo(() => {
        return scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom, margin.top]);
    }, [height, margin]);

    // Draw static background layer (grid + axes)
    useEffect(() => {
        const canvas = backgroundCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const config: DrawConfig = {
            ctx,
            xScale,
            yScale,
            width,
            height,
            margin,
        };

        clearCanvas(ctx, width, height);

        if (showGrid) {
            drawGrid(config);
        }

        drawAxes(config);
    }, [width, height, showGrid, xScale, yScale, margin]);

    // Draw dynamic layers (data points + boundary)
    // Uses requestAnimationFrame for smooth 30+ FPS rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !state) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const config: DrawConfig = {
            ctx,
            xScale,
            yScale,
            width,
            height,
            margin,
        };

        const render = () => {
            clearCanvas(ctx, width, height);

            // Draw probability heatmap if requested
            if (viewMode === 'heatmap' && state.algorithm === 'logisticRegression') {
                const gridSize = 50;
                const cellW = width / gridSize;
                const cellH = height / gridSize;
                for (let i = 0; i < gridSize; i++) {
                    for (let j = 0; j < gridSize; j++) {
                        const px = i * cellW;
                        const py = j * cellH;
                        // Map center of cell back to domain coordinates
                        const x1 = xScale.invert(px + cellW / 2);
                        const x2 = yScale.invert(py + cellH / 2);

                        const z = (state.weights[0] || 0) * x1 + (state.weights[1] || 0) * x2 + state.bias;
                        const p = 1 / (1 + Math.exp(-z));

                        // Red (239, 68, 68) to Blue (59, 130, 246)
                        const r = Math.round(59 + (239 - 59) * p);
                        const g = Math.round(130 + (68 - 130) * p);
                        const b = Math.round(246 + (68 - 246) * p);

                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
                        ctx.fillRect(px, py, cellW, cellH);
                    }
                }
            }

            // Draw data points
            if (state.dataset?.X && state.dataset?.y) {
                drawDataPoints(
                    config,
                    state.dataset.X,
                    state.dataset.y,
                    colors,
                    state.dataset.task || 'classification',
                    hoveredPointRef.current?.index ?? null
                );
            }

            // Draw SVM margins if available
            if (marginPosPoints.length > 0) {
                drawBoundary(config, marginPosPoints, '#9CA3AF', 2, true);
            }
            if (marginNegPoints.length > 0) {
                drawBoundary(config, marginNegPoints, '#9CA3AF', 2, true);
            }

            // Draw decision boundary or regression line
            if (boundaryPoints.length > 0) {
                drawBoundary(config, boundaryPoints, '#4F46E5', 3, false);
            }
        };

        animationFrameRef.current = requestAnimationFrame(render);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [state, boundaryPoints, marginPosPoints, marginNegPoints, width, height, xScale, yScale, margin, colors, viewMode]);

    // Mouse Tracking Logic — throttled with RAF so the scan runs at most once per frame
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!state?.dataset?.X || !state?.dataset?.y) return;

        // If a frame is already pending, skip — we'll pick up the latest position next frame
        if (mouseMoveFrameRef.current !== null) return;

        const clientX = e.clientX;
        const clientY = e.clientY;

        mouseMoveFrameRef.current = requestAnimationFrame(() => {
            mouseMoveFrameRef.current = null;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;

            let closestDist = Infinity;
            let closestIdx = -1;
            let closestPx = 0;
            let closestPy = 0;

            // Find the closest point in coordinate space
            for (let i = 0; i < state.dataset.X.length; i++) {
                const point = state.dataset.X[i];
                const px = xScale(point[0]);
                const py = yScale(point[1] !== undefined ? point[1] : state.dataset.y[i]);

                const dist = Math.sqrt(Math.pow(px - mouseX, 2) + Math.pow(py - mouseY, 2));
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIdx = i;
                    closestPx = px;
                    closestPy = py;
                }
            }

            // Only hover if exactly within 12 pixels
            if (closestDist <= 12 && closestIdx !== -1) {
                const point = state.dataset.X[closestIdx];
                setHoveredPoint({
                    index: closestIdx,
                    x: closestPx,
                    y: closestPy,
                    dataX: point[0],
                    dataY: point[1] !== undefined ? point[1] : state.dataset.y[closestIdx],
                    label: state.dataset.y[closestIdx]
                });
            } else {
                setHoveredPoint(null);
            }
        });
    }, [state, xScale, yScale]);

    const handleMouseLeave = useCallback(() => {
        setHoveredPoint(null);
    }, []);

    // Generate accessible description for canvas visualization
    const visualizationDescription = useMemo(() => {
        if (!state || !state.dataset?.X || !state.dataset?.y) {
            return 'Visualization canvas: No data loaded';
        }

        const numPoints = state.dataset.X.length;
        const iteration = state.iteration || 0;
        const loss = state.loss ? state.loss.toFixed(4) : 'N/A';
        const { isRegression } = getAlgorithmLabels(state.algorithm);

        if (!isRegression) {
            const class0Count = state.dataset.y.filter((y: number) => y === 0).length;
            const class1Count = state.dataset.y.filter((y: number) => y === 1).length;
            return `2D visualization showing ${numPoints} data points: ${class0Count} blue points (class 0) and ${class1Count} red points (class 1). Current iteration: ${iteration}. Current loss: ${loss}. ${boundaryPoints.length > 0 ? 'Decision boundary is displayed.' : 'No decision boundary yet.'}`;
        } else {
            return `2D visualization showing ${numPoints} data points for regression. Current iteration: ${iteration}. Current loss: ${loss}. ${boundaryPoints.length > 0 ? 'Regression line is displayed.' : 'No regression line yet.'}`;
        }
    }, [state, boundaryPoints]);

    return (
        <div
            style={{ position: 'relative', width, height }}
            role="img"
            aria-label={visualizationDescription}
        >
            {/* Background layer: grid + axes */}
            <canvas
                ref={backgroundCanvasRef}
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
                aria-hidden="true"
            />
            {/* Foreground layer: data + boundary */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: hoveredPoint ? 'pointer' : 'crosshair'
                }}
                aria-hidden="true"
            />

            {/* Plotly-style Floating Tooltip */}
            {hoveredPoint && (
                <PointTooltip algorithm={state.algorithm} point={hoveredPoint} />
            )}

            {/* Screen reader only text description */}
            <div className="sr-only">
                {visualizationDescription}
            </div>
        </div>
    );
};

export default Canvas2D;
