import { randomChoice, selectRows, selectCols, mode, mean } from './math.js';
import DecisionTree from './DecisionTree.js';

class RandomForest {
  /**
   * @param {Object} opts
   * @param {number} opts.nEstimators              - Number of trees
   * @param {number} opts.maxDepth                 - Max depth per tree
   * @param {string} [opts.task='classification']
   * @param {number} [opts.minSamplesSplit=2]
   */
  constructor({ nEstimators, maxDepth, task = 'classification', minSamplesSplit = 2 }) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.task = task;
    this.minSamplesSplit = minSamplesSplit;
    this.trees = [];
    this.featuresPerTree = [];
  }

  /**
   * Train `nEstimators` decision trees on bootstrap samples with random feature subsets.
   * @param {number[][]} X
   * @param {Float64Array|number[]} y
   */
  fit(X, y) {
    const m = X.length;
    const n = X[0].length;
    const nFeatures = Math.max(1, Math.floor(Math.sqrt(n)));

    this.trees = [];
    this.featuresPerTree = [];

    for (let t = 0; t < this.nEstimators; t++) {
      // 1. Bootstrap rows (with replacement)
      const rowIdx = randomChoice(m, m, true);
      // 2. Random feature subset (without replacement)
      const featureIdx = randomChoice(n, nFeatures, false);

      const xSub = selectCols(selectRows(X, rowIdx), featureIdx);
      const ySub = Float64Array.from(rowIdx.map(i => y[i]));

      const tree = new DecisionTree({
        maxDepth: this.maxDepth,
        task: this.task,
        minSamplesSplit: this.minSamplesSplit,
      });
      tree.fit(xSub, ySub);

      this.trees.push(tree);
      this.featuresPerTree.push(featureIdx);
    }
  }

  /**
   * Predict by aggregating all tree predictions.
   * @param {number[][]} X
   * @returns {Float64Array}
   */
  predict(X) {
    // Collect predictions: treePreds[t] = Float64Array of length m
    const treePreds = this.trees.map((tree, t) => {
      const xSub = selectCols(X, this.featuresPerTree[t]);
      return tree.predict(xSub);
    });

    const m = X.length;
    const result = new Float64Array(m);

    if (this.task.toLowerCase() === 'regression') {
      for (let i = 0; i < m; i++) {
        let s = 0;
        for (let t = 0; t < treePreds.length; t++) s += treePreds[t][i];
        result[i] = s / treePreds.length;
      }
    } else {
      // Classification: majority vote per sample
      for (let i = 0; i < m; i++) {
        const votes = treePreds.map(tp => tp[i]);
        result[i] = mode(votes);
      }
    }

    return result;
  }
}

export default RandomForest;
