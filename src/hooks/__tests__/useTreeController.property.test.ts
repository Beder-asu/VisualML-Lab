/**
 * Property-based tests for useTreeController hook
 * 
 * Covers:
 *   Property 5: Tree building is monotonic (Requirements 1.3)
 *   Property 6: Parameter changes reset tree (Requirements 2.1, 2.2, 2.3, 2.5)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useTreeController } from '../useTreeController';
import type { TreeState } from '../useTreeController';

// ── Mock ML Engine ────────────────────────────────────────────────────────────
const createMockTreeState = (depth: number, maxDepth: number): TreeState => ({
    algorithm: 'decisionTree',
    dataset: {
        name: 'iris-2d',
        X: [[0.1, 0.2], [0.3, 0.4]],
        y: [0, 1],
        task: 'classification' as const,
    },
    root: {
        id: '0',
        depth: 0,
        feature: null,
        threshold: null,
        prediction: 0,
        samples: 2,
        impurity: 0.5,
        left: null,
        right: null,
    },
    currentDepth: depth,
    maxDepth,
    nodeCount: 1 + depth * 2,
    leafCount: 1 + depth,
    converged: depth >= maxDepth,
});

vi.mock('../../../engine/index.js', () => ({
    loadDataset: vi.fn((name: string) => ({
        name,
        X: [[0.1, 0.2], [0.3, 0.4]],
        y: [0, 1],
        task: 'classification',
    })),
}));

vi.mock('../../../engine/algorithms/decisionTree.js', () => ({
    initTreeState: vi.fn((_algorithm: string, _dataset: any, params: any) =>
        createMockTreeState(0, params.maxDepth)
    ),
    stepDecisionTree: vi.fn((state: TreeState, params: any) => {
        const newDepth = state.currentDepth + 1;
        return createMockTreeState(newDepth, params.maxDepth);
    }),
}));

// @ts-ignore
import { initTreeState, stepDecisionTree } from '../../../engine/algorithms/decisionTree.js';

// ── Arbitraries ───────────────────────────────────────────────────────────────

const arbMaxDepth = fc.integer({ min: 1, max: 8 });
const arbCriterion = fc.constantFrom('gini', 'entropy');
const arbMinSamplesSplit = fc.integer({ min: 2, max: 20 });

const arbTreeParams = fc.record({
    maxDepth: arbMaxDepth,
    criterion: arbCriterion,
    minSamplesSplit: arbMinSamplesSplit,
});

const arbStepCount = fc.integer({ min: 1, max: 10 });

beforeEach(() => {
    vi.clearAllMocks();
});

// ── Property 5: Tree building is monotonic ───────────────────────────────────
// Feature: decision-tree, Property 5: Tree building is monotonic
// Validates: Requirements 1.3

describe('Property 5: Tree building is monotonic', () => {
    it('for any sequence of step operations, tree depth increases by exactly 1 per step until maxDepth', () => {
        // Feature: decision-tree, Property 5: Tree building is monotonic
        // Validates: Requirements 1.3
        fc.assert(
            fc.property(
                arbTreeParams,
                arbStepCount,
                (params, stepCount) => {
                    const { result } = renderHook(() =>
                        useTreeController('decisionTree', 'iris-2d', params)
                    );

                    const [initialState] = result.current;
                    if (!initialState.treeState || initialState.error) return true;

                    let previousDepth = initialState.treeState.currentDepth;
                    expect(previousDepth).toBe(0);

                    for (let i = 0; i < stepCount; i++) {
                        if (result.current[0].isComplete) break;

                        act(() => {
                            result.current[1].step();
                        });

                        const currentDepth = result.current[0].treeState?.currentDepth ?? 0;

                        // Depth should increase by exactly 1
                        expect(currentDepth).toBe(previousDepth + 1);

                        // Depth should never exceed maxDepth
                        expect(currentDepth).toBeLessThanOrEqual(params.maxDepth);

                        // Depth should never decrease
                        expect(currentDepth).toBeGreaterThanOrEqual(previousDepth);

                        previousDepth = currentDepth;
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('for any tree state, depth never decreases during building', () => {
        // Feature: decision-tree, Property 5: Tree building is monotonic
        // Validates: Requirements 1.3
        fc.assert(
            fc.property(
                arbTreeParams,
                (params) => {
                    const { result } = renderHook(() =>
                        useTreeController('decisionTree', 'iris-2d', params)
                    );

                    const depths: number[] = [];
                    depths.push(result.current[0].treeState?.currentDepth ?? 0);

                    // Build tree to completion
                    while (!result.current[0].isComplete) {
                        act(() => {
                            result.current[1].step();
                        });
                        depths.push(result.current[0].treeState?.currentDepth ?? 0);
                    }

                    // Verify monotonicity: each depth >= previous depth
                    for (let i = 1; i < depths.length; i++) {
                        expect(depths[i]).toBeGreaterThanOrEqual(depths[i - 1]);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ── Property 6: Parameter changes reset tree ─────────────────────────────────
// Feature: decision-tree, Property 6: Parameter changes reset tree
// Validates: Requirements 2.1, 2.2, 2.3, 2.5

describe('Property 6: Parameter changes reset tree', () => {
    it('for any parameter change, tree resets to depth 0', () => {
        // Feature: decision-tree, Property 6: Parameter changes reset tree
        // Validates: Requirements 2.1, 2.2, 2.3, 2.5
        fc.assert(
            fc.property(
                arbTreeParams,
                arbTreeParams,
                arbStepCount,
                (initialParams, newParams, stepCount) => {
                    const { result } = renderHook(() =>
                        useTreeController('decisionTree', 'iris-2d', initialParams)
                    );

                    const [initialState] = result.current;
                    if (!initialState.treeState || initialState.error) return true;

                    // Build tree to some depth
                    for (let i = 0; i < stepCount && !result.current[0].isComplete; i++) {
                        act(() => {
                            result.current[1].step();
                        });
                    }

                    const depthBeforeUpdate = result.current[0].treeState?.currentDepth ?? 0;

                    // Only test if we actually built something
                    if (depthBeforeUpdate === 0) return true;

                    // Update parameters
                    act(() => {
                        result.current[1].updateParams(newParams);
                    });

                    // Tree should reset to depth 0
                    expect(result.current[0].treeState?.currentDepth).toBe(0);
                    expect(result.current[0].isBuilding).toBe(false);
                    expect(result.current[0].isComplete).toBe(false);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('for any maxDepth change, tree resets to depth 0', () => {
        // Feature: decision-tree, Property 6: Parameter changes reset tree
        // Validates: Requirements 2.1
        fc.assert(
            fc.property(
                arbTreeParams,
                arbMaxDepth,
                (initialParams, newMaxDepth) => {
                    const { result } = renderHook(() =>
                        useTreeController('decisionTree', 'iris-2d', initialParams)
                    );

                    // Build to depth 2
                    act(() => { result.current[1].step(); });
                    act(() => { result.current[1].step(); });

                    const depthBefore = result.current[0].treeState?.currentDepth ?? 0;
                    if (depthBefore === 0) return true;

                    // Change maxDepth
                    act(() => {
                        result.current[1].updateParams({ maxDepth: newMaxDepth });
                    });

                    expect(result.current[0].treeState?.currentDepth).toBe(0);
                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('for any criterion change, tree resets to depth 0', () => {
        // Feature: decision-tree, Property 6: Parameter changes reset tree
        // Validates: Requirements 2.2
        fc.assert(
            fc.property(
                arbTreeParams,
                arbCriterion,
                (initialParams, newCriterion) => {
                    const { result } = renderHook(() =>
                        useTreeController('decisionTree', 'iris-2d', initialParams)
                    );

                    // Build to depth 2
                    act(() => { result.current[1].step(); });
                    act(() => { result.current[1].step(); });

                    const depthBefore = result.current[0].treeState?.currentDepth ?? 0;
                    if (depthBefore === 0) return true;

                    // Change criterion
                    act(() => {
                        result.current[1].updateParams({ criterion: newCriterion });
                    });

                    expect(result.current[0].treeState?.currentDepth).toBe(0);
                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('for any minSamplesSplit change, tree resets to depth 0', () => {
        // Feature: decision-tree, Property 6: Parameter changes reset tree
        // Validates: Requirements 2.3
        fc.assert(
            fc.property(
                arbTreeParams,
                arbMinSamplesSplit,
                (initialParams, newMinSamplesSplit) => {
                    const { result } = renderHook(() =>
                        useTreeController('decisionTree', 'iris-2d', initialParams)
                    );

                    // Build to depth 2
                    act(() => { result.current[1].step(); });
                    act(() => { result.current[1].step(); });

                    const depthBefore = result.current[0].treeState?.currentDepth ?? 0;
                    if (depthBefore === 0) return true;

                    // Change minSamplesSplit
                    act(() => {
                        result.current[1].updateParams({ minSamplesSplit: newMinSamplesSplit });
                    });

                    expect(result.current[0].treeState?.currentDepth).toBe(0);
                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('for any parameter change during building, building stops', () => {
        // Feature: decision-tree, Property 6: Parameter changes reset tree
        // Validates: Requirements 2.5
        fc.assert(
            fc.property(
                arbTreeParams,
                arbTreeParams,
                (initialParams, newParams) => {
                    const { result } = renderHook(() =>
                        useTreeController('decisionTree', 'iris-2d', initialParams, 100)
                    );

                    // Start building
                    act(() => {
                        result.current[1].play();
                    });

                    expect(result.current[0].isBuilding).toBe(true);

                    // Change parameters
                    act(() => {
                        result.current[1].updateParams(newParams);
                    });

                    // Building should stop
                    expect(result.current[0].isBuilding).toBe(false);
                    expect(result.current[0].treeState?.currentDepth).toBe(0);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
