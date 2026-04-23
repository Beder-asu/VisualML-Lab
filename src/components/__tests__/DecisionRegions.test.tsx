/**
 * Unit tests for DecisionRegions component
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import DecisionRegions from '../DecisionRegions';

describe('DecisionRegions', () => {
    // Mock canvas context
    let mockContext: any;

    beforeEach(() => {
        mockContext = {
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            setLineDash: vi.fn(),
            drawImage: vi.fn(),
        };

        HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    });

    // Helper to create a simple tree state
    const createTreeState = (depth: number) => {
        const root: any = {
            id: '0',
            depth: 0,
            feature: depth > 0 ? 0 : null,
            threshold: depth > 0 ? 0.5 : null,
            prediction: depth === 0 ? 1 : null,
            samples: 100,
            impurity: 0.5,
            left: null,
            right: null,
        };

        if (depth > 0) {
            root.left = {
                id: '0-L',
                depth: 1,
                feature: null,
                threshold: null,
                prediction: 0,
                samples: 50,
                impurity: 0.0,
                left: null,
                right: null,
            };
            root.right = {
                id: '0-R',
                depth: 1,
                feature: null,
                threshold: null,
                prediction: 1,
                samples: 50,
                impurity: 0.0,
                left: null,
                right: null,
            };
        }

        return {
            root,
            currentDepth: depth,
            maxDepth: 3,
            nodeCount: depth === 0 ? 1 : 3,
            leafCount: depth === 0 ? 1 : 2,
        };
    };

    const createDataset = () => ({
        X: [
            [0.2, 0.3],
            [0.7, 0.8],
            [0.3, 0.6],
            [0.8, 0.2],
        ],
        y: [0, 1, 0, 1],
    });

    it('renders data points', () => {
        const treeState = createTreeState(0);
        const dataset = createDataset();
        const onRegionHover = vi.fn();

        render(
            <DecisionRegions
                treeData={treeState}
                dataset={dataset}
                highlightedRegion={null}
                onRegionHover={onRegionHover}
            />
        );

        // Wait for requestAnimationFrame to complete
        return new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                // Check that arc was called for each data point
                expect(mockContext.arc).toHaveBeenCalled();
                // Should be called once per point (4 points)
                expect(mockContext.arc.mock.calls.length).toBeGreaterThanOrEqual(4);
                resolve();
            });
        });
    });

    it('renders decision regions', () => {
        const treeState = createTreeState(1);
        const dataset = createDataset();
        const onRegionHover = vi.fn();

        render(
            <DecisionRegions
                treeData={treeState}
                dataset={dataset}
                highlightedRegion={null}
                onRegionHover={onRegionHover}
            />
        );

        return new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                // Check that fillRect was called for regions
                expect(mockContext.fillRect).toHaveBeenCalled();
                // Should be called for each region (2 regions at depth 1)
                expect(mockContext.fillRect.mock.calls.length).toBeGreaterThanOrEqual(2);
                resolve();
            });
        });
    });

    it('draws split lines', () => {
        const treeState = createTreeState(1);
        const dataset = createDataset();
        const onRegionHover = vi.fn();

        render(
            <DecisionRegions
                treeData={treeState}
                dataset={dataset}
                highlightedRegion={null}
                onRegionHover={onRegionHover}
            />
        );

        return new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                // Check that setLineDash was called (for dashed split lines)
                expect(mockContext.setLineDash).toHaveBeenCalled();
                // Check that lines were drawn
                expect(mockContext.moveTo).toHaveBeenCalled();
                expect(mockContext.lineTo).toHaveBeenCalled();
                resolve();
            });
        });
    });

    it('calls onRegionHover on hover', () => {
        const treeState = createTreeState(1);
        const dataset = createDataset();
        const onRegionHover = vi.fn();

        const { container } = render(
            <DecisionRegions
                treeData={treeState}
                dataset={dataset}
                highlightedRegion={null}
                onRegionHover={onRegionHover}
            />
        );

        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();

        // Simulate mouse move over left region (x < 0.5)
        fireEvent.mouseMove(canvas!, {
            clientX: 100, // Left side of canvas
            clientY: 300,
        });

        // Should call onRegionHover with a region ID
        expect(onRegionHover).toHaveBeenCalled();
        const lastCall = onRegionHover.mock.calls[onRegionHover.mock.calls.length - 1];
        expect(lastCall[0]).toBeTruthy(); // Should have a region ID
    });

    it('calls onRegionHover with null on mouse leave', () => {
        const treeState = createTreeState(1);
        const dataset = createDataset();
        const onRegionHover = vi.fn();

        const { container } = render(
            <DecisionRegions
                treeData={treeState}
                dataset={dataset}
                highlightedRegion={null}
                onRegionHover={onRegionHover}
            />
        );

        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();

        fireEvent.mouseLeave(canvas!);

        expect(onRegionHover).toHaveBeenCalledWith(null);
    });

    it('highlights region when highlightedRegion prop is set', () => {
        const treeState = createTreeState(1);
        const dataset = createDataset();
        const onRegionHover = vi.fn();

        render(
            <DecisionRegions
                treeData={treeState}
                dataset={dataset}
                highlightedRegion="0-L"
                onRegionHover={onRegionHover}
            />
        );

        return new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                // Check that strokeRect was called with thicker line for highlight
                expect(mockContext.strokeRect).toHaveBeenCalled();
                resolve();
            });
        });
    });

    it('renders placeholder when no tree data', () => {
        const dataset = createDataset();
        const onRegionHover = vi.fn();

        const { container } = render(
            <DecisionRegions
                treeData={null}
                dataset={dataset}
                highlightedRegion={null}
                onRegionHover={onRegionHover}
            />
        );

        // Should still render canvas
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });
});
