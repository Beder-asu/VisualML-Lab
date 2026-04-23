/**
 * Unit tests for engine/datasets.js
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { loadDataset } from '../datasets.js';

describe('loadDataset — iris-2d', () => {
    it('returns 150 rows with 2 features each', () => {
        const ds = loadDataset('iris-2d');
        expect(ds.X).toHaveLength(150);
        ds.X.forEach(row => expect(row).toHaveLength(2));
    });

    it('returns 150 labels', () => {
        const ds = loadDataset('iris-2d');
        expect(ds.y).toHaveLength(150);
    });

    it('has 50 setosa (label 0) and 100 non-setosa (label 1)', () => {
        const ds = loadDataset('iris-2d');
        const zeros = ds.y.filter(v => v === 0).length;
        const ones = ds.y.filter(v => v === 1).length;
        expect(zeros).toBe(50);
        expect(ones).toBe(100);
    });

    it('has task = classification', () => {
        expect(loadDataset('iris-2d').task).toBe('classification');
    });
});

describe('loadDataset — blobs', () => {
    it('returns 100 rows with 2 features each', () => {
        const ds = loadDataset('blobs');
        expect(ds.X).toHaveLength(100);
        ds.X.forEach(row => expect(row).toHaveLength(2));
    });

    it('returns 100 labels', () => {
        expect(loadDataset('blobs').y).toHaveLength(100);
    });

    it('has task = classification', () => {
        expect(loadDataset('blobs').task).toBe('classification');
    });
});

describe('loadDataset — linear', () => {
    it('returns 100 rows with 1 feature each', () => {
        const ds = loadDataset('linear');
        expect(ds.X).toHaveLength(100);
        ds.X.forEach(row => expect(row).toHaveLength(1));
    });

    it('returns 100 labels', () => {
        expect(loadDataset('linear').y).toHaveLength(100);
    });

    it('has task = regression', () => {
        expect(loadDataset('linear').task).toBe('regression');
    });
});

describe('loadDataset — unknown name', () => {
    it('throws a descriptive error for an unrecognized dataset name', () => {
        expect(() => loadDataset('unknown-dataset')).toThrow(
            "Unsupported dataset: 'unknown-dataset'. Supported: iris-2d, blobs, linear"
        );
    });
});

/**
 * Unit tests for engine/validate.js
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { validateParams } from '../validate.js';

describe('validateParams — learning rate', () => {
    it('throws when lr is zero (Req 6.1)', () => {
        expect(() => validateParams({ lr: 0, nIter: 100 }, 'linearRegression'))
            .toThrow('Learning rate must be a positive number, got: 0');
    });

    it('throws when lr is negative (Req 6.1)', () => {
        expect(() => validateParams({ lr: -0.1, nIter: 100 }, 'linearRegression'))
            .toThrow('Learning rate must be a positive number, got: -0.1');
    });

    it('throws when lr exceeds 1 (Req 6.2)', () => {
        expect(() => validateParams({ lr: 1.5, nIter: 100 }, 'linearRegression'))
            .toThrow('Learning rate must not exceed 1, got: 1.5');
    });

    it('accepts lr = 1 (boundary — valid)', () => {
        expect(() => validateParams({ lr: 1, nIter: 100 }, 'linearRegression')).not.toThrow();
    });

    it('accepts lr = 0.01 (valid)', () => {
        expect(() => validateParams({ lr: 0.01, nIter: 100 }, 'linearRegression')).not.toThrow();
    });
});

describe('validateParams — nIter', () => {
    it('throws when nIter is zero (Req 6.3)', () => {
        expect(() => validateParams({ lr: 0.1, nIter: 0 }, 'linearRegression'))
            .toThrow('nIter must be a positive integer, got: 0');
    });

    it('throws when nIter is negative (Req 6.3)', () => {
        expect(() => validateParams({ lr: 0.1, nIter: -5 }, 'linearRegression'))
            .toThrow('nIter must be a positive integer, got: -5');
    });

    it('throws when nIter is a float (Req 6.3)', () => {
        expect(() => validateParams({ lr: 0.1, nIter: 1.5 }, 'linearRegression'))
            .toThrow('nIter must be a positive integer, got: 1.5');
    });

    it('accepts nIter = 1 (valid)', () => {
        expect(() => validateParams({ lr: 0.1, nIter: 1 }, 'linearRegression')).not.toThrow();
    });
});

describe('validateParams — SVM C parameter', () => {
    it('throws when C is zero for SVM (Req 6.4)', () => {
        expect(() => validateParams({ lr: 0.001, nIter: 100, C: 0 }, 'svm'))
            .toThrow('Regularization parameter C must be positive, got: 0');
    });

    it('throws when C is negative for SVM (Req 6.4)', () => {
        expect(() => validateParams({ lr: 0.001, nIter: 100, C: -1 }, 'svm'))
            .toThrow('Regularization parameter C must be positive, got: -1');
    });

    it('accepts valid C for SVM', () => {
        expect(() => validateParams({ lr: 0.001, nIter: 100, C: 1.0 }, 'svm')).not.toThrow();
    });

    it('does not require C for non-SVM algorithms', () => {
        expect(() => validateParams({ lr: 0.1, nIter: 100 }, 'logisticRegression')).not.toThrow();
    });
});

describe('validateParams — NaN / Infinity (Req 6.1)', () => {
    it('throws when lr is NaN', () => {
        expect(() => validateParams({ lr: NaN, nIter: 100 }, 'linearRegression')).toThrow();
    });

    it('throws when lr is Infinity', () => {
        expect(() => validateParams({ lr: Infinity, nIter: 100 }, 'linearRegression')).toThrow();
    });

    it('throws when lr is -Infinity', () => {
        expect(() => validateParams({ lr: -Infinity, nIter: 100 }, 'linearRegression')).toThrow();
    });

    it('throws when nIter is NaN (fails Number.isInteger)', () => {
        expect(() => validateParams({ lr: 0.1, nIter: NaN }, 'linearRegression')).toThrow();
    });

    it('throws when C is NaN for svm', () => {
        expect(() => validateParams({ lr: 0.1, nIter: 100, C: NaN }, 'svm')).toThrow();
    });
});

/**
 * Unit tests for engine/boundary.js
 * Requirements: 4.4
 */

import { getDecisionBoundary } from '../boundary.js';
import { initState } from '../state.js';
import { loadDataset } from '../datasets.js';

describe('getDecisionBoundary — zero weights edge case (Req 4.4)', () => {
    it('returns a horizontal line at y=0.5 for logisticRegression with zero weights', () => {
        const dataset = loadDataset('blobs');
        const state = initState('logisticRegression', dataset, { lr: 0.1, nIter: 100 });
        // initState produces all-zero weights
        const result = getDecisionBoundary(state);
        expect(result.boundary.length).toBe(100);
        result.boundary.forEach(pt => expect(pt.y).toBe(0.5));
    });

    it('returns a horizontal line at y=0.5 for svm with zero weights', () => {
        const dataset = loadDataset('blobs');
        const state = initState('svm', dataset, { lr: 0.001, nIter: 100, C: 1.0 });
        const result = getDecisionBoundary(state);
        expect(result.boundary.length).toBe(100);
        result.boundary.forEach(pt => expect(pt.y).toBe(0.5));
    });

    it('returns a horizontal line at y=0.5 for linearRegression with zero weights', () => {
        const dataset = loadDataset('linear');
        const state = initState('linearRegression', dataset, { lr: 0.1, nIter: 100 });
        const result = getDecisionBoundary(state);
        expect(result.boundary.length).toBe(100);
        result.boundary.forEach(pt => expect(pt.y).toBe(0.5));
    });

    it('respects custom gridSize', () => {
        const dataset = loadDataset('blobs');
        const state = initState('logisticRegression', dataset, { lr: 0.1, nIter: 100 });
        const result = getDecisionBoundary(state, 50);
        expect(result.boundary.length).toBe(50);
    });
});
