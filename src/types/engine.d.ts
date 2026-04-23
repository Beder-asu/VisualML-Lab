/**
 * engine.d.ts — TypeScript declarations for the ML Engine public API
 * Architecture Issue 3
 */

// Module declarations so TypeScript resolves the JS engine imports without implicit-any errors
declare module '../../engine/index.js' {
    export { initState, step, loadDataset, prettyPrintState } from '../types/engine';
}

declare module '../../engine/boundary' {
    export { getDecisionBoundary } from '../types/engine';
}

/** A 2D point used for boundary and margin rendering */
export interface Point {
    x: number;
    y: number;
}

/** A loaded dataset */
export interface Dataset {
    name: string;
    /** Feature matrix — rows are samples, columns are features */
    X: number[][];
    /** Label vector — 0/1 for classification, continuous for regression */
    y: number[];
    /** 'classification' or 'regression' */
    task: 'classification' | 'regression';
}

/** Hyperparameters passed to initState and step */
export interface Params {
    /** Learning rate (0, 1] */
    lr: number;
    /** Maximum number of iterations */
    nIter: number;
    /** Regularization parameter — SVM only */
    C?: number;
}

/** Training state produced by initState and updated by step */
export interface State {
    algorithm: 'linearRegression' | 'logisticRegression' | 'svm';
    weights: number[];
    bias: number;
    loss: number | null;
    iteration: number;
    converged: boolean;
    dataset: Dataset;
}

/** Return type of getDecisionBoundary — always an object, never a bare array */
export interface BoundaryResult {
    boundary: Point[];
    /** SVM positive-margin line (only present for SVM) */
    marginPos?: Point[];
    /** SVM negative-margin line (only present for SVM) */
    marginNeg?: Point[];
}

/**
 * Initialize a fresh training state.
 * @param algorithm - One of 'linearRegression', 'logisticRegression', 'svm'
 * @param dataset   - Dataset name string or a pre-loaded Dataset object
 * @param params    - Hyperparameters
 */
export function initState(algorithm: string, dataset: string | Dataset, params: Params): State;

/**
 * Advance training by one gradient-descent step.
 * @param state  - Current training state (not mutated)
 * @param params - Hyperparameters
 */
export function step(state: State, params: Params): State;

/**
 * Compute decision boundary (and SVM margins) for rendering.
 * @param state    - Current training state
 * @param gridSize - Number of evenly-spaced x points (default 100)
 */
export function getDecisionBoundary(state: State, gridSize?: number): BoundaryResult;

/**
 * Serialize state to a human-readable indented JSON string.
 * @param state - Training state to serialize
 */
export function prettyPrintState(state: State): string;

/**
 * Load a named built-in dataset.
 * @param name - One of 'iris-2d', 'blobs', 'linear'
 */
export function loadDataset(name: string): Dataset;
