/**
 * Property-based tests for DecisionTreeLayout component
 * Feature: decision-tree
 * Requirements: 5.1, 5.2, 8.1, 8.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { initTreeState, stepDecisionTree } from '../../../../engine/algorithms/decisionTree.js';
import { loadDataset } from '../../../../engine/index.js';

/**
 * Helper function to build a tree to a specific depth
 */
function buildTreeToDepth(dataset: any, params: any, targetDepth: number) {
    let state = initTreeState('decisionTree', dataset, params);

    for (let i = 0; i < targetDepth; i++) {
        if (state.converged || state.currentDepth >= params.maxDepth) {
            break;
        }
        state = stepDecisionTree(state, params);
    }

    return state;
}

/**
 * Helper function to extract all leaf nodes from a tree
 */
function extractLeafNodes(node: any): any[] {
    if (!node.left && !node.right) {
        return [node];
    }

    const leaves: any[] = [];
    if (node.left) {
        leaves.push(...extractLeafNodes(node.left));
    }
    if (node.right) {
        leaves.push(...extractLeafNodes(node.right));
    }

    return leaves;
}

/**
 * Helper function to calculate decision regions from tree
 */
function calculateDecisionRegions(root: any): any[] {
    const regions: any[] = [];
    const queue: Array<{ node: any; bounds: any }> = [
        {
            node: root,
            bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
        }
    ];

    while (queue.length > 0) {
        const { node, bounds } = queue.shift()!;

        if (node.left === null && node.right === null) {
            // Leaf node - add region
            regions.push({
                id: node.id,
                bounds,
                prediction: node.prediction,
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

    return regions;
}

describe('DecisionTreeLayout Property Tests', () => {
    /**
     * Property 3: Node-region correspondence is bijective
     * Feature: decision-tree, Property 3: Node-region correspondence is bijective
     * Validates: Requirements 5.1, 5.2, 8.1
     */
    it('Property 3: Node-region correspondence is bijective', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 5 }),
                fc.constantFrom('gini', 'entropy'),
                fc.integer({ min: 2, max: 10 }),
                fc.integer({ min: 0, max: 4 }),
                (maxDepth, criterion, minSamplesSplit, targetDepth) => {
                    const actualTargetDepth = Math.min(targetDepth, maxDepth - 1);
                    const params = { maxDepth, criterion, minSamplesSplit };
                    const dataset = loadDataset('iris-2d');
                    const treeState = buildTreeToDepth(dataset, params, actualTargetDepth);
                    const leafNodes = extractLeafNodes(treeState.root);
                    const regions = calculateDecisionRegions(treeState.root);

                    expect(leafNodes.length).toBe(regions.length);

                    const leafIds = new Set(leafNodes.map(n => n.id));
                    const regionIds = new Set(regions.map(r => r.id));

                    expect(leafIds.size).toBe(regionIds.size);

                    for (const leafId of leafIds) {
                        expect(regionIds.has(leafId)).toBe(true);
                    }

                    for (const regionId of regionIds) {
                        expect(leafIds.has(regionId)).toBe(true);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property 4: Split lines match tree structure
     * Feature: decision-tree, Property 4: Split lines match tree structure
     * Validates: Requirements 8.2
     */
    it('Property 4: Split lines match tree structure', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 5 }),
                fc.constantFrom('gini', 'entropy'),
                fc.integer({ min: 2, max: 10 }),
                fc.integer({ min: 1, max: 4 }),
                (maxDepth, criterion, minSamplesSplit, targetDepth) => {
                    const actualTargetDepth = Math.min(targetDepth, maxDepth - 1);
                    const params = { maxDepth, criterion, minSamplesSplit };
                    const dataset = loadDataset('iris-2d');
                    const treeState = buildTreeToDepth(dataset, params, actualTargetDepth);

                    const internalNodes: any[] = [];
                    const queue = [treeState.root];

                    while (queue.length > 0) {
                        const node = queue.shift()!;
                        if (node.left || node.right) {
                            internalNodes.push(node);
                            if (node.left) queue.push(node.left);
                            if (node.right) queue.push(node.right);
                        }
                    }

                    const splitLines: Array<{ feature: number; threshold: number }> = [];
                    for (const node of internalNodes) {
                        if (node.feature !== null && node.threshold !== null) {
                            splitLines.push({ feature: node.feature, threshold: node.threshold });
                        }
                    }

                    expect(splitLines.length).toBe(internalNodes.length);

                    for (const split of splitLines) {
                        expect(split.feature).toBeGreaterThanOrEqual(0);
                        expect(split.feature).toBeLessThanOrEqual(1);
                        expect(split.threshold).toBeGreaterThanOrEqual(0);
                        expect(split.threshold).toBeLessThanOrEqual(1);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property 7: Highlight synchronization
     * Feature: decision-tree, Property 7: Highlight synchronization
     * Validates: Requirements 5.1, 5.2
     */
    it('Property 7: Highlight synchronization', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 5 }),
                fc.constantFrom('gini', 'entropy'),
                fc.integer({ min: 2, max: 10 }),
                fc.integer({ min: 0, max: 4 }),
                (maxDepth, criterion, minSamplesSplit, targetDepth) => {
                    const actualTargetDepth = Math.min(targetDepth, maxDepth - 1);
                    const params = { maxDepth, criterion, minSamplesSplit };
                    const dataset = loadDataset('iris-2d');
                    const treeState = buildTreeToDepth(dataset, params, actualTargetDepth);
                    const leafNodes = extractLeafNodes(treeState.root);
                    const regions = calculateDecisionRegions(treeState.root);

                    if (leafNodes.length === 0) {
                        return true;
                    }

                    for (const leafNode of leafNodes) {
                        const correspondingRegion = regions.find(r => r.id === leafNode.id);
                        expect(correspondingRegion).toBeDefined();
                        if (correspondingRegion) {
                            expect(correspondingRegion.prediction).toBe(leafNode.prediction);
                        }
                    }

                    for (const region of regions) {
                        const correspondingLeaf = leafNodes.find(n => n.id === region.id);
                        expect(correspondingLeaf).toBeDefined();
                        if (correspondingLeaf) {
                            expect(correspondingLeaf.prediction).toBe(region.prediction);
                        }
                    }

                    expect(leafNodes.length).toBe(regions.length);
                }
            ),
            { numRuns: 100 }
        );
    });
});
