/**
 * Property-based tests for engine/datasets.js
 *
 * Feature: ml-engine, Property 5: Dataset normalization
 * For any built-in dataset loaded via loadDataset, every feature column in the
 * returned X matrix SHALL have a minimum value of 0 and a maximum value of 1.
 */

import fc from 'fast-check';
import { loadDataset } from '../datasets.js';

const DATASET_NAMES = ['iris-2d', 'blobs', 'linear'];

describe('Property 5: Dataset normalization', () => {
    it('every feature column of every built-in dataset is normalized to [0, 1]', () => {
        // Feature: ml-engine, Property 5: Dataset normalization
        // Validates: Requirements 3.5
        fc.assert(
            fc.property(
                fc.constantFrom(...DATASET_NAMES),
                (name) => {
                    const dataset = loadDataset(name);
                    const { X } = dataset;

                    expect(X.length).toBeGreaterThan(0);
                    const nCols = X[0].length;

                    for (let j = 0; j < nCols; j++) {
                        const col = X.map(row => row[j]);
                        const min = Math.min(...col);
                        const max = Math.max(...col);

                        // Allow a small floating-point tolerance
                        expect(min).toBeCloseTo(0, 10);
                        expect(max).toBeCloseTo(1, 10);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
