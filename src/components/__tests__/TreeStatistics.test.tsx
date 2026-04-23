/**
 * Unit tests for TreeStatistics component
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TreeStatistics } from '../TreeStatistics';
import { TreeState } from '../../hooks/useTreeController';

describe('TreeStatistics', () => {
    // Helper to create a tree state for testing
    const createTreeState = (depth: number, converged: boolean = false): TreeState => {
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

        // Create a simple dataset for accuracy calculation
        const dataset = {
            name: 'test',
            X: [
                [0.3, 0.3],
                [0.7, 0.7],
                [0.2, 0.2],
                [0.8, 0.8],
            ],
            y: [0, 1, 0, 1],
            task: 'classification' as const,
        };

        return {
            algorithm: 'decisionTree',
            dataset,
            root,
            currentDepth: depth,
            maxDepth: 3,
            nodeCount: depth === 0 ? 1 : 3,
            leafCount: depth === 0 ? 1 : 2,
            converged,
        };
    };

    it('displays correct depth - Requirement 9.1', () => {
        const treeState = createTreeState(2);

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.getByText('Depth:')).toBeInTheDocument();
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('displays correct node count - Requirement 9.2', () => {
        const treeState = createTreeState(1);

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.getByText('Total Nodes:')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays correct leaf count - Requirement 9.3', () => {
        const treeState = createTreeState(1);

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.getByText('Leaf Nodes:')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays samples per leaf range - Requirement 9.4', () => {
        const treeState = createTreeState(1);

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.getByText('Samples per Leaf:')).toBeInTheDocument();
        expect(screen.getByText('50 - 50')).toBeInTheDocument();
    });

    it('displays accuracy when complete - Requirement 9.5', () => {
        const treeState = createTreeState(1, true);

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.getByText('Training Accuracy:')).toBeInTheDocument();
        // Should show some accuracy percentage
        expect(screen.getByText(/\d+\.\d+%/)).toBeInTheDocument();
    });

    it('does not display accuracy when not complete', () => {
        const treeState = createTreeState(1, false);

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.queryByText('Training Accuracy:')).not.toBeInTheDocument();
    });

    it('displays placeholder when no tree state', () => {
        render(<TreeStatistics treeState={null} />);

        expect(screen.getByText('Tree Statistics')).toBeInTheDocument();
        expect(screen.getByText('No tree data available')).toBeInTheDocument();
    });

    it('displays correct statistics at depth 0', () => {
        const treeState = createTreeState(0);

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.getByText('0 / 3')).toBeInTheDocument();
        expect(screen.getByText('Total Nodes:')).toBeInTheDocument();
        expect(screen.getByText('Leaf Nodes:')).toBeInTheDocument();
        // Both node count and leaf count are 1, so we use getAllByText
        const ones = screen.getAllByText('1');
        expect(ones).toHaveLength(2); // 1 node and 1 leaf
        expect(screen.getByText('100 - 100')).toBeInTheDocument(); // All samples in root
    });

    it('handles tree with varying samples per leaf', () => {
        const treeState = createTreeState(1);
        // Modify samples to have different values
        treeState.root.left!.samples = 30;
        treeState.root.right!.samples = 70;

        render(<TreeStatistics treeState={treeState} />);

        expect(screen.getByText('Samples per Leaf:')).toBeInTheDocument();
        expect(screen.getByText('30 - 70')).toBeInTheDocument();
    });
});
