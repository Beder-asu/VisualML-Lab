/**
 * engine/worker.js — ML Engine Web Worker
 *
 * Runs in a separate thread. Receives StepMessage from the main thread,
 * calls step(), and posts back a StepResultMessage or ErrorMessage.
 *
 * RULE: Do not import anything from src/ — only use the engine public API.
 *
 * State serializability notes (structured clone boundary):
 *   - weights:    plain Array<number>       — clones fine
 *   - bias:       number                    — clones fine
 *   - dataset.X:  Array<Array<number>>      — clones fine
 *   - dataset.y:  Array<number>             — clones fine
 *   - XAug:       Array<Float64Array>       — Float64Arrays survive structured
 *                 clone, but XAug is a derived field (computed from dataset.X
 *                 via prependOnes). Sending it across the boundary wastes
 *                 bandwidth and risks subtle corruption if the clone produces
 *                 a different internal representation. We strip it before
 *                 posting and let the algorithm recompute it on first use.
 */

import { step } from './index.js';

/**
 * Remove derived / non-serializable fields from state before crossing the
 * worker boundary via postMessage.
 *
 * XAug is recomputed lazily by each algorithm step function when it is
 * absent or when XAug[0] is not a Float64Array, so stripping it here is safe.
 *
 * @param {Object} state
 * @returns {Object} state without XAug
 */
function stripDerived(state) {
    const { XAug: _ignored, ...rest } = state;
    return rest;
}

self.onmessage = function (event) {
    const msg = event.data;

    if (msg.type === 'terminate') {
        self.close();
        return;
    }

    if (msg.type === 'step') {
        const { state, params, generation } = msg;
        try {
            // Strip derived fields from the incoming state so the algorithm
            // recomputes XAug fresh (avoids any structured-clone edge cases).
            const cleanState = stripDerived(state);
            const newState = step(cleanState, params);
            // Strip derived fields from the result before posting back —
            // the main thread does not need XAug and it avoids a redundant
            // structured-clone of the Float64Array array.
            self.postMessage({ type: 'step:result', state: stripDerived(newState), generation });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message, generation });
        }
    }
};
