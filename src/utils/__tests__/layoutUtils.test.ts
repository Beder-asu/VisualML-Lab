import { describe, it, expect } from 'vitest';
import { getDefaultDataset, getAlgorithmFamily } from '../layoutUtils';

describe('layoutUtils', () => {
    describe('getDefaultDataset', () => {
        it('returns "linear" for linearRegression', () => {
            expect(getDefaultDataset('linearRegression')).toBe('linear');
        });

        it('returns "iris-2d" for logisticRegression', () => {
            expect(getDefaultDataset('logisticRegression')).toBe('iris-2d');
        });

        it('returns "blobs" for svm', () => {
            expect(getDefaultDataset('svm')).toBe('blobs');
        });

        it('returns "iris-2d" for decisionTree', () => {
            expect(getDefaultDataset('decisionTree')).toBe('iris-2d');
        });

        it('returns "blobs" for randomForest', () => {
            expect(getDefaultDataset('randomForest')).toBe('blobs');
        });

        it('returns "blobs" for xgboost', () => {
            expect(getDefaultDataset('xgboost')).toBe('blobs');
        });

        it('returns "iris-2d" for unknown algorithm', () => {
            expect(getDefaultDataset('unknownAlgorithm')).toBe('iris-2d');
        });

        it('returns "iris-2d" for empty string', () => {
            expect(getDefaultDataset('')).toBe('iris-2d');
        });
    });

    describe('getAlgorithmFamily', () => {
        it('returns "gradient-descent" for linearRegression', () => {
            expect(getAlgorithmFamily('linearRegression')).toBe('gradient-descent');
        });

        it('returns "gradient-descent" for logisticRegression', () => {
            expect(getAlgorithmFamily('logisticRegression')).toBe('gradient-descent');
        });

        it('returns "gradient-descent" for svm', () => {
            expect(getAlgorithmFamily('svm')).toBe('gradient-descent');
        });

        it('returns "tree-based" for decisionTree', () => {
            expect(getAlgorithmFamily('decisionTree')).toBe('tree-based');
        });

        it('returns "ensemble" for randomForest', () => {
            expect(getAlgorithmFamily('randomForest')).toBe('ensemble');
        });

        it('returns "ensemble" for xgboost', () => {
            expect(getAlgorithmFamily('xgboost')).toBe('ensemble');
        });

        it('returns "unknown" for unrecognized algorithm', () => {
            expect(getAlgorithmFamily('unknownAlgorithm')).toBe('unknown');
        });

        it('returns "unknown" for empty string', () => {
            expect(getAlgorithmFamily('')).toBe('unknown');
        });
    });
});
