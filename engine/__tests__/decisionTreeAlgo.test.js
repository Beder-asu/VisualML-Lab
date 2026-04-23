import {
    calculateGini,
    calculateEntropy,
    findBestSplit,
    initTreeState,
    stepDecisionTree,
    getDecisionRegions,
} from '../algorithms/decisionTree.js';

describe('Decision Tree Algorithm', () => {
    describe('calculateGini', () => {
        it('should return 0 for pure node', () => {
            const labels = [0, 0, 0, 0];
            expect(calculateGini(labels)).toBe(0);
        });

        it('should return 0.5 for perfectly impure binary node', () => {
            const labels = [0, 1];
            expect(calculateGini(labels)).toBe(0.5);
        });

        it('should return 0 for empty array', () => {
            expect(calculateGini([])).toBe(0);
        });

        it('should calculate correct Gini for mixed labels', () => {
            const labels = [0, 0, 1];
            const expected = 1 - (2 / 3) ** 2 - (1 / 3) ** 2;
            expect(calculateGini(labels)).toBeCloseTo(expected, 5);
        });
    });

    describe('calculateEntropy', () => {
        it('should return 0 for pure node', () => {
            const labels = [1, 1, 1, 1];
            expect(calculateEntropy(labels)).toBe(0);
        });

        it('should return 1 for perfectly impure binary node', () => {
            const labels = [0, 1];
            expect(calculateEntropy(labels)).toBe(1);
        });

        it('should return 0 for empty array', () => {
            expect(calculateEntropy([])).toBe(0);
        });

        it('should calculate correct entropy for mixed labels', () => {
            const labels = [0, 0, 1];
            const expected = -(2 / 3) * Math.log2(2 / 3) - (1 / 3) * Math.log2(1 / 3);
            expect(calculateEntropy(labels)).toBeCloseTo(expected, 5);
        });
    });

    describe('findBestSplit', () => {
        it('should find best split for simple 2D data', () => {
            const X = [[0.1, 0.1], [0.2, 0.2], [0.8, 0.8], [0.9, 0.9]];
            const y = [0, 0, 1, 1];
            const indices = [0, 1, 2, 3];

            const split = findBestSplit(X, y, indices, 'gini', 2);

            expect(split).not.toBeNull();
            expect(split.feature).toBeGreaterThanOrEqual(0);
            expect(split.feature).toBeLessThan(2);
            expect(split.threshold).toBeGreaterThan(0.2);
            expect(split.threshold).toBeLessThan(0.8);
            expect(split.gain).toBeGreaterThan(0);
        });

        it('should return null when samples below minSamplesSplit', () => {
            const X = [[0.5, 0.5]];
            const y = [0];
            const indices = [0];

            const split = findBestSplit(X, y, indices, 'gini', 2);

            expect(split).toBeNull();
        });

        it('should return null for pure node', () => {
            const X = [[0.1, 0.1], [0.2, 0.2]];
            const y = [0, 0];
            const indices = [0, 1];

            const split = findBestSplit(X, y, indices, 'gini', 2);

            expect(split).toBeNull();
        });

        it('should work with entropy criterion', () => {
            const X = [[0.1, 0.1], [0.2, 0.2], [0.8, 0.8], [0.9, 0.9]];
            const y = [0, 0, 1, 1];
            const indices = [0, 1, 2, 3];

            const split = findBestSplit(X, y, indices, 'entropy', 2);

            expect(split).not.toBeNull();
            expect(split.gain).toBeGreaterThan(0);
        });
    });

    describe('initTreeState', () => {
        it('should initialize tree with root node at depth 0', () => {
            const dataset = {
                X: [[0.1, 0.1], [0.2, 0.2], [0.8, 0.8], [0.9, 0.9]],
                y: [0, 0, 1, 1],
            };
            const params = { maxDepth: 3, criterion: 'gini', minSamplesSplit: 2 };

            const state = initTreeState('decisionTree', dataset, params);

            expect(state.algorithm).toBe('decisionTree');
            expect(state.currentDepth).toBe(0);
            expect(state.maxDepth).toBe(3);
            expect(state.nodeCount).toBe(1);
            expect(state.leafCount).toBe(1);
            expect(state.converged).toBe(false);
            expect(state.root).toBeDefined();
            expect(state.root.id).toBe('0');
            expect(state.root.depth).toBe(0);
            expect(state.root.samples).toBe(4);
            expect(state.root.left).toBeNull();
            expect(state.root.right).toBeNull();
        });

        it('should calculate root node statistics correctly', () => {
            const dataset = { X: [[0.5, 0.5], [0.6, 0.6]], y: [0, 1] };
            const params = { maxDepth: 2, criterion: 'gini', minSamplesSplit: 2 };

            const state = initTreeState('decisionTree', dataset, params);

            expect(state.root.samples).toBe(2);
            expect(state.root.impurity).toBe(0.5);
            expect(state.root.prediction).toBeGreaterThanOrEqual(0);
        });

        it('should throw error for wrong algorithm', () => {
            const dataset = { X: [[0.5, 0.5]], y: [0] };
            const params = { maxDepth: 2, criterion: 'gini', minSamplesSplit: 2 };

            expect(() => initTreeState('linearRegression', dataset, params)).toThrow();
        });
    });

    describe('stepDecisionTree', () => {
        it('should build one level of the tree', () => {
            const dataset = {
                X: [[0.1, 0.1], [0.2, 0.2], [0.8, 0.8], [0.9, 0.9]],
                y: [0, 0, 1, 1],
            };
            const params = { maxDepth: 3, criterion: 'gini', minSamplesSplit: 2 };

            let state = initTreeState('decisionTree', dataset, params);
            expect(state.currentDepth).toBe(0);

            state = stepDecisionTree(state, params);

            expect(state.currentDepth).toBe(1);
            expect(state.root.left).not.toBeNull();
            expect(state.root.right).not.toBeNull();
            expect(state.root.left.depth).toBe(1);
            expect(state.root.right.depth).toBe(1);
        });

        it('should converge when max depth is reached', () => {
            const dataset = { X: [[0.1, 0.1], [0.9, 0.9]], y: [0, 1] };
            const params = { maxDepth: 1, criterion: 'gini', minSamplesSplit: 2 };

            let state = initTreeState('decisionTree', dataset, params);
            state = stepDecisionTree(state, params);

            expect(state.currentDepth).toBe(1);
            expect(state.converged).toBe(false);

            state = stepDecisionTree(state, params);

            expect(state.converged).toBe(true);
            expect(state.currentDepth).toBe(1);
        });

        it('should handle multiple steps correctly', () => {
            const dataset = {
                X: [
                    [0.1, 0.1],
                    [0.2, 0.2],
                    [0.5, 0.5],
                    [0.6, 0.6],
                    [0.8, 0.8],
                    [0.9, 0.9],
                ],
                y: [0, 0, 1, 1, 1, 1],
            };
            const params = { maxDepth: 3, criterion: 'gini', minSamplesSplit: 2 };

            let state = initTreeState('decisionTree', dataset, params);

            state = stepDecisionTree(state, params);
            expect(state.currentDepth).toBe(1);
            const depthOneNodeCount = state.nodeCount;

            state = stepDecisionTree(state, params);
            expect(state.currentDepth).toBeGreaterThanOrEqual(1);
            expect(state.nodeCount).toBeGreaterThanOrEqual(depthOneNodeCount);
        });

        it('should respect minSamplesSplit parameter', () => {
            const dataset = { X: [[0.1, 0.1], [0.9, 0.9]], y: [0, 1] };
            const params = { maxDepth: 5, criterion: 'gini', minSamplesSplit: 10 };

            let state = initTreeState('decisionTree', dataset, params);
            state = stepDecisionTree(state, params);

            expect(state.converged).toBe(true);
        });
    });

    describe('getDecisionRegions', () => {
        it('should return single region for root-only tree', () => {
            const dataset = { X: [[0.5, 0.5], [0.6, 0.6]], y: [0, 1] };
            const params = { maxDepth: 3, criterion: 'gini', minSamplesSplit: 2 };

            const state = initTreeState('decisionTree', dataset, params);
            const regions = getDecisionRegions(state);

            expect(regions).toHaveLength(1);
            expect(regions[0].id).toBe('0');
            expect(regions[0].bounds).toEqual({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 });
        });

        it('should return correct regions after one split', () => {
            const dataset = {
                X: [[0.1, 0.1], [0.2, 0.2], [0.8, 0.8], [0.9, 0.9]],
                y: [0, 0, 1, 1],
            };
            const params = { maxDepth: 3, criterion: 'gini', minSamplesSplit: 2 };

            let state = initTreeState('decisionTree', dataset, params);
            state = stepDecisionTree(state, params);

            const regions = getDecisionRegions(state);

            expect(regions).toHaveLength(2);
            expect(regions[0].id).toContain('L');
            expect(regions[1].id).toContain('R');

            const totalArea =
                (regions[0].bounds.xMax - regions[0].bounds.xMin) *
                (regions[0].bounds.yMax - regions[0].bounds.yMin) +
                (regions[1].bounds.xMax - regions[1].bounds.xMin) *
                (regions[1].bounds.yMax - regions[1].bounds.yMin);

            expect(totalArea).toBeCloseTo(1.0, 5);
        });

        it('should have each region with prediction and samples', () => {
            const dataset = { X: [[0.1, 0.1], [0.9, 0.9]], y: [0, 1] };
            const params = { maxDepth: 2, criterion: 'gini', minSamplesSplit: 2 };

            let state = initTreeState('decisionTree', dataset, params);
            state = stepDecisionTree(state, params);

            const regions = getDecisionRegions(state);

            for (const region of regions) {
                expect(region.prediction).toBeGreaterThanOrEqual(0);
                expect(region.samples).toBeGreaterThan(0);
            }
        });
    });
});
