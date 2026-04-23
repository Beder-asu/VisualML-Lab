/**
 * Unit tests for useEngineWorker hook
 *
 * Tests worker lifecycle, message posting, and callback wiring.
 * Decision: 2A
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEngineWorker } from '../useEngineWorker';
import type { StepResultMessage, ErrorMessage } from '../../types/worker';

// ── Mock Worker ───────────────────────────────────────────────────────────────

/** Minimal Worker mock that captures postMessage calls and exposes a way to
 *  simulate incoming messages from the worker side. */
class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    terminate = vi.fn();
    postMessage = vi.fn();

    /** Helper used by tests to simulate a message arriving from the worker */
    simulateMessage(data: unknown) {
        this.onmessage?.({ data } as MessageEvent);
    }
}

let mockWorkerInstance: MockWorker;

beforeEach(() => {
    mockWorkerInstance = new MockWorker();
    // Worker must be stubbed as a real constructor that returns our mock instance
    function MockWorkerConstructor(this: any, _url: unknown, _opts: unknown) {
        return mockWorkerInstance;
    }
    vi.stubGlobal('Worker', MockWorkerConstructor);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useEngineWorker', () => {
    const fakeState = {
        algorithm: 'logistic',
        weights: [0.1, 0.2],
        bias: 0,
        loss: null,
        iteration: 0,
        converged: false,
        dataset: { name: 'blobs', X: [[0, 1]], y: [0] },
    } as any;

    const fakeParams = { learningRate: 0.01, maxIterations: 100 } as any;

    it('requestStep posts the correct message shape', () => {
        const { result } = renderHook(() => useEngineWorker());

        act(() => {
            result.current.requestStep(fakeState, fakeParams, 42);
        });

        expect(mockWorkerInstance.postMessage).toHaveBeenCalledOnce();
        expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
            type: 'step',
            state: fakeState,
            params: fakeParams,
            generation: 42,
        });
    });

    it('onResult callback fires when worker posts a step:result message', () => {
        const { result } = renderHook(() => useEngineWorker());

        const onResult = vi.fn();
        act(() => {
            result.current.setOnResult(onResult);
        });

        const resultMsg: StepResultMessage = {
            type: 'step:result',
            state: { ...fakeState, iteration: 1 },
            generation: 1,
        };

        act(() => {
            mockWorkerInstance.simulateMessage(resultMsg);
        });

        expect(onResult).toHaveBeenCalledOnce();
        expect(onResult).toHaveBeenCalledWith(resultMsg);
    });

    it('onError callback fires when worker posts an error message', () => {
        const { result } = renderHook(() => useEngineWorker());

        const onError = vi.fn();
        act(() => {
            result.current.setOnError(onError);
        });

        const errorMsg: ErrorMessage = {
            type: 'error',
            message: 'something went wrong',
            generation: 3,
        };

        act(() => {
            mockWorkerInstance.simulateMessage(errorMsg);
        });

        expect(onError).toHaveBeenCalledOnce();
        expect(onError).toHaveBeenCalledWith(errorMsg);
    });

    it('worker is terminated on unmount', () => {
        const { unmount } = renderHook(() => useEngineWorker());

        expect(mockWorkerInstance.terminate).not.toHaveBeenCalled();

        unmount();

        expect(mockWorkerInstance.terminate).toHaveBeenCalledOnce();
    });
});
