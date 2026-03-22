import { zeros2d, unique, mean, argmax, eye } from './math.js';
import DecisionTree from './DecisionTree.js';

class XGBoost {
  /**
   * @param {Object} opts
   * @param {number} opts.nEstimators               - Number of boosting rounds
   * @param {number} [opts.lr=0.1]                  - Learning rate
   * @param {number} [opts.maxDepth=3]              - Max depth per tree
   * @param {string} [opts.task='classification']
   * @param {number} [opts.minSamplesSplit=2]
   */
  constructor({ nEstimators, lr = 0.1, maxDepth = 3, task = 'classification', minSamplesSplit = 2 }) {
    this.nEstimators = nEstimators;
    this.lr = lr;
    this.maxDepth = maxDepth;
    this.task = task.toLowerCase();
    this.minSamplesSplit = minSamplesSplit;
    this.trees = null;
    this.classes_ = null;
    this.basePred = null;
  }

  /** Softmax with numerical stability */
  _softmax(logits) {
    // logits is an array of rows, each row is [score_class0, score_class1, ...]
    return logits.map(row => {
      const maxVal = Math.max(...row);
      const exps = row.map(v => Math.exp(v - maxVal));
      const s = exps.reduce((a, b) => a + b, 0);
      return exps.map(e => e / s);
    });
  }

  /**
   * Fit the gradient boosting model.
   * @param {number[][]} X
   * @param {Float64Array|number[]} y
   */
  fit(X, y) {
    const m = X.length;
    this.classes_ = unique(y);

    if (this.task === 'classification') {
      const K = this.classes_.length;
      // One-hot encode y
      const yOnehot = y.map ? Array.from(y).map(v => {
        const row = new Array(K).fill(0);
        row[v] = 1;
        return row;
      }) : [];

      this.trees = Array.from({ length: K }, () => []);

      // Initialize logits to zero
      let logits = Array.from({ length: m }, () => new Array(K).fill(0));

      for (let round = 0; round < this.nEstimators; round++) {
        // Convert logits to probabilities via softmax
        const probs = this._softmax(logits);

        for (let k = 0; k < K; k++) {
          // Residual = true - predicted probability
          const residual = new Float64Array(m);
          for (let i = 0; i < m; i++) residual[i] = yOnehot[i][k] - probs[i][k];

          // Train a REGRESSION tree on the residuals
          const tree = new DecisionTree({
            maxDepth: this.maxDepth,
            task: 'regression',
            minSamplesSplit: this.minSamplesSplit,
          });
          tree.fit(X, residual);

          // Update logits
          const update = tree.predict(X);
          for (let i = 0; i < m; i++) logits[i][k] += this.lr * update[i];

          this.trees[k].push(tree);
        }
      }
    } else if (this.task === 'regression') {
      this.trees = [];
      this.basePred = mean(y);
      const preds = new Float64Array(m).fill(this.basePred);

      for (let round = 0; round < this.nEstimators; round++) {
        const residual = new Float64Array(m);
        for (let i = 0; i < m; i++) residual[i] = y[i] - preds[i];

        const tree = new DecisionTree({
          maxDepth: this.maxDepth,
          task: 'regression',
          minSamplesSplit: this.minSamplesSplit,
        });
        tree.fit(X, residual);

        const update = tree.predict(X);
        for (let i = 0; i < m; i++) preds[i] += this.lr * update[i];
        this.trees.push(tree);
      }
    }
  }

  /**
   * Predict labels / values.
   * @param {number[][]} X
   * @returns {Float64Array|number[]}
   */
  predict(X) {
    const m = X.length;

    if (this.task === 'classification') {
      const K = this.classes_.length;
      const logits = Array.from({ length: m }, () => new Array(K).fill(0));

      for (let k = 0; k < K; k++) {
        for (const tree of this.trees[k]) {
          const update = tree.predict(X);
          for (let i = 0; i < m; i++) logits[i][k] += this.lr * update[i];
        }
      }

      // Argmax of logits → class label
      return Float64Array.from(logits.map(row => {
        const idx = argmax(row);
        return this.classes_[idx];
      }));
    } else {
      const preds = new Float64Array(m).fill(this.basePred);
      for (const tree of this.trees) {
        const update = tree.predict(X);
        for (let i = 0; i < m; i++) preds[i] += this.lr * update[i];
      }
      return preds;
    }
  }
}

export default XGBoost;
