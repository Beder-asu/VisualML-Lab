import type { State, Params } from './engine';

// ── Inbound messages (main → worker) ────────────────────────────────────────

/** Request the worker to advance training by one step */
export interface StepMessage {
    type: 'step';
    state: State;
    params: Params;
    /** Monotonically-increasing counter; responses with a stale generation are discarded */
    generation: number;
}

/** Request the worker to terminate */
export interface TerminateMessage {
    type: 'terminate';
}

export type WorkerInbound = StepMessage | TerminateMessage;

// ── Outbound messages (worker → main) ───────────────────────────────────────

/** Successful step result posted back from the worker */
export interface StepResultMessage {
    type: 'step:result';
    state: State;
    generation: number;
}

/** Error posted back from the worker when a step throws */
export interface ErrorMessage {
    type: 'error';
    message: string;
    generation: number;
}

export type WorkerOutbound = StepResultMessage | ErrorMessage;
