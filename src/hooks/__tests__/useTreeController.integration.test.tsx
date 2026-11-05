import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadDataset } from '../../../engine/index.js';
// @ts-ignore — JavaScript tree engine is also exercised by the Node suite.
import { initTreeState, stepDecisionTree } from '../../../engine/algorithms/decisionTree.js';
import { useTreeController } from '../useTreeController';
import { TreeStatistics } from '../../components/TreeStatistics';

afterEach(() => vi.useRealTimers());
describe('real decision-tree completion and scheduling', () => {
    it.each([1, 3])('shows real-engine accuracy at the selected maximum depth %i', maxDepth => {
        const params = { maxDepth, criterion: 'gini' as const, minSamplesSplit: 2 };
        let state = initTreeState('decisionTree', loadDataset('iris-2d'), params);
        while (!state.converged && state.currentDepth < maxDepth) state = stepDecisionTree(state, params);
        render(<TreeStatistics treeState={state} />);
        expect(screen.getByText('Training Accuracy:')).toBeInTheDocument();
        // Independent traversal of real leaves, not mocked completion metadata.
        let correct = 0;
        state.dataset.X.forEach((row: number[], i: number) => {
            let node = state.root;
            while (node.left && node.right) node = row[node.feature] <= node.threshold ? node.left : node.right;
            if (node.prediction === state.dataset.y[i]) correct++;
        });
        expect(screen.getByText(`${(100 * correct / state.dataset.X.length).toFixed(1)}%`)).toBeInTheDocument();
    });
    it('applies speed changes without resetting progress or leaving a previous interval', () => {
        vi.useFakeTimers();
        const params = { maxDepth: 8, criterion: 'gini' as const, minSamplesSplit: 2 };
        const { result, rerender, unmount } = renderHook(({ speed }) =>
            useTreeController('decisionTree', 'iris-2d', params, speed), { initialProps: { speed: 500 } });
        act(() => result.current[1].play());
        act(() => vi.advanceTimersByTime(500));
        expect(result.current[0].treeState?.currentDepth).toBe(1);
        rerender({ speed: 100 });
        expect(result.current[0].treeState?.currentDepth).toBe(1);
        act(() => vi.advanceTimersByTime(99));
        expect(result.current[0].treeState?.currentDepth).toBe(1);
        act(() => vi.advanceTimersByTime(1));
        expect(result.current[0].treeState?.currentDepth).toBe(2);
        expect(vi.getTimerCount()).toBe(1);
        act(() => result.current[1].pause());
        expect(vi.getTimerCount()).toBe(0);
        unmount();
        expect(vi.getTimerCount()).toBe(0);
    });
});
