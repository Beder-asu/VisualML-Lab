import { zeros, dot, scale, sub, sum } from './math.js';

class SVM {
  /**
   * @param {Object} opts
   * @param {number} [opts.C=1.0]      - Regularization parameter
   * @param {number} [opts.lr=0.001]   - Learning rate
   * @param {number} [opts.nIter=1000] - Number of iterations
   */
  constructor({ C = 1.0, lr = 0.001, nIter = 1000 } = {}) {
    this.C = C;
    this.lr = lr;
    this.nIter = nIter;
    this.w = null;
    this.b = 0;
  }

  /**
   * Fit using sub-gradient descent on hinge loss.
   * Labels are converted to {-1, +1} internally.
   * @param {number[][]} X
   * @param {Float64Array|number[]} Y  - Binary labels (0 or 1)
   */
  fit(X, Y) {
    const m = X.length;
    const n = X[0].length;

    // Convert 0/1 labels to -1/+1
    const Ysvm = new Float64Array(Y.length);
    for (let i = 0; i < Y.length; i++) Ysvm[i] = Y[i] === 1 ? 1 : -1;

    this.w = zeros(n);
    this.b = 0;

    for (let iter = 0; iter < this.nIter; iter++) {
      // Identify margin-violating points: y_i * (x_i · w + b) < 1
      const marginPts = [];
      for (let i = 0; i < m; i++) {
        if (Ysvm[i] * (dot(X[i], this.w) + this.b) < 1) {
          marginPts.push(i);
        }
      }

      // dw = 2w - C * sum(y_i * x_i) for margin violators
      const dw = scale(this.w, 2);
      for (const i of marginPts) {
        for (let j = 0; j < n; j++) {
          dw[j] -= this.C * Ysvm[i] * X[i][j];
        }
      }

      // db = -C * sum(y_i) for margin violators
      let db = 0;
      for (const i of marginPts) db -= this.C * Ysvm[i];

      this.w = sub(this.w, scale(dw, this.lr));
      this.b -= this.lr * db;
    }
  }

  /**
   * Raw decision function value: X @ w + b
   * @param {number[][]} X
   * @returns {Float64Array}
   */
  decisionFunction(X) {
    const out = new Float64Array(X.length);
    for (let i = 0; i < X.length; i++) out[i] = dot(X[i], this.w) + this.b;
    return out;
  }

  /** Alias used by OVRClassifier */
  prop(X) {
    return this.decisionFunction(X);
  }

  /**
   * Predict binary class labels (0 or 1).
   * @param {number[][]} X
   * @returns {Float64Array}
   */
  predict(X) {
    const scores = this.decisionFunction(X);
    const out = new Float64Array(scores.length);
    for (let i = 0; i < scores.length; i++) out[i] = scores[i] >= 0 ? 1 : 0;
    return out;
  }
}

export default SVM;
