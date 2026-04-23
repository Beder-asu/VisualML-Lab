/**
 * Returns display labels for a given algorithm.
 * Used by PointTooltip and getVisualizationDescription in Canvas2D.
 */
export interface AlgorithmLabels {
    class0: string;
    class1: string;
    f1Name: string;
    f2Name: string;
    isRegression: boolean;
}

export function getAlgorithmLabels(algorithm: string): AlgorithmLabels {
    switch (algorithm) {
        case 'logisticRegression':
            return {
                class0: 'Setosa (0)',
                class1: 'Non-Setosa (1)',
                f1Name: 'Sepal Length:',
                f2Name: 'Sepal Width:',
                isRegression: false,
            };
        case 'svm':
            return {
                class0: 'Cluster 0',
                class1: 'Cluster 1',
                f1Name: 'Feat 1 (X):',
                f2Name: 'Feat 2 (Y):',
                isRegression: false,
            };
        case 'linearRegression':
            return {
                class0: '',
                class1: '',
                f1Name: 'Input (x):',
                f2Name: 'Target (y):',
                isRegression: true,
            };
        default:
            return {
                class0: 'Blue (0)',
                class1: 'Red (1)',
                f1Name: 'Feature 1:',
                f2Name: 'Feature 2:',
                isRegression: false,
            };
    }
}
