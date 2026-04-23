/**
 * useEngineWorker.ts — Web Worker lifecycle hook
 *
 * Owns the ML engine worker instance. Exposes requestStep() for posting
 * step messages and callback setters for results and errors.
 *
 * Decision: 2A
 */

import { useEffect, useRef, useCallback } from 'react';
import type { State, Params } from '../types/engine';
import type { WorkerOutbound, StepResultMessage, ErrorMessage } from '../types/worker';

export type StepResultCallback = (result: StepResultMessage) => void;
export type ErrorCallback = (error: ErrorMessage) => void;

export interface UseEngineWorkerResult {
    requestStep: (state: State, params: Params, generation: number) => void;
    setOnResult: (cb: StepResultCallback) => void;
    setOnError: (cb: ErrorCallback) => void;
}

export function useEngineWorker(): UseEngineWorkerResult {
    const workerRef = useRef<Worker | null>(null);
    const onResultRef = useRef<StepResultCallback | null>(null);
    const onErrorRef = useRef<ErrorCallback | null>(null);

    useEffect(() => {
        // Instantiate the worker once using Vite's worker syntax
        const worker = new Worker(
            new URL('../../engine/worker.js', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
            const msg = event.data;
            if (msg.type === 'step:result') {
                onResultRef.current?.(msg);
            } else if (msg.type === 'error') {
                onErrorRef.current?.(msg);
            }
        };

        workerRef.current = worker;

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    const requestStep = useCallback((state: State, params: Params, generation: number) => {
        workerRef.current?.postMessage({ type: 'step', state, params, generation });
    }, []);

    const setOnResult = useCallback((cb: StepResultCallback) => {
        onResultRef.current = cb;
    }, []);

    const setOnError = useCallback((cb: ErrorCallback) => {
        onErrorRef.current = cb;
    }, []);

    return { requestStep, setOnResult, setOnError };
}
