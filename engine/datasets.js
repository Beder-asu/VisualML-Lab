/**
 * engine/datasets.js — Built-in datasets
 *
 * All datasets are embedded at module load time — no runtime file I/O.
 * All feature columns are normalized to [0, 1] via min-max normalization.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Min-max normalize each column of a 2D array to [0, 1].
 * If a column has zero range (all values identical), every value becomes 0.
 * @param {number[][]} X
 * @returns {number[][]}
 */
function normalizeColumns(X) {
    const nCols = X[0].length;
    const mins = new Array(nCols).fill(Infinity);
    const maxs = new Array(nCols).fill(-Infinity);

    for (const row of X) {
        for (let j = 0; j < nCols; j++) {
            if (row[j] < mins[j]) mins[j] = row[j];
            if (row[j] > maxs[j]) maxs[j] = row[j];
        }
    }

    return X.map(row =>
        row.map((v, j) => {
            const range = maxs[j] - mins[j];
            return range === 0 ? 0 : (v - mins[j]) / range;
        })
    );
}

// ---------------------------------------------------------------------------
// iris-2d — sourced from iris_dataset.csv (embedded as JS array)
// Features: sepal_length, sepal_width
// Labels:   0 = setosa, 1 = non-setosa
// ---------------------------------------------------------------------------

const IRIS_RAW = [
    [5.1, 3.5, "setosa"], [4.9, 3.0, "setosa"], [4.7, 3.2, "setosa"], [4.6, 3.1, "setosa"],
    [5.0, 3.6, "setosa"], [5.4, 3.9, "setosa"], [4.6, 3.4, "setosa"], [5.0, 3.4, "setosa"],
    [4.4, 2.9, "setosa"], [4.9, 3.1, "setosa"], [5.4, 3.7, "setosa"], [4.8, 3.4, "setosa"],
    [4.8, 3.0, "setosa"], [4.3, 3.0, "setosa"], [5.8, 4.0, "setosa"], [5.7, 4.4, "setosa"],
    [5.4, 3.9, "setosa"], [5.1, 3.5, "setosa"], [5.7, 3.8, "setosa"], [5.1, 3.8, "setosa"],
    [5.4, 3.4, "setosa"], [5.1, 3.7, "setosa"], [4.6, 3.6, "setosa"], [5.1, 3.3, "setosa"],
    [4.8, 3.4, "setosa"], [5.0, 3.0, "setosa"], [5.0, 3.4, "setosa"], [5.2, 3.5, "setosa"],
    [5.2, 3.4, "setosa"], [4.7, 3.2, "setosa"], [4.8, 3.1, "setosa"], [5.4, 3.4, "setosa"],
    [5.2, 4.1, "setosa"], [5.5, 4.2, "setosa"], [4.9, 3.1, "setosa"], [5.0, 3.2, "setosa"],
    [5.5, 3.5, "setosa"], [4.9, 3.1, "setosa"], [4.4, 3.0, "setosa"], [5.1, 3.4, "setosa"],
    [5.0, 3.5, "setosa"], [4.5, 2.3, "setosa"], [4.4, 3.2, "setosa"], [5.0, 3.5, "setosa"],
    [5.1, 3.8, "setosa"], [4.8, 3.0, "setosa"], [5.1, 3.8, "setosa"], [4.6, 3.2, "setosa"],
    [5.3, 3.7, "setosa"], [5.0, 3.3, "setosa"],
    [7.0, 3.2, "versicolor"], [6.4, 3.2, "versicolor"], [6.9, 3.1, "versicolor"], [5.5, 2.3, "versicolor"],
    [6.5, 2.8, "versicolor"], [5.7, 2.8, "versicolor"], [6.3, 3.3, "versicolor"], [4.9, 2.4, "versicolor"],
    [6.6, 2.9, "versicolor"], [5.2, 2.7, "versicolor"], [5.0, 2.0, "versicolor"], [5.9, 3.0, "versicolor"],
    [6.0, 2.2, "versicolor"], [6.1, 2.9, "versicolor"], [5.6, 2.9, "versicolor"], [6.7, 3.1, "versicolor"],
    [5.6, 3.0, "versicolor"], [5.8, 2.7, "versicolor"], [6.2, 2.2, "versicolor"], [5.6, 2.5, "versicolor"],
    [5.9, 3.2, "versicolor"], [6.1, 2.8, "versicolor"], [6.3, 2.5, "versicolor"], [6.1, 2.8, "versicolor"],
    [6.4, 2.9, "versicolor"], [6.6, 3.0, "versicolor"], [6.8, 2.8, "versicolor"], [6.7, 3.0, "versicolor"],
    [6.0, 2.9, "versicolor"], [5.7, 2.6, "versicolor"], [5.5, 2.4, "versicolor"], [5.5, 2.4, "versicolor"],
    [5.8, 2.7, "versicolor"], [6.0, 2.7, "versicolor"], [5.4, 3.0, "versicolor"], [6.0, 3.4, "versicolor"],
    [6.7, 3.1, "versicolor"], [6.3, 2.3, "versicolor"], [5.6, 3.0, "versicolor"], [5.5, 2.5, "versicolor"],
    [5.5, 2.6, "versicolor"], [6.1, 3.0, "versicolor"], [5.8, 2.6, "versicolor"], [5.0, 2.3, "versicolor"],
    [5.6, 2.7, "versicolor"], [5.7, 3.0, "versicolor"], [5.7, 2.9, "versicolor"], [6.2, 2.9, "versicolor"],
    [5.1, 2.5, "versicolor"], [5.7, 2.8, "versicolor"],
    [6.3, 3.3, "virginica"], [5.8, 2.7, "virginica"], [7.1, 3.0, "virginica"], [6.3, 2.9, "virginica"],
    [6.5, 3.0, "virginica"], [7.6, 3.0, "virginica"], [4.9, 2.5, "virginica"], [7.3, 2.9, "virginica"],
    [6.7, 2.5, "virginica"], [7.2, 3.6, "virginica"], [6.5, 3.2, "virginica"], [6.4, 2.7, "virginica"],
    [6.8, 3.0, "virginica"], [5.7, 2.5, "virginica"], [5.8, 2.8, "virginica"], [6.4, 3.2, "virginica"],
    [6.5, 3.0, "virginica"], [7.7, 3.8, "virginica"], [7.7, 2.6, "virginica"], [6.0, 2.2, "virginica"],
    [6.9, 3.2, "virginica"], [5.6, 2.8, "virginica"], [7.7, 2.8, "virginica"], [6.3, 2.7, "virginica"],
    [6.7, 3.3, "virginica"], [7.2, 3.2, "virginica"], [6.2, 2.8, "virginica"], [6.1, 3.0, "virginica"],
    [6.4, 2.8, "virginica"], [7.2, 3.0, "virginica"], [7.4, 2.8, "virginica"], [7.9, 3.8, "virginica"],
    [6.4, 2.8, "virginica"], [6.3, 2.8, "virginica"], [6.1, 2.6, "virginica"], [7.7, 3.0, "virginica"],
    [6.3, 3.4, "virginica"], [6.4, 3.1, "virginica"], [6.0, 3.0, "virginica"], [6.9, 3.1, "virginica"],
    [6.7, 3.1, "virginica"], [6.9, 3.1, "virginica"], [5.8, 2.7, "virginica"], [6.8, 3.2, "virginica"],
    [6.7, 3.3, "virginica"], [6.7, 3.0, "virginica"], [6.3, 2.5, "virginica"], [6.5, 3.0, "virginica"],
    [6.2, 3.4, "virginica"], [5.9, 3.0, "virginica"],
];

function buildIris2d() {
    const rawX = IRIS_RAW.map(r => [r[0], r[1]]);
    const y = IRIS_RAW.map(r => (r[2] === 'setosa' ? 0 : 1));
    const X = normalizeColumns(rawX);
    return { name: 'iris-2d', X, y, task: 'classification' };
}

// ---------------------------------------------------------------------------
// blobs — synthetic 2-cluster blob data for binary classification
// ---------------------------------------------------------------------------

function buildBlobs() {
    // Deterministic pseudo-random using a simple LCG so the dataset is stable
    // across module reloads without requiring a random seed library.
    let seed = 42;
    function rand() {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0xffffffff;
    }
    function randn() {
        // Box-Muller transform
        const u = rand() || 1e-10;
        const v = rand();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    const n = 100; // 50 per cluster
    const rawX = [];
    const y = [];

    // Cluster 0: centred at (2, 2)
    for (let i = 0; i < n / 2; i++) {
        rawX.push([2 + randn() * 0.6, 2 + randn() * 0.6]);
        y.push(0);
    }
    // Cluster 1: centred at (5, 5)
    for (let i = 0; i < n / 2; i++) {
        rawX.push([5 + randn() * 0.6, 5 + randn() * 0.6]);
        y.push(1);
    }

    const X = normalizeColumns(rawX);
    return { name: 'blobs', X, y, task: 'classification' };
}

// ---------------------------------------------------------------------------
// linear — synthetic linear regression dataset
// ---------------------------------------------------------------------------

function buildLinear() {
    let seed = 7;
    function rand() {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0xffffffff;
    }
    function randn() {
        const u = rand() || 1e-10;
        const v = rand();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    const n = 100;
    const rawX = [];
    const rawY = [];

    for (let i = 0; i < n; i++) {
        const x = rand() * 10; // x in [0, 10]
        const noise = randn() * 1.5;
        rawX.push([x]);
        rawY.push(2.5 * x + 1.0 + noise);
    }

    const X = normalizeColumns(rawX);
    // Normalize y to [0, 1] as well so it lives in the same space as features
    const yMin = Math.min(...rawY);
    const yMax = Math.max(...rawY);
    const yRange = yMax - yMin;
    const y = rawY.map(v => (yRange === 0 ? 0 : (v - yMin) / yRange));

    return { name: 'linear', X, y, task: 'regression' };
}

// ---------------------------------------------------------------------------
// Eagerly build all datasets at module load time
// ---------------------------------------------------------------------------

const DATASETS = {
    'iris-2d': buildIris2d(),
    'blobs': buildBlobs(),
    'linear': buildLinear(),
};

const SUPPORTED_DATASETS = Object.keys(DATASETS);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load a named built-in dataset.
 * @param {string} name
 * @returns {{ name: string, X: number[][], y: number[], task: string }}
 */
function loadDataset(name) {
    if (!DATASETS[name]) {
        throw new Error(`Unsupported dataset: '${name}'. Supported: ${SUPPORTED_DATASETS.join(', ')}`);
    }
    return DATASETS[name];
}

export { loadDataset, normalizeColumns };
