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
    const generationRef = useRef(0);

    const createWorker = useCallback(() => {
        const worker = new Worker(
            new URL('../../engine/worker.js', import.meta.url),
            { type: 'module' }
        );

        const fail = (message: string) => {
            if (workerRef.current !== worker) return;
            worker.terminate();
            workerRef.current = null;
            onErrorRef.current?.({ type: 'error', message, generation: generationRef.current });
        };
        worker.onerror = (event) => {
            event.preventDefault();
            fail(event.message || 'Training worker failed. Reset or retry training.');
        };
        worker.onmessageerror = () => fail('Training worker returned unreadable data. Reset or retry training.');

        worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
            const msg = event.data;
            if (msg.type === 'step:result') {
                onResultRef.current?.(msg);
            } else if (msg.type === 'error') {
                onErrorRef.current?.(msg);
            }
        };

        workerRef.current = worker;
        return worker;
    }, []);

    useEffect(() => {
        // If startup fails, requestStep retries and reports it once callbacks exist.
        try { createWorker(); } catch { /* Report on the first request. */ }
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, [createWorker]);

    const requestStep = useCallback((state: State, params: Params, generation: number) => {
        generationRef.current = generation;
        try {
            const worker = workerRef.current ?? createWorker();
            worker.postMessage({ type: 'step', state, params, generation });
        } catch (error) {
            workerRef.current?.terminate();
            workerRef.current = null;
            onErrorRef.current?.({
                type: 'error', generation,
                message: error instanceof Error ? error.message : 'Unable to start training worker.',
            });
        }
    }, [createWorker]);

    const setOnResult = useCallback((cb: StepResultCallback) => {
        onResultRef.current = cb;
    }, []);

    const setOnError = useCallback((cb: ErrorCallback) => {
        onErrorRef.current = cb;
    }, []);

    return { requestStep, setOnResult, setOnError };
}
