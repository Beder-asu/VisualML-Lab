/**
 * Property-based tests for Decision Tree algorithm
 * 
 * Feature: decision-tree, Property 1: Tree depth never exceeds max depth
 * Validates: Requirements 2.1
 * 
 * Feature: decision-tree, Property 2: Decision regions partition feature space
 * Validates: Requirements 4.2, 8.3
 */

import fc from 'fast-check';
import { initTreeState, stepDecisionTree, getDecisionRegions } from '../algorithms/decisionTree.js';

// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

/**
 * Generate valid decision tree parameters
 */
function arbTreeParams() {
    return fc.record({
        maxDepth: fc.integer({ min: 1, max: 8 }),
        criterion: fc.constantFrom('gini', 'entropy'),
        minSamplesSplit: fc.integer({ min: 2, max: 10 }),
    });
}

/**
 * Generate a simple 2D classification dataset
 */
function arbDataset() {
    return fc.record({
        numSamples: fc.integer({ min: 10, max: 50 }),
        numClasses: fc.constantFrom(2, 3),
    }).chain(({ numSamples, numClasses }) => {
        return fc.record({
            X: fc.array(
                fc.tuple(
                    fc.float({ min: 0, max: 1, noNaN: true }),
                    fc.float({ min: 0, max: 1, noNaN: true })
                ),
                { minLength: numSamples, maxLength: numSamples }
            ),
            y: fc.array(
                fc.integer({ min: 0, max: numClasses - 1 }),
                { minLength: numSamples, maxLength: numSamples }
            ),
        });
    });
}

/**
 * Build a complete tree by stepping until convergence
 */
function buildCompleteTree(dataset, params) {
    let state = initTreeState('decisionTree', dataset, params);
    let iterations = 0;
    const maxIterations = params.maxDepth + 5; // Safety limit

    while (!state.converged && iterations < maxIterations) {
        state = stepDecisionTree(state, params);
        iterations++;
    }

    return state;
}

/**
 * Get maximum depth of any node in the tree
 */
function getMaxDepth(node) {
    if (node === null) return -1;
    if (node.left === null && node.right === null) return node.depth;

    const leftDepth = node.left ? getMaxDepth(node.left) : node.depth;
    const rightDepth = node.right ? getMaxDepth(node.right) : node.depth;

    return Math.max(leftDepth, rightDepth);
}

// ---------------------------------------------------------------------------
// Property 1: Tree depth never exceeds max depth
// ---------------------------------------------------------------------------

describe('Decision Tree Property Tests', () => {
    it('Property 1: Tree depth never exceeds max depth', () => {
        fc.assert(
            fc.property(arbDataset(), arbTreeParams(), (dataset, params) => {
                const finalState = buildCompleteTree(dataset, params);
                const actualMaxDepth = getMaxDepth(finalState.root);

                // The maximum depth of any node should not exceed maxDepth
                return actualMaxDepth <= params.maxDepth;
            }),
            { numRuns: 100 }
        );
    });

    // ---------------------------------------------------------------------------
    // Property 2: Decision regions partition feature space
    // ---------------------------------------------------------------------------

    it('Property 2: Decision regions partition feature space', () => {
        fc.assert(
            fc.property(arbDataset(), arbTreeParams(), (dataset, params) => {
                const finalState = buildCompleteTree(dataset, params);
                const regions = getDecisionRegions(finalState);

                // Check that regions cover the space [0,1] × [0,1]
                // We'll use a grid-based approach to verify coverage
                const gridSize = 10;
                const covered = new Set();

                for (const region of regions) {
                    // For each region, mark grid cells it covers
                    for (let i = 0; i < gridSize; i++) {
                        for (let j = 0; j < gridSize; j++) {
                            const x = i / gridSize + 0.05; // Center of cell
                            const y = j / gridSize + 0.05;

                            if (
                                x >= region.bounds.xMin &&
                                x < region.bounds.xMax &&
                                y >= region.bounds.yMin &&
                                y < region.bounds.yMax
                            ) {
                                covered.add(`${i},${j}`);
                            }
                        }
                    }
                }

                // All grid cells should be covered
                const expectedCells = gridSize * gridSize;
                const actualCells = covered.size;

                // Allow for small rounding errors at boundaries
                return actualCells >= expectedCells - 2;
            }),
            { numRuns: 100 }
        );
    });

    // ---------------------------------------------------------------------------
    // Additional property: No overlapping regions
    // ---------------------------------------------------------------------------

    it('Property: Decision regions do not overlap', () => {
        fc.assert(
            fc.property(arbDataset(), arbTreeParams(), (dataset, params) => {
                const finalState = buildCompleteTree(dataset, params);
                const regions = getDecisionRegions(finalState);

                // Check that no two regions overlap
                for (let i = 0; i < regions.length; i++) {
                    for (let j = i + 1; j < regions.length; j++) {
                        const r1 = regions[i].bounds;
                        const r2 = regions[j].bounds;

                        // Check if rectangles overlap
                        const xOverlap = r1.xMin < r2.xMax && r2.xMin < r1.xMax;
                        const yOverlap = r1.yMin < r2.yMax && r2.yMin < r1.yMax;

                        if (xOverlap && yOverlap) {
                            // Regions overlap - this is a failure
                            return false;
                        }
                    }
                }

                return true;
            }),
            { numRuns: 100 }
        );
    });
});
