import { describe, it, expect } from 'vitest';
import LogisticRegression from './LogisticRegression.js';
import SVM from './SVM.js';

describe('Port Models', () => {
  const X = [
    [0.1, 0.2],
    [0.9, 0.8],
    [0.2, 0.1],
    [0.8, 0.9]
  ];
  const Y = new Float64Array([0, 1, 0, 1]);

  it('LogisticRegression should fit and predict without throwing', () => {
    const lr = new LogisticRegression({ lr: 0.1, nIter: 10 });
    expect(() => {
      lr.fit(X, Y);
      const preds = lr.predict(X);
      expect(preds.length).toBe(4);
    }).not.toThrow();
  });

  it('SVM should fit and predict without throwing', () => {
    const svm = new SVM({ C: 1.0, lr: 0.1, nIter: 10 });
    expect(() => {
      svm.fit(X, Y);
      const preds = svm.predict(X);
      expect(preds.length).toBe(4);
    }).not.toThrow();
  });
});
