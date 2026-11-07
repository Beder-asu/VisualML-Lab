import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initState, loadDataset } from '../../../engine/index.js';
import { useVisualization } from '../useVisualization';
import type { State } from '../../types/engine';

let now = 0;
let id = 0;
let frames: Map<number, FrameRequestCallback>;
beforeEach(() => {
    now = 0; id = 0; frames = new Map();
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => { frames.set(++id, fn); return id; });
    vi.stubGlobal('cancelAnimationFrame', (frame: number) => frames.delete(frame));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const tick = (time: number) => act(() => {
    now = time;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback(time));
});
const base = () => ({ ...initState('linearRegression', loadDataset('linear'), { lr: 0.1, nIter: 100 }), weights: [1] });

describe('boundary transition lifecycle', () => {
    it('continues from the displayed position when the next result interrupts animation', () => {
        const state = base();
        const { result, rerender } = renderHook(({ state }) => useVisualization(state), { initialProps: { state } });
        tick(200);
        rerender({ state: { ...state, bias: 1 } });
        tick(300);
        const displayed = result.current.boundaryPoints[0].y;
        expect(displayed).toBeCloseTo(0.875);
        rerender({ state: { ...state, bias: 2 } });
        tick(300);
        expect(result.current.boundaryPoints[0].y).toBeCloseTo(displayed);
        tick(500);
        expect(result.current.boundaryPoints[0].y).toBeCloseTo(2);
        expect(result.current.isAnimating).toBe(false);
    });
    it('does not cancel animation for unchanged geometry and cleans up on unmount', () => {
        const state = base();
        const { result, rerender, unmount } = renderHook(({ state }) => useVisualization(state), { initialProps: { state } });
        rerender({ state: { ...state, iteration: 1, loss: 0.4 } });
        tick(200);
        expect(result.current.isAnimating).toBe(false);
        rerender({ state: { ...state, bias: 1 } });
        expect(frames.size).toBe(1);
        unmount();
        expect(frames.size).toBe(0);
    });
    it('clears reset geometry and can restore identical model parameters', () => {
        const state: State = base();
        const { result, rerender } = renderHook(({ state }: { state: State | null }) => useVisualization(state), { initialProps: { state: state as State | null } });
        tick(200);
        rerender({ state: null });
        expect(result.current.boundaryPoints).toEqual([]);
        rerender({ state });
        tick(400);
        expect(result.current.boundaryPoints).toHaveLength(100);
    });
});
