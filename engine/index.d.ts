import type { State, Dataset, Params } from '../src/types/engine';

export function initState(algorithm: string, dataset: string | Dataset, params: Params): State;
export function step(state: State, params: Params): State;
export function loadDataset(name: string): Dataset;
export function prettyPrintState(state: State): string;
