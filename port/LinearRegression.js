import { zeros, prependOnes, matvec, matTvec, scale, sub } from './math.js';

class LinearRegression {
  /**
   * @param {Object} opts
   * @param {number} [opts.lr=0.1]       - Learning rate
   * @param {number} [opts.nIter=1000]   - Number of gradient descent iterations
   */
  constructor({ lr = 0.1, nIter = 1000 } = {}) {
    this.lr = lr;
    this.nIter = nIter;
    this.w = null;
  }

  /**
   * Fit the model using gradient descent on MSE loss.
   * @param {number[][]} X  - Feature matrix (m × n)
   * @param {Float64Array|number[]} Y  - Target vector (m)
   */
  fit(X, Y) {
    const newX = prependOnes(X);          // m × (n+1)
    const m = newX.length;
    const n = newX[0].length;
    this.w = zeros(n);

    for (let iter = 0; iter < this.nIter; iter++) {
      // residual = newX @ w - Y
      const pred = matvec(newX, this.w);
      const residual = sub(pred, Y);

      // dw = (1/m) * newX.T @ residual
      const dw = scale(matTvec(newX, residual), 1 / m);

      // w -= lr * dw
      this.w = sub(this.w, scale(dw, this.lr));
    }
  }

  /**
   * Predict continuous values.
   * @param {number[][]} X  - Feature matrix
   * @returns {Float64Array}
   */
  predict(X) {
    const newX = prependOnes(X);
    return matvec(newX, this.w);
  }
}

export default LinearRegression;
