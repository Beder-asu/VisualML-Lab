/**
 * engine/algorithms/decisionTree.js — Step function for Decision Tree
 * Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 4.2, 8.3, 9.5
 */

/**
 * Tree node data structure
 * @typedef {Object} TreeNode
 * @property {string} id - Unique node identifier (e.g., "0", "0-L", "0-R")
 * @property {number} depth - Level in tree (0 = root)
 * @property {number|null} feature - Feature index for split (0 or 1 for 2D)
 * @property {number|null} threshold - Split threshold value
 * @property {number|null} prediction - Predicted class (null for internal nodes)
 * @property {number} samples - Number of training samples
 * @property {number} impurity - Gini or entropy value
 * @property {TreeNode|null} left - Left child (feature ≤ threshold)
 * @property {TreeNode|null} right - Right child (feature > threshold)
 */

/**
 * Calculate Gini impurity for a set of labels
 * Gini = 1 - sum(p_i^2) where p_i is the proportion of class i
 * 
 * @param {number[]} labels - Array of class labels
 * @returns {number} Gini impurity value [0, 1]
 */
function calculateGini(labels) {
    if (labels.length === 0) return 0;

    const counts = {};
    for (const label of labels) {
        counts[label] = (counts[label] || 0) + 1;
    }

    let gini = 1.0;
    const n = labels.length;
    for (const count of Object.values(counts)) {
        const p = count / n;
        gini -= p * p;
    }

    return gini;
}

/**
 * Calculate entropy for a set of labels
 * Entropy = -sum(p_i * log2(p_i)) where p_i is the proportion of class i
 * 
 * @param {number[]} labels - Array of class labels
 * @returns {number} Entropy value [0, log2(num_classes)]
 */
function calculateEntropy(labels) {
    if (labels.length === 0) return 0;

    const counts = {};
    for (const label of labels) {
        counts[label] = (counts[label] || 0) + 1;
    }

    let entropy = 0.0;
    const n = labels.length;
    for (const count of Object.values(counts)) {
        if (count > 0) {
            const p = count / n;
            entropy -= p * Math.log2(p);
        }
    }

    return entropy;
}

/**
 * Find the best split for a node
 * Tests all features and thresholds to find the split that minimizes impurity
 * 
 * @param {number[][]} X - Feature matrix (samples × features)
 * @param {number[]} y - Labels
 * @param {number[]} indices - Indices of samples in this node
 * @param {string} criterion - 'gini' or 'entropy'
 * @param {number} minSamplesSplit - Minimum samples required to split
 * @returns {{feature: number, threshold: number, gain: number}|null}
 */
function findBestSplit(X, y, indices, criterion, minSamplesSplit) {
    if (indices.length < minSamplesSplit) {
        return null;
    }

    const nFeatures = X[0].length;
    const impurityFunc = criterion === 'gini' ? calculateGini : calculateEntropy;

    // Calculate current impurity
    const currentLabels = indices.map(i => y[i]);
    const currentImpurity = impurityFunc(currentLabels);

    let bestGain = 0;
    let bestFeature = null;
    let bestThreshold = null;

    // Try each feature
    for (let feature = 0; feature < nFeatures; feature++) {
        // Get unique values for this feature (sorted)
        const values = [...new Set(indices.map(i => X[i][feature]))].sort((a, b) => a - b);

        // Try split points between consecutive unique values
        for (let i = 0; i < values.length - 1; i++) {
            const threshold = (values[i] + values[i + 1]) / 2;

            // Split indices
            const leftIndices = [];
            const rightIndices = [];
            for (const idx of indices) {
                if (X[idx][feature] <= threshold) {
                    leftIndices.push(idx);
                } else {
                    rightIndices.push(idx);
                }
            }

            // Skip if split doesn't divide the data
            if (leftIndices.length === 0 || rightIndices.length === 0) {
                continue;
            }

            // Calculate weighted impurity after split
            const leftLabels = leftIndices.map(i => y[i]);
            const rightLabels = rightIndices.map(i => y[i]);
            const leftImpurity = impurityFunc(leftLabels);
            const rightImpurity = impurityFunc(rightLabels);

            const n = indices.length;
            const weightedImpurity =
                (leftIndices.length / n) * leftImpurity +
                (rightIndices.length / n) * rightImpurity;

            // Calculate information gain
            const gain = currentImpurity - weightedImpurity;

            if (gain > bestGain) {
                bestGain = gain;
                bestFeature = feature;
                bestThreshold = threshold;
            }
        }
    }

    if (bestFeature === null) {
        return null;
    }

    return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
}

/**
 * Get the most common class in a set of labels
 * @param {number[]} labels - Array of class labels
 * @returns {number} Most common class
 */
function getMajorityClass(labels) {
    const counts = {};
    for (const label of labels) {
        counts[label] = (counts[label] || 0) + 1;
    }

    let maxCount = 0;
    let majorityClass = 0;
    for (const [label, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            majorityClass = parseInt(label);
        }
    }

    return majorityClass;
}

/**
 * Initialize tree state with root node only
 * Requirements: 1.4
 * 
 * @param {string} algorithm - Must be 'decisionTree'
 * @param {Object} dataset - Dataset object with X and y
 * @param {Object} params - Tree parameters
 * @returns {Object} Initial tree state
 */
function initTreeState(algorithm, dataset, params) {
    if (algorithm !== 'decisionTree') {
        throw new Error(`initTreeState expects 'decisionTree', got '${algorithm}'`);
    }

    const { X, y } = dataset;
    const indices = Array.from({ length: X.length }, (_, i) => i);
    const impurityFunc = params.criterion === 'gini' ? calculateGini : calculateEntropy;

    const rootNode = {
        id: '0',
        depth: 0,
        feature: null,
        threshold: null,
        prediction: getMajorityClass(y),
        samples: X.length,
        impurity: impurityFunc(y),
        left: null,
        right: null,
    };

    return {
        algorithm,
        dataset,
        root: rootNode,
        currentDepth: 0,
        maxDepth: params.maxDepth,
        nodeCount: 1,
        leafCount: 1,
        converged: false,
    };
}

/**
 * Build one level of the tree
 * Requirements: 1.1, 1.3, 2.1
 * 
 * @param {Object} state - Current tree state
 * @param {Object} params - Tree parameters
 * @returns {Object} New state with one more level
 */
function stepDecisionTree(state, params) {
    // Validate decision tree specific parameters
    if (!Number.isInteger(params.maxDepth) || params.maxDepth < 1) {
        throw new Error(`maxDepth must be a positive integer, got: ${params.maxDepth}`);
    }
    if (!['gini', 'entropy'].includes(params.criterion)) {
        throw new Error(`criterion must be 'gini' or 'entropy', got: ${params.criterion}`);
    }
    if (!Number.isInteger(params.minSamplesSplit) || params.minSamplesSplit < 2) {
        throw new Error(`minSamplesSplit must be an integer >= 2, got: ${params.minSamplesSplit}`);
    }

    // Check convergence
    if (state.currentDepth >= params.maxDepth || state.converged) {
        return { ...state, converged: true };
    }

    // Deep clone the root to avoid mutating React state during strict mode double-invocations
    const cloneNode = (node) => {
        if (!node) return null;
        return {
            ...node,
            left: cloneNode(node.left),
            right: cloneNode(node.right)
        };
    };
    
    const clonedState = {
        ...state,
        root: cloneNode(state.root)
    };

    const { X, y } = clonedState.dataset;
    const { criterion, minSamplesSplit } = params;

    // Find all leaf nodes at current depth
    const nodesToSplit = [];
    const queue = [{ node: clonedState.root, indices: Array.from({ length: X.length }, (_, i) => i) }];

    while (queue.length > 0) {
        const { node, indices } = queue.shift();

        if (node.left === null && node.right === null && node.depth === state.currentDepth) {
            // This is a leaf at current depth
            nodesToSplit.push({ node, indices });
        } else if (node.left !== null || node.right !== null) {
            // Internal node - add children to queue
            if (node.left) {
                const leftIndices = indices.filter(i => X[i][node.feature] <= node.threshold);
                queue.push({ node: node.left, indices: leftIndices });
            }
            if (node.right) {
                const rightIndices = indices.filter(i => X[i][node.feature] > node.threshold);
                queue.push({ node: node.right, indices: rightIndices });
            }
        }
    }

    // If no nodes to split, we're done
    if (nodesToSplit.length === 0) {
        return { ...state, converged: true };
    }

    // Split each leaf node at current depth
    let newNodeCount = state.nodeCount;
    let newLeafCount = state.leafCount;
    const impurityFunc = criterion === 'gini' ? calculateGini : calculateEntropy;
    let anySplit = false;

    for (const { node, indices } of nodesToSplit) {
        const split = findBestSplit(X, y, indices, criterion, minSamplesSplit);

        if (split === null) {
            // Can't split this node - it remains a leaf
            continue;
        }

        anySplit = true;

        // Split the indices
        const leftIndices = indices.filter(i => X[i][split.feature] <= split.threshold);
        const rightIndices = indices.filter(i => X[i][split.feature] > split.threshold);

        // Update node to be internal
        node.feature = split.feature;
        node.threshold = split.threshold;
        node.prediction = null;

        // Create left child
        const leftLabels = leftIndices.map(i => y[i]);
        node.left = {
            id: `${node.id}-L`,
            depth: node.depth + 1,
            feature: null,
            threshold: null,
            prediction: getMajorityClass(leftLabels),
            samples: leftIndices.length,
            impurity: impurityFunc(leftLabels),
            left: null,
            right: null,
        };

        // Create right child
        const rightLabels = rightIndices.map(i => y[i]);
        node.right = {
            id: `${node.id}-R`,
            depth: node.depth + 1,
            feature: null,
            threshold: null,
            prediction: getMajorityClass(rightLabels),
            samples: rightIndices.length,
            impurity: impurityFunc(rightLabels),
            left: null,
            right: null,
        };

        // Update counts: removed 1 leaf, added 2 leaves and 2 total nodes
        newNodeCount += 2;
        newLeafCount += 1; // -1 + 2 = +1
    }

    // If no nodes were split, we're converged
    if (!anySplit) {
        return { ...clonedState, converged: true };
    }

    return {
        ...clonedState,
        currentDepth: clonedState.currentDepth + 1,
        nodeCount: newNodeCount,
        leafCount: newLeafCount,
        converged: false,
    };
}

/**
 * Get decision regions from the tree
 * Requirements: 4.2, 8.3
 * 
 * @param {Object} treeState - Current tree state
 * @returns {Array<{id: string, bounds: {xMin, xMax, yMin, yMax}, prediction: number, samples: number}>}
 */
function getDecisionRegions(treeState) {
    const regions = [];

    // Traverse tree to find all leaf nodes
    const queue = [{
        node: treeState.root,
        bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
    }];

    while (queue.length > 0) {
        const { node, bounds } = queue.shift();

        if (node.left === null && node.right === null) {
            // Leaf node - add region
            regions.push({
                id: node.id,
                bounds,
                prediction: node.prediction,
                samples: node.samples,
            });
        } else {
            // Internal node - split bounds and add children
            if (node.left) {
                const leftBounds = { ...bounds };
                if (node.feature === 0) {
                    leftBounds.xMax = node.threshold;
                } else {
                    leftBounds.yMax = node.threshold;
                }
                queue.push({ node: node.left, bounds: leftBounds });
            }

            if (node.right) {
                const rightBounds = { ...bounds };
                if (node.feature === 0) {
                    rightBounds.xMin = node.threshold;
                } else {
                    rightBounds.yMin = node.threshold;
                }
                queue.push({ node: node.right, bounds: rightBounds });
            }
        }
    }

    return regions;
}

export { stepDecisionTree, initTreeState, getDecisionRegions, calculateGini, calculateEntropy, findBestSplit };
export default stepDecisionTree;
