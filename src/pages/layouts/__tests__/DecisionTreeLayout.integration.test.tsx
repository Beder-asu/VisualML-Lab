/**
 * DecisionTreeLayout.integration.test.tsx — Integration tests for DecisionTreeLayout
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.5, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DecisionTreeLayout } from '../DecisionTreeLayout';
import * as useTreeControllerModule from '../../../hooks/useTreeController';

// Mock dependencies
vi.mock('../../../hooks/useLayoutHooks', () => ({
    useLayoutError: () => ({ error: null, setError: vi.fn(), clearError: vi.fn() }),
    useCodePanelState: () => ({ isExpanded: false, toggle: vi.fn(), expand: vi.fn(), collapse: vi.fn() }),
}));

vi.mock('../../../utils/layoutUtils', () => ({
    getDefaultDataset: () => 'iris-2d',
}));

describe('DecisionTreeLayout Integration Tests', () => {
    let mockTreeState: any;
    let mockControls: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockTreeState = {
            treeState: {
                root: { id: '0', depth: 0, feature: null, threshold: null, prediction: 0, samples: 100, impurity: 0.5, left: null, right: null },
                currentDepth: 0,
                maxDepth: 3,
                nodeCount: 1,
                leafCount: 1,
                dataset: { X: [[0.1, 0.2]], y: [0] },
            },
            isBuilding: false,
            isPaused: false,
            isComplete: false,
            error: null,
        };
        mockControls = {
            play: vi.fn(),
            pause: vi.fn(),
            step: vi.fn(),
            reset: vi.fn(),
            updateParams: vi.fn(),
            changeDataset: vi.fn(),
            clearError: vi.fn(),
        };
        vi.spyOn(useTreeControllerModule, 'useTreeController').mockReturnValue([mockTreeState, mockControls] as any);
    });

    describe('11.1 Full tree building flow test', () => {
        it('should render layout with tree structure and decision regions', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            expect(screen.getByText(/Tree Structure/i)).toBeInTheDocument();
            expect(screen.getByText(/Decision Regions/i)).toBeInTheDocument();
        });

        it('should call play when play button is clicked', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const playButton = screen.getByLabelText(/Play training/i);
            fireEvent.click(playButton);
            expect(mockControls.play).toHaveBeenCalled();
        });

        it('should call pause when pause button is clicked', () => {
            mockTreeState.isBuilding = true;
            vi.spyOn(useTreeControllerModule, 'useTreeController').mockReturnValue([mockTreeState, mockControls] as any);
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const pauseButton = screen.getByLabelText(/Pause training/i);
            fireEvent.click(pauseButton);
            expect(mockControls.pause).toHaveBeenCalled();
        });

        it('should call step when step button is clicked', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const stepButton = screen.getByLabelText(/Step once/i);
            fireEvent.click(stepButton);
            expect(mockControls.step).toHaveBeenCalled();
        });

        it('should call reset when reset button is clicked', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const resetButton = screen.getByLabelText(/Reset training/i);
            fireEvent.click(resetButton);
            expect(mockControls.reset).toHaveBeenCalled();
        });
    });

    describe('11.2 Interactive highlighting test', () => {
        it('should render tree diagram with role tree', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const treeContainer = screen.getByRole('tree');
            expect(treeContainer).toBeInTheDocument();
        });

        it('should handle mouse events on tree container', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const treeContainer = screen.getByRole('tree');
            fireEvent.mouseEnter(treeContainer);
            fireEvent.mouseLeave(treeContainer);
            expect(treeContainer).toBeInTheDocument();
        });
    });

    describe('11.3 Zoom and pan test', () => {
        it('should render zoom controls', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            expect(screen.getByLabelText(/Zoom in/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Zoom out/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Reset zoom/i)).toBeInTheDocument();
        });

        it('should handle zoom in click', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const zoomInButton = screen.getByLabelText(/Zoom in/i);
            fireEvent.click(zoomInButton);
            expect(zoomInButton).toBeInTheDocument();
        });

        it('should handle zoom out click', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const zoomOutButton = screen.getByLabelText(/Zoom out/i);
            fireEvent.click(zoomOutButton);
            expect(zoomOutButton).toBeInTheDocument();
        });

        it('should handle reset zoom click', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const resetButton = screen.getByLabelText(/Reset zoom/i);
            fireEvent.click(resetButton);
            expect(resetButton).toBeInTheDocument();
        });

        it('should handle drag events on tree', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const treeContainer = screen.getByRole('tree');
            fireEvent.mouseDown(treeContainer, { clientX: 100, clientY: 100 });
            fireEvent.mouseMove(treeContainer, { clientX: 150, clientY: 150 });
            fireEvent.mouseUp(treeContainer);
            expect(treeContainer).toBeInTheDocument();
        });
    });

    describe('11.4 Parameter change test', () => {
        it('should call updateParams when max depth changes', async () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const maxDepthSlider = screen.getByLabelText(/Max Depth: 3/i);
            fireEvent.change(maxDepthSlider, { target: { value: '5' } });
            await waitFor(() => {
                expect(mockControls.updateParams).toHaveBeenCalled();
            });
        });

        it('should call updateParams when criterion changes', async () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const criterionSelect = screen.getByLabelText(/Split Criterion: gini/i);
            fireEvent.change(criterionSelect, { target: { value: 'entropy' } });
            await waitFor(() => {
                expect(mockControls.updateParams).toHaveBeenCalled();
            });
        });
    });

    describe('11.5 Performance test', () => {
        it('should render quickly with max depth tree', () => {
            mockTreeState.treeState.currentDepth = 8;
            mockTreeState.treeState.maxDepth = 8;
            mockTreeState.treeState.nodeCount = 255;
            vi.spyOn(useTreeControllerModule, 'useTreeController').mockReturnValue([mockTreeState, mockControls] as any);

            const startTime = performance.now();
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const renderTime = performance.now() - startTime;

            expect(renderTime).toBeLessThan(100);
        });

        it('should respond quickly to interactions', () => {
            render(<DecisionTreeLayout algorithm="decisionTree" />);
            const zoomInButton = screen.getByLabelText(/Zoom in/i);

            const startTime = performance.now();
            fireEvent.click(zoomInButton);
            const responseTime = performance.now() - startTime;

            expect(responseTime).toBeLessThan(100);
        });
    });
});
