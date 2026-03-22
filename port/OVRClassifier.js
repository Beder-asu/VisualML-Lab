import { unique, argmax } from './math.js';

class OVRClassifier {
  /**
   * One-vs-Rest meta-classifier that wraps any binary classifier
   * for multi-class classification.
   *
   * @param {Function} ModelClass  - Constructor of the binary classifier (e.g. LogisticRegression)
   * @param {Object}   kwargs      - Arguments forwarded to each binary model constructor
   */
  constructor(ModelClass, kwargs = {}) {
    this.ModelClass = ModelClass;
    this.kwargs = kwargs;
    this.models = [];
    this.classes = [];
  }

  /**
   * Train N binary classifiers (one per class).
   * @param {number[][]} X
   * @param {Float64Array|number[]} Y  - Integer class labels
   */
  fit(X, Y) {
    this.classes = unique(Y);
    this.models = [];

    for (const cls of this.classes) {
      // Binary label: 1 if sample belongs to `cls`, else 0
      const yBinary = new Float64Array(Y.length);
      for (let i = 0; i < Y.length; i++) yBinary[i] = Y[i] === cls ? 1 : 0;

      const model = new this.ModelClass(this.kwargs);
      model.fit(X, yBinary);
      this.models.push(model);
    }
  }

  /**
   * Predict multi-class labels by picking the most confident classifier.
   * @param {number[][]} X
   * @returns {number[]}
   */
  predict(X) {
    // scores[k] = confidence array from the k-th binary model
    const scores = this.models.map(model => model.prop(X));

    const m = X.length;
    const result = new Array(m);
    for (let i = 0; i < m; i++) {
      // For sample i, find which class scored highest
      let bestClass = 0, bestScore = -Infinity;
      for (let k = 0; k < this.classes.length; k++) {
        if (scores[k][i] > bestScore) {
          bestScore = scores[k][i];
          bestClass = k;
        }
      }
      result[i] = this.classes[bestClass];
    }
    return result;
  }

  /**
   * Return classification accuracy.
   * @param {number[][]} X
   * @param {Float64Array|number[]} Y
   * @returns {number}
   */
  score(X, Y) {
    const pred = this.predict(X);
    let correct = 0;
    for (let i = 0; i < Y.length; i++) if (pred[i] === Y[i]) correct++;
    return correct / Y.length;
  }
}

export default OVRClassifier;
