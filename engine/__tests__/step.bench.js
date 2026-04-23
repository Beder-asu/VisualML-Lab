/**
 * Vitest benchmark tests for engine step functions
 * Ref: Issue 7 (Performance)
 *
 * Run with: npm run bench
 * These benchmarks establish a baseline — no hard thresholds are set.
 */

import { bench, describe } from 'vitest';
import { initState, step } from '../index.js';
import { loadDataset } from '../datasets.js';

// Pre-load datasets and initial states outside bench loops
const linearDataset = loadDataset('linear');
const classDataset = loadDataset('blobs');

const linearParams = { lr: 0.1, nIter: 1000 };
const logisticParams = { lr: 0.1, nIter: 1000 };
const svmParams = { lr: 0.001, nIter: 1000, C: 1.0 };

describe('step() performance benchmarks', () => {
    bench('stepLinearRegression — single step', () => {
        const state = initState('linearRegression', linearDataset, linearParams);
        step(state, linearParams);
    });

    bench('stepLogisticRegression — single step', () => {
        const state = initState('logisticRegression', classDataset, logisticParams);
        step(state, logisticParams);
    });

    bench('stepSVM — single step', () => {
        const state = initState('svm', classDataset, svmParams);
        step(state, svmParams);
    });
});
