/**
 * Property-based tests for engine/datasets.js
 *
 * Property: For any 2D array of finite numbers with ≥1 row and ≥1 column,
 * normalizeColumns returns an array where every column's min is 0 and max is 1
 * (or all zeros when a column has zero range).
 *
 * Feature: ml-engine, Property 5: Dataset normalization
 * Validates: Requirements 3.5
 */

import fc from 'fast-check';
import { loadDataset, normalizeColumns } from '../datasets.js';

// ── Genuine property test against normalizeColumns ────────────────────────────

describe('Property 5: normalizeColumns — arbitrary finite 2D arrays', () => {
    it('every column of the normalized output has min=0 and max=1 (or all-zero for constant columns)', () => {
        // Feature: ml-engine, Property 5: Dataset normalization
        // Validates: Requirements 3.5
        fc.assert(
            fc.property(
                fc.array(
                    fc.array(
                        // Constrain to safe range to avoid overflow in normalization
                        fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e100, max: 1e100 }),
                        { minLength: 1, maxLength: 10 }
                    ),
                    { minLength: 1, maxLength: 50 }
                ).filter(X => {
                    // Ensure all rows have the same length (valid 2D matrix)
                    const nCols = X[0].length;
                    return X.every(row => row.length === nCols);
                }),
                (X) => {
                    const normalized = normalizeColumns(X);
                    const nCols = X[0].length;

                    for (let j = 0; j < nCols; j++) {
                        const rawCol = X.map(row => row[j]);
                        const normCol = normalized.map(row => row[j]);
                        const rawMin = Math.min(...rawCol);
                        const rawMax = Math.max(...rawCol);

                        if (rawMin === rawMax) {
                            // Constant column — all values should be 0
                            normCol.forEach(v => expect(v).toBe(0));
                        } else {
                            const min = Math.min(...normCol);
                            const max = Math.max(...normCol);
                            expect(min).toBeCloseTo(0, 10);
                            expect(max).toBeCloseTo(1, 10);
                        }
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ── Smoke tests for built-in datasets (kept as plain it blocks) ───────────────

describe('loadDataset — built-in dataset normalization smoke tests', () => {
    it('iris-2d: all feature columns are in [0, 1]', () => {
        const { X } = loadDataset('iris-2d');
        const nCols = X[0].length;
        for (let j = 0; j < nCols; j++) {
            const col = X.map(row => row[j]);
            expect(Math.min(...col)).toBeCloseTo(0, 10);
            expect(Math.max(...col)).toBeCloseTo(1, 10);
        }
    });

    it('blobs: all feature columns are in [0, 1]', () => {
        const { X } = loadDataset('blobs');
        const nCols = X[0].length;
        for (let j = 0; j < nCols; j++) {
            const col = X.map(row => row[j]);
            expect(Math.min(...col)).toBeCloseTo(0, 10);
            expect(Math.max(...col)).toBeCloseTo(1, 10);
        }
    });

    it('linear: all feature columns are in [0, 1]', () => {
        const { X } = loadDataset('linear');
        const nCols = X[0].length;
        for (let j = 0; j < nCols; j++) {
            const col = X.map(row => row[j]);
            expect(Math.min(...col)).toBeCloseTo(0, 10);
            expect(Math.max(...col)).toBeCloseTo(1, 10);
        }
    });
});
