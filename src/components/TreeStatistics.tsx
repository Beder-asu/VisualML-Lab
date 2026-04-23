/**
 * TreeStatistics.tsx — Display tree statistics
 * 
 * Shows current tree depth, node count, leaf count, samples per leaf, and training accuracy.
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React from 'react';
import { TreeState } from '../hooks/useTreeController';

interface TreeStatisticsProps {
    treeState: TreeState | null;
}

/**
 * Calculate training accuracy by checking predictions against true labels
 */
function calculateAccuracy(treeState: TreeState): number {
    if (!treeState || !treeState.root) return 0;

    const { X, y } = treeState.dataset;
    let correct = 0;

    // For each sample, traverse tree to find prediction
    for (let i = 0; i < X.length; i++) {
        const sample = X[i];
        let node = treeState.root;

        // Traverse to leaf
        while (node.left !== null || node.right !== null) {
            if (node.feature !== null && node.threshold !== null) {
                if (sample[node.feature] <= node.threshold) {
                    node = node.left!;
                } else {
                    node = node.right!;
                }
            } else {
                break;
            }
        }

        // Check if prediction matches true label
        if (node.prediction === y[i]) {
            correct++;
        }
    }

    return (correct / X.length) * 100;
}

/**
 * Get samples per leaf as an array
 */
function getSamplesPerLeaf(treeState: TreeState): number[] {
    if (!treeState || !treeState.root) return [];

    const samples: number[] = [];
    const queue = [treeState.root];

    while (queue.length > 0) {
        const node = queue.shift()!;

        if (node.left === null && node.right === null) {
            // Leaf node
            samples.push(node.samples);
        } else {
            // Internal node - add children
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }

    return samples;
}

export const TreeStatistics: React.FC<TreeStatisticsProps> = ({ treeState }) => {
    if (!treeState) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Tree Statistics
                </h3>
                <p className="text-sm text-gray-500">No tree data available</p>
            </div>
        );
    }

    const currentDepth = treeState.currentDepth;
    const maxDepth = treeState.maxDepth;
    const nodeCount = treeState.nodeCount;
    const leafCount = treeState.leafCount;
    const samplesPerLeaf = getSamplesPerLeaf(treeState);
    const accuracy = treeState.converged ? calculateAccuracy(treeState) : null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Tree Statistics
            </h3>
            <div className="space-y-2">
                {/* Depth - Requirement 9.1 */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Depth:</span>
                    <span className="text-sm font-medium text-gray-900">
                        {currentDepth} / {maxDepth}
                    </span>
                </div>

                {/* Node Count - Requirement 9.2 */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Nodes:</span>
                    <span className="text-sm font-medium text-gray-900">{nodeCount}</span>
                </div>

                {/* Leaf Count - Requirement 9.3 */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Leaf Nodes:</span>
                    <span className="text-sm font-medium text-gray-900">{leafCount}</span>
                </div>

                {/* Samples per Leaf - Requirement 9.4 */}
                <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-gray-600 truncate">Samples per Leaf:</span>
                    <span className="text-sm font-medium text-gray-900 shrink-0">
                        {samplesPerLeaf.length > 0
                            ? `${Math.min(...samplesPerLeaf)} - ${Math.max(...samplesPerLeaf)}`
                            : 'N/A'}
                    </span>
                </div>

                {/* Training Accuracy - Requirement 9.5 */}
                {accuracy !== null && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Training Accuracy:</span>
                        <span className="text-sm font-semibold text-green-600">
                            {accuracy.toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
