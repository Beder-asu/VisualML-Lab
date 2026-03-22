import { uniqueFloat, variance, mean, mode } from './math.js';

class DecisionTreeNode {
  constructor() {
    this.feature = null;
    this.threshold = null;
    this.left = null;
    this.right = null;
    this.label = null;
  }

  predict(x) {
    if (this.label !== null) return this.label;
    if (x[this.feature] <= this.threshold) return this.left.predict(x);
    return this.right.predict(x);
  }

  leftMask(X) {
    return X.map(row => row[this.feature] <= this.threshold);
  }

  rightMask(X) {
    return X.map(row => row[this.feature] > this.threshold);
  }
}

class DecisionTree {
  /**
   * @param {Object} opts
   * @param {number} [opts.minSamplesSplit=2]
   * @param {number} [opts.maxDepth=100]
   * @param {string} [opts.task='classification']  - 'classification' or 'regression'
   */
  constructor({ minSamplesSplit = 2, maxDepth = 100, task = 'classification' } = {}) {
    this.minSamplesSplit = minSamplesSplit;
    this.maxDepth = maxDepth;
    task = task.toLowerCase();
    if (task !== 'classification' && task !== 'regression') {
      throw new Error("Task must be either 'classification' or 'regression'");
    }
    this.task = task;
    this.head = new DecisionTreeNode();
  }

  /**
   * Recursively fit the tree.
   * @param {number[][]} X
   * @param {Float64Array|number[]} y
   * @param {DecisionTreeNode} [currNode]
   * @param {number} [depth]
   */
  fit(X, y, currNode = null, depth = 0) {
    if (currNode === null) currNode = this.head;

    // Base: pure node
    const uniqueLabels = new Set(y);
    if (uniqueLabels.size === 1) {
      currNode.label = this._leafValue(y);
      return;
    }

    // Base: stopping conditions
    if (depth >= this.maxDepth || y.length < this.minSamplesSplit) {
      currNode.label = this._leafValue(y);
      return;
    }

    let bestGain = -1, bestThreshold = null, bestFeature = null;
    const nFeatures = X[0].length;

    for (let i = 0; i < nFeatures; i++) {
      const colValues = X.map(row => row[i]);
      const thresholds = uniqueFloat(colValues);

      for (const threshold of thresholds) {
        const leftIdx = [], rightIdx = [];
        for (let r = 0; r < X.length; r++) {
          if (X[r][i] <= threshold) leftIdx.push(r);
          else rightIdx.push(r);
        }
        if (leftIdx.length < 1 || rightIdx.length < 1) continue;

        const yLeft = leftIdx.map(r => y[r]);
        const yRight = rightIdx.map(r => y[r]);
        const gain = this._calculateGain(Array.from(y), yLeft, yRight);

        if (gain > bestGain) {
          bestGain = gain;
          bestThreshold = threshold;
          bestFeature = i;
        }
      }
    }

    if (bestGain > 0) {
      currNode.feature = bestFeature;
      currNode.threshold = bestThreshold;
      currNode.left = new DecisionTreeNode();
      currNode.right = new DecisionTreeNode();

      const leftIdx = [], rightIdx = [];
      for (let r = 0; r < X.length; r++) {
        if (X[r][bestFeature] <= bestThreshold) leftIdx.push(r);
        else rightIdx.push(r);
      }

      const xLeft = leftIdx.map(r => X[r]);
      const yLeft = Float64Array.from(leftIdx.map(r => y[r]));
      const xRight = rightIdx.map(r => X[r]);
      const yRight = Float64Array.from(rightIdx.map(r => y[r]));

      this.fit(xLeft, yLeft, currNode.left, depth + 1);
      this.fit(xRight, yRight, currNode.right, depth + 1);
    } else {
      currNode.label = this._leafValue(y);
    }
  }

  /**
   * Predict for each row in X.
   * @param {number[][]} X
   * @returns {Float64Array}
   */
  predict(X) {
    return Float64Array.from(X.map(x => this.head.predict(x)));
  }

  /** @private */
  _leafValue(y) {
    if (this.task === 'regression') return mean(y);
    return mode(y);
  }

  /** @private */
  _calculateGain(y, yLeft, yRight) {
    const p = yLeft.length / y.length;

    if (this.task === 'regression') {
      return variance(y) - p * variance(yLeft) - (1 - p) * variance(yRight);
    }

    // Gini Information Gain
    const gini = (arr) => {
      if (arr.length === 0) return 0;
      const counts = {};
      for (const v of arr) counts[v] = (counts[v] || 0) + 1;
      let s = 0;
      for (const c of Object.values(counts)) s += (c / arr.length) ** 2;
      return 1 - s;
    };

    return gini(y) - p * gini(yLeft) - (1 - p) * gini(yRight);
  }
}

export default DecisionTree;
