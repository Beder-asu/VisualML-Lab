/**
 * Unit tests for useTreeController hook
 * 
 * Tests tree building state transitions, play/pause/step/reset controls
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTreeController } from '../useTreeController';
import type { TreeState, TreeParams } from '../useTreeController';

// ── Mock ML Engine ────────────────────────────────────────────────────────────
const mockTreeState: TreeState = {
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
    currentDepth: 0,
    maxDepth: 3,
    nodeCount: 1,
    leafCount: 1,
    converged: false,
};

vi.mock('../../../engine/index.js', () => ({
    loadDataset: vi.fn((name: string) => ({
        name,
        X: [[0.1, 0.2], [0.3, 0.4]],
        y: [0, 1],
        task: 'classification',
    })),
}));

vi.mock('../../../engine/algorithms/decisionTree.js', () => ({
    initTreeState: vi.fn((_algorithm: string, dataset: any, params: any) => ({
        ...mockTreeState,
        dataset,
        maxDepth: params.maxDepth,
    })),
    stepDecisionTree: vi.fn((state: TreeState, _params: any) => ({
        ...state,
        currentDepth: state.currentDepth + 1,
        nodeCount: state.nodeCount + 2,
        leafCount: state.leafCount + 1,
        converged: state.currentDepth + 1 >= state.maxDepth,
    })),
}));

// @ts-ignore
import { initTreeState, stepDecisionTree } from '../../../engine/algorithms/decisionTree.js';
// @ts-ignore
import { loadDataset } from '../../../engine/index.js';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTreeController', () => {
    const defaultParams: TreeParams = {
        maxDepth: 3,
        criterion: 'gini',
        minSamplesSplit: 2,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // ── Initialization (Requirement 1.4) ────────────────────────────────────

    it('initializes at depth 0', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        const [state] = result.current;
        expect(state.treeState).toBeTruthy();
        expect(state.treeState?.currentDepth).toBe(0);
        expect(state.isBuilding).toBe(false);
        expect(state.isPaused).toBe(false);
        expect(state.isComplete).toBe(false);
        expect(state.error).toBeNull();
    });

    it('throws error for non-decisionTree algorithm', () => {
        expect(() => {
            renderHook(() =>
                useTreeController('linearRegression', 'iris-2d', defaultParams)
            );
        }).toThrow("useTreeController expects 'decisionTree'");
    });

    it('handles initialization errors gracefully', () => {
        vi.mocked(initTreeState).mockImplementationOnce(() => {
            throw new Error('Invalid dataset');
        });

        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'invalid-dataset', defaultParams)
        );

        const [state] = result.current;
        expect(state.treeState).toBeNull();
        expect(state.error).toContain('Invalid dataset');
    });

    // ── Step (Requirement 1.3) ──────────────────────────────────────────────

    it('step increases depth by 1', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        act(() => {
            result.current[1].step();
        });

        expect(result.current[0].treeState?.currentDepth).toBe(1);
        expect(stepDecisionTree).toHaveBeenCalledTimes(1);
    });

    it('step does not execute when tree is complete', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        // Build to completion
        act(() => {
            result.current[1].step(); // depth 1
        });
        act(() => {
            result.current[1].step(); // depth 2
        });
        act(() => {
            result.current[1].step(); // depth 3 (complete)
        });

        const callCount = vi.mocked(stepDecisionTree).mock.calls.length;

        // Try to step again
        act(() => {
            result.current[1].step();
        });

        // Should not have called stepDecisionTree again
        expect(stepDecisionTree).toHaveBeenCalledTimes(callCount);
    });

    it('step marks tree as complete when max depth reached', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', { ...defaultParams, maxDepth: 1 })
        );

        act(() => {
            result.current[1].step();
        });

        expect(result.current[0].isComplete).toBe(true);
        expect(result.current[0].isBuilding).toBe(false);
    });

    // ── Play (Requirement 1.1) ──────────────────────────────────────────────

    it('play builds tree automatically', async () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams, 100)
        );

        act(() => {
            result.current[1].play();
        });

        expect(result.current[0].isBuilding).toBe(true);

        // Advance timers to trigger interval
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current[0].treeState?.currentDepth).toBe(1);

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current[0].treeState?.currentDepth).toBe(2);
    });

    it('play stops when max depth reached', async () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', { ...defaultParams, maxDepth: 2 }, 100)
        );

        act(() => {
            result.current[1].play();
        });

        // Advance to depth 1
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        // Advance to depth 2 (complete)
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current[0].isComplete).toBe(true);
        expect(result.current[0].isBuilding).toBe(false);
        expect(result.current[0].isPaused).toBe(true);
    });

    it('play does not start when tree is complete', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', { ...defaultParams, maxDepth: 0 }, 100)
        );

        // Tree is already complete at depth 0
        act(() => {
            result.current[1].step();
        });

        const initialDepth = result.current[0].treeState?.currentDepth;

        act(() => {
            result.current[1].play();
        });

        expect(result.current[0].isBuilding).toBe(false);
        expect(result.current[0].treeState?.currentDepth).toBe(initialDepth);
    });

    // ── Pause (Requirement 1.2) ─────────────────────────────────────────────

    it('pause stops building', async () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams, 100)
        );

        act(() => {
            result.current[1].play();
        });

        expect(result.current[0].isBuilding).toBe(true);

        act(() => {
            result.current[1].pause();
        });

        expect(result.current[0].isBuilding).toBe(false);
        expect(result.current[0].isPaused).toBe(true);

        const depthAfterPause = result.current[0].treeState?.currentDepth;

        // Advance timers - should not build further
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current[0].treeState?.currentDepth).toBe(depthAfterPause);
    });

    // ── Reset (Requirement 1.4) ─────────────────────────────────────────────

    it('reset returns to depth 0', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        // Build to depth 2
        act(() => {
            result.current[1].step();
        });
        act(() => {
            result.current[1].step();
        });

        expect(result.current[0].treeState?.currentDepth).toBe(2);

        act(() => {
            result.current[1].reset();
        });

        expect(result.current[0].treeState?.currentDepth).toBe(0);
        expect(result.current[0].isBuilding).toBe(false);
        expect(result.current[0].isPaused).toBe(false);
        expect(result.current[0].isComplete).toBe(false);
    });

    it('reset stops playback', async () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams, 100)
        );

        act(() => {
            result.current[1].play();
        });

        expect(result.current[0].isBuilding).toBe(true);

        act(() => {
            result.current[1].reset();
        });

        expect(result.current[0].isBuilding).toBe(false);

        // Advance timers - should not build
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current[0].treeState?.currentDepth).toBe(0);
    });

    // ── Parameter changes (Requirement 2.5) ─────────────────────────────────

    it('parameter changes reset tree', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        // Build to depth 2
        act(() => {
            result.current[1].step();
        });
        act(() => {
            result.current[1].step();
        });

        expect(result.current[0].treeState?.currentDepth).toBe(2);

        act(() => {
            result.current[1].updateParams({ maxDepth: 5 });
        });

        expect(result.current[0].treeState?.currentDepth).toBe(0);
        expect(initTreeState).toHaveBeenCalledWith(
            'decisionTree',
            expect.anything(),
            expect.objectContaining({ maxDepth: 5 })
        );
    });

    it('parameter changes pause building', async () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams, 100)
        );

        act(() => {
            result.current[1].play();
        });

        expect(result.current[0].isBuilding).toBe(true);

        act(() => {
            result.current[1].updateParams({ criterion: 'entropy' });
        });

        expect(result.current[0].isBuilding).toBe(false);

        // Advance timers - should not build
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current[0].treeState?.currentDepth).toBe(0);
    });

    // ── Dataset changes ─────────────────────────────────────────────────────

    it('dataset changes reset tree', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        act(() => {
            result.current[1].step();
        });

        expect(result.current[0].treeState?.currentDepth).toBe(1);

        act(() => {
            result.current[1].changeDataset('blobs');
        });

        expect(result.current[0].treeState?.currentDepth).toBe(0);
        expect(loadDataset).toHaveBeenCalledWith('blobs');
    });

    // ── Error handling ──────────────────────────────────────────────────────

    it('handles step errors gracefully', () => {
        vi.mocked(stepDecisionTree).mockImplementationOnce(() => {
            throw new Error('Step failed');
        });

        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        act(() => {
            result.current[1].step();
        });

        expect(result.current[0].error).toContain('Step failed');
        expect(result.current[0].isBuilding).toBe(false);
    });

    it('clearError restores last valid state', () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams)
        );

        // Build to depth 1 successfully
        act(() => {
            result.current[1].step();
        });

        const validDepth = result.current[0].treeState?.currentDepth;

        // Cause an error on next step
        vi.mocked(stepDecisionTree).mockImplementationOnce(() => {
            throw new Error('Step failed');
        });

        act(() => {
            result.current[1].step();
        });

        expect(result.current[0].error).toBeTruthy();

        act(() => {
            result.current[1].clearError();
        });

        expect(result.current[0].error).toBeNull();
        expect(result.current[0].treeState?.currentDepth).toBe(validDepth);
    });

    it('stops building on error during play', async () => {
        const { result } = renderHook(() =>
            useTreeController('decisionTree', 'iris-2d', defaultParams, 100)
        );

        act(() => {
            result.current[1].play();
        });

        // First step succeeds
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current[0].treeState?.currentDepth).toBe(1);

        // Mock error on next step
        vi.mocked(stepDecisionTree).mockImplementationOnce(() => {
            throw new Error('Build error');
        });

        // Second step fails
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current[0].error).toContain('Build error');
        expect(result.current[0].isBuilding).toBe(false);
        expect(result.current[0].isPaused).toBe(true);

        // Should not continue building
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current[0].treeState?.currentDepth).toBe(1);
    });
});
