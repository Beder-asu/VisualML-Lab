import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { step } from '../../../engine/index.js';
import type { State, Params } from '../../types/engine';
import { useTrainingController } from '../useTrainingController';

class DelayedWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    terminate = vi.fn();
    requests: Array<{ state: State; params: Params; generation: number }> = [];
    postMessage(message: { state: State; params: Params; generation: number }) {
        this.requests.push(structuredClone(message));
    }
    deliver() {
        const message = this.requests.shift()!;
        this.onmessage?.({ data: {
            type: 'step:result', generation: message.generation,
            state: step(message.state, message.params),
        } } as MessageEvent);
    }
}
let worker: DelayedWorker;
beforeEach(() => {
    worker = new DelayedWorker();
    vi.stubGlobal('Worker', function () { return worker; });
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const params = { lr: 0.1, nIter: 10 };
const setup = () => renderHook(() => useTrainingController('linearRegression', 'linear', params, 100));

describe('accepted manual steps with delayed real-engine responses', () => {
    it('advances each queued step from the previous result', () => {
        const { result } = setup();
        act(() => { result.current[1].step(); result.current[1].step(); result.current[1].step(); });
        expect(worker.requests).toHaveLength(1);
        act(() => worker.deliver());
        expect(worker.requests[0].state.iteration).toBe(1);
        act(() => worker.deliver());
        expect(worker.requests[0].state.iteration).toBe(2);
        act(() => worker.deliver());
        expect(result.current[0].engineState?.iteration).toBe(3);
        expect(result.current[0].lossHistory).toHaveLength(3);
        expect(worker.requests).toHaveLength(0);
    });
    it.each(['reset', 'pause', 'updateParams', 'changeDataset'] as const)('clears queued steps on %s', action => {
        const { result } = setup();
        act(() => { result.current[1].step(); result.current[1].step(); });
        act(() => {
            if (action === 'updateParams') result.current[1].updateParams({ lr: 0.2 });
            else if (action === 'changeDataset') result.current[1].changeDataset('linear');
            else result.current[1][action]();
        });
        act(() => worker.deliver());
        expect(worker.requests).toHaveLength(0);
        expect(result.current[0].engineState?.iteration).toBe(action === 'pause' ? 1 : 0);
    });
    it('cancels old playback timers on pause and resume', () => {
        vi.useFakeTimers();
        const { result } = setup();
        act(() => result.current[1].play());
        act(() => worker.deliver());
        act(() => result.current[1].pause());
        act(() => result.current[1].play());
        act(() => worker.deliver());
        act(() => vi.advanceTimersByTime(100));
        expect(worker.requests).toHaveLength(1);
    });
    it('does not accept manual steps while continuous playback owns the loop', () => {
        const { result } = setup();
        act(() => { result.current[1].play(); result.current[1].step(); });
        act(() => worker.deliver());
        expect(worker.requests).toHaveLength(0);
        act(() => result.current[1].pause());
    });
    it('drops queued work at the iteration limit', () => {
        const { result } = renderHook(() => useTrainingController('linearRegression', 'linear', { ...params, nIter: 1 }));
        act(() => { result.current[1].step(); result.current[1].step(); });
        act(() => worker.deliver());
        act(() => result.current[1].play());
        expect(result.current[0].isConverged).toBe(true);
        expect(worker.requests).toHaveLength(0);
    });
});
