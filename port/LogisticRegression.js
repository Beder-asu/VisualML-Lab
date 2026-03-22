import { zeros, prependOnes, matvec, matTvec, scale, sub } from './math.js';

class LogisticRegression {
  /**
   * @param {Object} opts
   * @param {number} opts.lr       - Learning rate
   * @param {number} opts.nIter    - Number of gradient descent iterations
   */
  constructor({ lr = 0.1, nIter = 1000 } = {}) {
    this.lr = lr;
    this.nIter = nIter;
    this.w = null;
  }

  /** Sigmoid activation: 1 / (1 + e^(-x)) */
  sigmoid(x) {
    const out = new Float64Array(x.length);
    for (let i = 0; i < x.length; i++) out[i] = 1 / (1 + Math.exp(-x[i]));
    return out;
  }

  /**
   * Fit using gradient descent on binary cross-entropy loss.
   * @param {number[][]} X
   * @param {Float64Array|number[]} Y  - Binary labels (0 or 1)
   */
  fit(X, Y) {
    const newX = prependOnes(X);
    const m = newX.length;
    const n = newX[0].length;
    this.w = zeros(n);

    for (let iter = 0; iter < this.nIter; iter++) {
      const yHat = this.sigmoid(matvec(newX, this.w));
      const residual = sub(yHat, Y);
      const dw = scale(matTvec(newX, residual), 1 / m);
      this.w = sub(this.w, scale(dw, this.lr));
    }
  }

  /**
   * Return raw probabilities.
   * @param {number[][]} X
   * @returns {Float64Array}
   */
  prop(X) {
    const newX = prependOnes(X);
    return this.sigmoid(matvec(newX, this.w));
  }

  /**
   * Predict binary class labels (0 or 1).
   * @param {number[][]} X
   * @returns {Float64Array}
   */
  predict(X) {
    const p = this.prop(X);
    const out = new Float64Array(p.length);
    for (let i = 0; i < p.length; i++) out[i] = p[i] >= 0.5 ? 1 : 0;
    return out;
  }
}

export default LogisticRegression;
