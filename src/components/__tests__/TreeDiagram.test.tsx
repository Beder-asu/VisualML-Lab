/**
 * Unit tests for TreeDiagram component
 * Requirements: 3.1, 3.2, 3.4, 6.1, 6.2, 6.3, 6.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TreeDiagram from '../TreeDiagram';

describe('TreeDiagram', () => {
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

    it('renders root node at depth 0', () => {
        const treeState = createTreeState(0);
        const onNodeHover = vi.fn();

        render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        );

        // Check that the component renders
        expect(screen.getByRole('tree')).toBeInTheDocument();
        expect(screen.getByText(/Decision tree with 1 nodes at depth 0/i)).toBeInTheDocument();
    });

    it('renders children at depth 1', () => {
        const treeState = createTreeState(1);
        const onNodeHover = vi.fn();

        render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={1}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        );

        // Check that the component renders with 3 nodes
        expect(screen.getByRole('tree')).toBeInTheDocument();
        expect(screen.getByText(/Decision tree with 3 nodes at depth 1/i)).toBeInTheDocument();
    });

    it('applies zoom transform', () => {
        const treeState = createTreeState(0);
        const onNodeHover = vi.fn();

        const { container } = render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={2.0}
                pan={{ x: 0, y: 0 }}
            />
        );

        // Check that zoom is applied in transform
        const treeGroup = container.querySelector('.tree-group');
        expect(treeGroup).toBeInTheDocument();
        // The transform includes scale(2.0)
        expect(treeGroup?.getAttribute('transform')).toContain('scale(2');
    });

    it('applies pan transform', () => {
        const treeState = createTreeState(0);
        const onNodeHover = vi.fn();

        const { container } = render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 100, y: 50 }}
            />
        );

        // Check that pan is applied in transform
        const treeGroup = container.querySelector('.tree-group');
        expect(treeGroup).toBeInTheDocument();
        // The transform includes translate with pan values
        expect(treeGroup?.getAttribute('transform')).toContain('translate(150, 100)');
    });

    it('calls onNodeHover on hover', () => {
        const treeState = createTreeState(1);
        const onNodeHover = vi.fn();

        const { container } = render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={1}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        );

        // Find a tree node and simulate hover
        const treeNodes = container.querySelectorAll('.tree-node');
        expect(treeNodes.length).toBeGreaterThan(0);

        fireEvent.mouseEnter(treeNodes[0]);
        expect(onNodeHover).toHaveBeenCalledWith('0');

        fireEvent.mouseLeave(treeNodes[0]);
        expect(onNodeHover).toHaveBeenCalledWith(null);
    });

    it('renders zoom controls', () => {
        const treeState = createTreeState(0);
        const onNodeHover = vi.fn();

        render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        );

        // Check that zoom controls are present
        expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
        expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
        expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
    });

    it('handles zoom in button click', () => {
        const treeState = createTreeState(0);
        const onNodeHover = vi.fn();

        const { container } = render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        );

        const zoomInButton = screen.getByLabelText('Zoom in');
        fireEvent.click(zoomInButton);

        // Check that zoom increased
        const treeGroup = container.querySelector('.tree-group');
        const transform = treeGroup?.getAttribute('transform');
        // Should have increased from 1 to 1.2
        expect(transform).toContain('scale(1.2');
    });

    it('handles zoom out button click', () => {
        const treeState = createTreeState(0);
        const onNodeHover = vi.fn();

        const { container } = render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        );

        const zoomOutButton = screen.getByLabelText('Zoom out');
        fireEvent.click(zoomOutButton);

        // Check that zoom decreased
        const treeGroup = container.querySelector('.tree-group');
        const transform = treeGroup?.getAttribute('transform');
        // Should have decreased from 1 to 0.8
        expect(transform).toContain('scale(0.8');
    });

    it('handles reset zoom button click', () => {
        const treeState = createTreeState(0);
        const onNodeHover = vi.fn();

        const { container } = render(
            <TreeDiagram
                treeData={treeState}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={2}
                pan={{ x: 100, y: 100 }}
            />
        );

        const resetButton = screen.getByLabelText('Reset zoom');
        fireEvent.click(resetButton);

        // Check that zoom and pan reset
        const treeGroup = container.querySelector('.tree-group');
        const transform = treeGroup?.getAttribute('transform');
        // Should reset to scale(1) and translate(50, 50) (base offset)
        expect(transform).toContain('scale(1)');
        expect(transform).toContain('translate(50, 50)');
    });

    it('renders placeholder when no tree data', () => {
        const onNodeHover = vi.fn();

        render(
            <TreeDiagram
                treeData={null as any}
                currentDepth={0}
                highlightedNode={null}
                onNodeHover={onNodeHover}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        );

        expect(screen.getByText('No tree data available')).toBeInTheDocument();
    });
});
