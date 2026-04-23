/**
 * Ambient module declarations so TypeScript resolves the plain-JS engine imports.
 * The engine lives outside src/ and has no allowJs, so we declare the modules here.
 */

declare module '../../engine/index.js' {
    import type { State, Dataset, Params } from './engine';
    export function initState(algorithm: string, dataset: string | Dataset, params: Params): State;
    export function step(state: State, params: Params): State;
    export function loadDataset(name: string): Dataset;
    export function prettyPrintState(state: State): string;
}

declare module '../../engine/boundary' {
    import type { State, BoundaryResult } from './engine';
    export function getDecisionBoundary(state: State, gridSize?: number): BoundaryResult;
}

declare module '../../engine/algorithms/decisionTree.js' {
    export function initTreeState(dataset: any, params: any): any;
    export function stepDecisionTree(state: any, params: any): any;
}

declare module '../../../../engine/algorithms/decisionTree.js' {
    export function initTreeState(dataset: any, params: any): any;
    export function stepDecisionTree(state: any, params: any): any;
}
