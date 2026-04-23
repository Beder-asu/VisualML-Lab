/**
 * Layout utility functions for algorithm-specific configurations.
 * Used by layout components to determine default datasets and algorithm families.
 * 
 * @module layoutUtils
 */

/**
 * Algorithm family classification types.
 * 
 * Algorithms are grouped into families based on their training approach
 * and visualization needs:
 * - gradient-descent: Iterative optimization algorithms (Linear Regression, Logistic Regression, SVM)
 * - tree-based: Decision tree algorithms (Decision Tree)
 * - ensemble: Multiple model algorithms (Random Forest, XGBoost)
 * - unknown: Unrecognized or uncategorized algorithms
 * 
 * @typedef {'gradient-descent' | 'tree-based' | 'ensemble' | 'unknown'} AlgorithmFamily
 */
export type AlgorithmFamily = 'gradient-descent' | 'tree-based' | 'ensemble' | 'unknown';

/**
 * Maps algorithm names to their default datasets.
 * 
 * Each algorithm has a default dataset that best demonstrates its capabilities:
 * - linearRegression: 'linear' - Simple linear relationship
 * - logisticRegression: 'iris-2d' - Binary classification
 * - svm: 'blobs' - Non-linear separation
 * - decisionTree: 'iris-2d' - Multi-class classification
 * - randomForest: 'blobs' - Complex boundaries
 * - xgboost: 'blobs' - Gradient boosting demonstration
 * 
 * @param {string} algorithm - The algorithm identifier (e.g., 'linearRegression', 'svm')
 * @returns {string} The default dataset name for the algorithm
 * 
 * @example
 * getDefaultDataset('linearRegression') // returns 'linear'
 * getDefaultDataset('svm') // returns 'blobs'
 * getDefaultDataset('unknownAlgorithm') // returns 'iris-2d' (fallback)
 */
export function getDefaultDataset(algorithm: string): string {
    const datasetMap: Record<string, string> = {
        linearRegression: 'linear',
        logisticRegression: 'iris-2d',
        svm: 'blobs',
        decisionTree: 'iris-2d',
        randomForest: 'blobs',
        xgboost: 'blobs',
    };
    return datasetMap[algorithm] || 'iris-2d';
}

/**
 * Determines which algorithm family an algorithm belongs to.
 * Used for routing to appropriate layout components and visualization strategies.
 * 
 * This function classifies algorithms into families that share similar
 * visualization and training patterns. The classification helps the layout
 * dispatcher route algorithms to the correct layout component.
 * 
 * Family characteristics:
 * - gradient-descent: Iterative training with loss curves, parameter tuning
 * - tree-based: Hierarchical structure visualization, depth-based growth
 * - ensemble: Multiple model visualization, aggregation demonstration
 * 
 * @param {string} algorithm - The algorithm identifier
 * @returns {AlgorithmFamily} The algorithm family classification
 * 
 * @example
 * getAlgorithmFamily('linearRegression') // returns 'gradient-descent'
 * getAlgorithmFamily('decisionTree') // returns 'tree-based'
 * getAlgorithmFamily('randomForest') // returns 'ensemble'
 * getAlgorithmFamily('unknownAlgorithm') // returns 'unknown'
 */
export function getAlgorithmFamily(algorithm: string): AlgorithmFamily {
    const familyMap: Record<string, AlgorithmFamily> = {
        linearRegression: 'gradient-descent',
        logisticRegression: 'gradient-descent',
        svm: 'gradient-descent',
        decisionTree: 'tree-based',
        randomForest: 'ensemble',
        xgboost: 'ensemble',
    };
    return familyMap[algorithm] || 'unknown';
}
