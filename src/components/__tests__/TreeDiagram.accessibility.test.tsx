/**
 * Accessibility tests for TreeDiagram component
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 * 
 * These tests verify ARIA attributes and keyboard navigation support.
 * Manual testing with screen readers (NVDA/JAWS) is recommended for full validation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TreeDiagram from '../TreeDiagram';

describe('TreeDiagram Accessibility', () => {
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

    describe('ARIA Labels - Requirement 12.1', () => {
        it('has role="tree" on container', () => {
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

            const treeContainer = screen.getByRole('tree');
            expect(treeContainer).toBeInTheDocument();
            expect(treeContainer).toHaveAttribute('aria-label', 'Decision tree diagram with 1 nodes at depth 0');
        });

        it('has role="treeitem" on all nodes', () => {
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

            const treeItems = container.querySelectorAll('[role="treeitem"]');
            expect(treeItems.length).toBe(3); // root + 2 children
        });

        it('has descriptive aria-label for decision nodes', () => {
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

            const rootNode = container.querySelector('[role="treeitem"]');
            expect(rootNode).toHaveAttribute('aria-label', 'Decision node: split on feature 1 at threshold 0.50, 100 samples, impurity 0.500');
        });

        it('has descriptive aria-label for leaf nodes', () => {
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

            const treeItems = container.querySelectorAll('[role="treeitem"]');
            const leafNodes = Array.from(treeItems).slice(1); // Skip root

            expect(leafNodes[0]).toHaveAttribute('aria-label', 'Leaf node: predicts class 0, 50 samples, impurity 0.000');
            expect(leafNodes[1]).toHaveAttribute('aria-label', 'Leaf node: predicts class 1, 50 samples, impurity 0.000');
        });
    });

    describe('Keyboard Navigation - Requirements 12.2, 12.3', () => {
        it('container is focusable with tabIndex', () => {
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

            const treeContainer = screen.getByRole('tree');
            expect(treeContainer).toHaveAttribute('tabIndex', '0');
        });

        it('supports arrow key navigation', () => {
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

            const treeContainer = screen.getByRole('tree');

            // First ArrowDown focuses the first node (root)
            fireEvent.keyDown(treeContainer, { key: 'ArrowDown' });
            expect(onNodeHover).toHaveBeenCalledWith('0');

            // Second ArrowDown moves to first child
            fireEvent.keyDown(treeContainer, { key: 'ArrowDown' });
            expect(onNodeHover).toHaveBeenCalledWith('0-L');

            // Third ArrowDown moves to second child
            fireEvent.keyDown(treeContainer, { key: 'ArrowDown' });
            expect(onNodeHover).toHaveBeenCalledWith('0-R');
        });

        it('supports Home key to focus first node', () => {
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

            const treeContainer = screen.getByRole('tree');

            // Simulate Home key
            fireEvent.keyDown(treeContainer, { key: 'Home' });
            expect(onNodeHover).toHaveBeenCalledWith('0');
        });

        it('supports End key to focus last node', () => {
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

            const treeContainer = screen.getByRole('tree');

            // Simulate End key
            fireEvent.keyDown(treeContainer, { key: 'End' });
            expect(onNodeHover).toHaveBeenCalledWith('0-R');
        });

        it('nodes have aria-selected attribute', () => {
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

            const treeItems = container.querySelectorAll('[role="treeitem"]');
            treeItems.forEach(item => {
                expect(item).toHaveAttribute('aria-selected');
            });
        });
    });

    describe('Zoom/Pan Controls - Requirement 12.5', () => {
        it('zoom controls have aria-label attributes', () => {
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

            expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
            expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
        });

        it('zoom controls toolbar has aria-label', () => {
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

            const toolbar = screen.getByRole('toolbar');
            expect(toolbar).toHaveAttribute('aria-label', 'Tree diagram controls');
        });
    });

    describe('Screen Reader Support', () => {
        it('has screen reader only description', () => {
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

            // Check for sr-only content
            expect(screen.getByText(/Decision tree with 3 nodes at depth 1 of 3/i)).toBeInTheDocument();
        });

        it('SVG is hidden from screen readers', () => {
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

            const svg = container.querySelector('svg');
            expect(svg).toHaveAttribute('aria-hidden', 'true');
        });
    });
});
