/**
 * DecisionRegions component for visualizing decision tree regions
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 8.2, 11.1, 11.2, 11.3
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';

interface TreeNode {
    id: string;
    depth: number;
    feature: number | null;
    threshold: number | null;
    prediction: number | null;
    samples: number;
    impurity: number;
    left: TreeNode | null;
    right: TreeNode | null;
}

interface TreeState {
    root: TreeNode;
    currentDepth: number;
    maxDepth: number;
    nodeCount: number;
    leafCount: number;
}

interface Dataset {
    X: number[][];
    y: number[];
}

interface DecisionRegion {
    id: string;
    bounds: {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    };
    prediction: number;
    samples: number;
}

interface DecisionRegionsProps {
    treeData: TreeState | null;
    dataset: Dataset;
    highlightedRegion: string | null;
    onRegionHover: (regionId: string | null) => void;
    width?: number;
    height?: number;
}

const DecisionRegions: React.FC<DecisionRegionsProps> = ({
    treeData,
    dataset,
    highlightedRegion,
    onRegionHover,
    width = 600,
    height = 600,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const lastTreeStateRef = useRef<string>('');
    const lastHighlightRef = useRef<string | null>(null);

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
    }), []);

    // Memoize scales
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

    // Calculate decision regions from tree structure
    const regions = useMemo((): DecisionRegion[] => {
        if (!treeData || !treeData.root) return [];

        const result: DecisionRegion[] = [];
        const queue: Array<{ node: TreeNode; bounds: { xMin: number; xMax: number; yMin: number; yMax: number } }> = [
            {
                node: treeData.root,
                bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
            }
        ];

        while (queue.length > 0) {
            const { node, bounds } = queue.shift()!;

            if (node.left === null && node.right === null) {
                // Leaf node - add region
                result.push({
                    id: node.id,
                    bounds,
                    prediction: node.prediction ?? 0,
                    samples: node.samples,
                });
            } else {
                // Internal node - split bounds and add children
                if (node.left && node.feature !== null && node.threshold !== null) {
                    const leftBounds = { ...bounds };
                    if (node.feature === 0) {
                        leftBounds.xMax = node.threshold;
                    } else {
                        leftBounds.yMax = node.threshold;
                    }
                    queue.push({ node: node.left, bounds: leftBounds });
                }

                if (node.right && node.feature !== null && node.threshold !== null) {
                    const rightBounds = { ...bounds };
                    if (node.feature === 0) {
                        rightBounds.xMin = node.threshold;
                    } else {
                        rightBounds.yMin = node.threshold;
                    }
                    queue.push({ node: node.right, bounds: rightBounds });
                }
            }
        }

        return result;
    }, [treeData]);

    // Extract split lines from tree structure with bounds
    const splitLines = useMemo((): Array<{ feature: number; threshold: number; bounds: { xMin: number; xMax: number; yMin: number; yMax: number } }> => {
        if (!treeData || !treeData.root) return [];

        const lines: Array<{ feature: number; threshold: number; bounds: any }> = [];
        const queue: Array<{ node: TreeNode; bounds: { xMin: number; xMax: number; yMin: number; yMax: number } }> = [
            { node: treeData.root, bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 } }
        ];

        while (queue.length > 0) {
            const { node, bounds } = queue.shift()!;

            // If this is an internal node, add its split line
            if (node.feature !== null && node.threshold !== null) {
                lines.push({
                    feature: node.feature,
                    threshold: node.threshold,
                    bounds: bounds
                });

                if (node.left) {
                    const leftBounds = { ...bounds };
                    if (node.feature === 0) leftBounds.xMax = node.threshold;
                    else leftBounds.yMax = node.threshold;
                    queue.push({ node: node.left, bounds: leftBounds });
                }
                
                if (node.right) {
                    const rightBounds = { ...bounds };
                    if (node.feature === 0) rightBounds.xMin = node.threshold;
                    else rightBounds.yMin = node.threshold;
                    queue.push({ node: node.right, bounds: rightBounds });
                }
            }
        }

        return lines;
    }, [treeData]);

    // Render the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create offscreen canvas for caching regions
        if (!offscreenCanvasRef.current) {
            offscreenCanvasRef.current = document.createElement('canvas');
            offscreenCanvasRef.current.width = width;
            offscreenCanvasRef.current.height = height;
        }

        const offscreenCanvas = offscreenCanvasRef.current;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) return;

        // Create a state signature to detect changes
        const treeStateSignature = JSON.stringify({
            depth: treeData?.currentDepth,
            nodeCount: treeData?.nodeCount,
            regions: regions.map(r => r.id),
        });

        // Only redraw regions if tree state changed
        const treeStateChanged = treeStateSignature !== lastTreeStateRef.current;
        if (treeStateChanged) {
            // Clear offscreen canvas
            offscreenCtx.clearRect(0, 0, width, height);

            // Render decision regions to offscreen canvas
            for (const region of regions) {
                const x1 = xScale(region.bounds.xMin);
                const x2 = xScale(region.bounds.xMax);
                const y1 = yScale(region.bounds.yMax);
                const y2 = yScale(region.bounds.yMin);

                // Fill region with class color (alpha 0.3)
                const color = region.prediction === 0 ? colors.class0 : colors.class1;
                offscreenCtx.fillStyle = color.replace(')', ', 0.3)').replace('rgb', 'rgba');
                offscreenCtx.fillRect(x1, y1, x2 - x1, y2 - y1);

                // Draw region border
                offscreenCtx.strokeStyle = '#D1D5DB';
                offscreenCtx.lineWidth = 1;
                offscreenCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            }

            // Draw split lines
            offscreenCtx.strokeStyle = '#6B7280';
            offscreenCtx.lineWidth = 2;
            offscreenCtx.setLineDash([5, 5]);

            for (const split of splitLines) {
                if (split.feature === 0) {
                    const x = xScale(split.threshold);
                    const yTop = yScale(split.bounds.yMax);
                    const yBottom = yScale(split.bounds.yMin);
                    offscreenCtx.beginPath();
                    offscreenCtx.moveTo(x, yTop);
                    offscreenCtx.lineTo(x, yBottom);
                    offscreenCtx.stroke();
                } else {
                    const y = yScale(split.threshold);
                    const xLeft = xScale(split.bounds.xMin);
                    const xRight = xScale(split.bounds.xMax);
                    offscreenCtx.beginPath();
                    offscreenCtx.moveTo(xLeft, y);
                    offscreenCtx.lineTo(xRight, y);
                    offscreenCtx.stroke();
                }
            }

            offscreenCtx.setLineDash([]);

            // Draw data points
            if (dataset && dataset.X && dataset.y) {
                for (let i = 0; i < dataset.X.length; i++) {
                    const point = dataset.X[i];
                    const label = dataset.y[i];

                    const px = xScale(point[0]);
                    const py = yScale(point[1]);

                    offscreenCtx.beginPath();
                    offscreenCtx.arc(px, py, 4, 0, 2 * Math.PI);
                    offscreenCtx.fillStyle = label === 0 ? colors.class0 : colors.class1;
                    offscreenCtx.fill();
                    offscreenCtx.strokeStyle = '#FFFFFF';
                    offscreenCtx.lineWidth = 1.5;
                    offscreenCtx.stroke();
                }
            }

            lastTreeStateRef.current = treeStateSignature;
        }

        const render = () => {
            // Clear main canvas
            ctx.clearRect(0, 0, width, height);

            // Copy from offscreen canvas
            ctx.drawImage(offscreenCanvas, 0, 0);

            // Draw highlighted region border on main canvas
            if (highlightedRegion) {
                const region = regions.find(r => r.id === highlightedRegion);
                if (region) {
                    const x1 = xScale(region.bounds.xMin);
                    const x2 = xScale(region.bounds.xMax);
                    const y1 = yScale(region.bounds.yMax);
                    const y2 = yScale(region.bounds.yMin);

                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                }
            }

            lastHighlightRef.current = highlightedRegion;
        };

        // Use requestAnimationFrame for smooth rendering
        animationFrameRef.current = requestAnimationFrame(render);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [treeData, dataset, highlightedRegion, width, height, xScale, yScale, margin, colors, regions, splitLines]);

    // Mouse hover handler
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!treeData || regions.length === 0) {
            onRegionHover(null);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert mouse position to data coordinates
        const dataX = xScale.invert(mouseX);
        const dataY = yScale.invert(mouseY);

        // Find which region contains the mouse
        for (const region of regions) {
            if (
                dataX >= region.bounds.xMin &&
                dataX <= region.bounds.xMax &&
                dataY >= region.bounds.yMin &&
                dataY <= region.bounds.yMax
            ) {
                onRegionHover(region.id);
                return;
            }
        }

        onRegionHover(null);
    }, [treeData, regions, xScale, yScale, onRegionHover]);

    const handleMouseLeave = useCallback(() => {
        onRegionHover(null);
    }, [onRegionHover]);

    // Generate accessible description
    const description = useMemo(() => {
        if (!treeData || !dataset) {
            return 'Decision regions visualization: No data loaded';
        }

        const numPoints = dataset.X.length;
        const depth = treeData.currentDepth;
        const leafCount = treeData.leafCount;

        return `Decision regions showing ${numPoints} data points partitioned into ${leafCount} regions at depth ${depth}`;
    }, [treeData, dataset]);

    return (
        <div
            style={{ position: 'relative', width, height }}
            role="img"
            aria-label={description}
        >
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    cursor: 'crosshair'
                }}
                aria-hidden="true"
            />

            {/* Screen reader only text description */}
            <div className="sr-only">
                {description}
            </div>
        </div>
    );
};

export default DecisionRegions;
