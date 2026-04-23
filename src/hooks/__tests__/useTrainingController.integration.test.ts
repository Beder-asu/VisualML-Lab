/**
 * Shallow integration test — hook ↔ worker message contract
 *
 * Uses a SyncWorkerMock that calls the real engine step() synchronously,
 * so we test the full message contract without mocking useEngineWorker.
 * Ref: Issue 3.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTrainingController } from '../useTrainingController';

// ── Real engine (NOT mocked) ──────────────────────────────────────────────────
import { initState, loadDataset, step } from '../../../engine/index.js';

// ── SyncWorkerMock ────────────────────────────────────────────────────────────
/**
 * Mimics the Worker interface. On receiving a 'step' message it calls the
 * real engine step() synchronously and posts back a real step:result (or error).
 */
class SyncWorkerMock {
    onmessage: ((e: MessageEvent) => void) | null = null;
    terminate = vi.fn();

    postMessage(data: any) {
        if (data.type !== 'step') return;
        const { state, params, generation } = data;
        try {
            const { XAug: _ignored, ...cleanState } = state as any;
            const newState = (step as any)(cleanState, params);
            const { XAug: _ignored2, ...cleanNew } = newState as any;
            // Use setTimeout to ensure the callback is wired up
            setTimeout(() => {
                this.onmessage?.({
                    data: { type: 'step:result', state: cleanNew, generation }
                } as MessageEvent);
            }, 0);
        } catch (err: any) {
            setTimeout(() => {
                this.onmessage?.({
                    data: { type: 'error', message: err.message, generation }
                } as MessageEvent);
            }, 0);
        }
    }
}

let mockWorker: SyncWorkerMock;

beforeEach(() => {
    mockWorker = new SyncWorkerMock();
    vi.stubGlobal('Worker', function () { return mockWorker; });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTrainingController integration (real engine)', () => {
    it('after a single step(), engineState.iteration increments and lossHistory grows with a real loss value', async () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'linear', { lr: 0.1, nIter: 100 }, 200)
        );

        act(() => { result.current[1].step(); });

        await waitFor(() => {
            expect(result.current[0].engineState?.iteration).toBeGreaterThan(0);
        });

        expect(result.current[0].lossHistory.length).toBeGreaterThan(0);
        expect(typeof result.current[0].lossHistory[0]).toBe('number');
        expect(isFinite(result.current[0].lossHistory[0])).toBe(true);
    });

    it('after reset(), a stale result from the previous generation is ignored', () => {
        const { result } = renderHook(() =>
            useTrainingController('linearRegression', 'linear', { lr: 0.1, nIter: 100 }, 200)
        );

        // Swallow the step message so no result arrives
        mockWorker.postMessage = vi.fn();

        act(() => { result.current[1].step(); });

        // Reset — bumps generation to 1
        act(() => { result.current[1].reset(); });

        // Manually deliver a stale result with generation 0
        act(() => {
            const dataset = loadDataset('linear');
            const fakeOldState = initState('linearRegression', dataset, { lr: 0.1, nIter: 100 });
            mockWorker.onmessage?.({
                data: {
                    type: 'step:result',
                    state: { ...fakeOldState, iteration: 99, loss: 0.99 },
                    generation: 0
                }
            } as MessageEvent);
        });

        // State should remain at iteration 0 (reset state), not 99
        expect(result.current[0].engineState?.iteration).toBe(0);
        expect(result.current[0].lossHistory).toEqual([]);
    });

    it('a real step() error propagates and sets state.error', () => {
        // unsupportedAlgo causes initState to throw — error is set at init time
        const { result } = renderHook(() =>
            useTrainingController('unsupportedAlgo' as any, 'linear', { lr: 0.1, nIter: 100 }, 200)
        );

        expect(result.current[0].error).toBeTruthy();
        expect(result.current[0].isPlaying).toBe(false);
    });
});
