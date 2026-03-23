/**
 * Manual verification script for loss calculations across all algorithms
 */

import { initState, step, loadDataset } from './engine/index.js';

console.log('=== Loss Calculation Verification ===\n');

// Test parameters
const params = {
    lr: 0.01,
    nIter: 10,
    C: 1.0 // For SVM
};

const algorithms = ['linearRegression', 'logisticRegression', 'svm'];
const datasets = {
    linearRegression: 'linear',
    logisticRegression: 'blobs',
    svm: 'blobs'
};

for (const algorithm of algorithms) {
    console.log(`\n--- ${algorithm.toUpperCase()} ---`);

    const datasetName = datasets[algorithm];
    const dataset = loadDataset(datasetName);

    console.log(`Dataset: ${datasetName}`);
    console.log(`Data points: ${dataset.X.length}`);
    console.log(`Features: ${dataset.X[0].length}`);

    let state = initState(algorithm, dataset, params);

    console.log(`\nInitial state:`);
    console.log(`  Iteration: ${state.iteration}`);
    console.log(`  Loss: ${state.loss}`);
    console.log(`  Weights: [${state.weights.join(', ')}]`);
    console.log(`  Bias: ${state.bias}`);

    console.log(`\nTraining for 5 steps:`);
    console.log(`Iter | Loss`);
    console.log(`-----|----------`);

    for (let i = 0; i < 5; i++) {
        state = step(state, params);
        console.log(`${state.iteration.toString().padStart(4)} | ${state.loss.toFixed(6)}`);
    }

    // Verify loss is decreasing (for most cases)
    const finalState = state;
    console.log(`\nFinal state after 5 iterations:`);
    console.log(`  Iteration: ${finalState.iteration}`);
    console.log(`  Loss: ${finalState.loss}`);
    console.log(`  Weights: [${finalState.weights.map(w => w.toFixed(4)).join(', ')}]`);
    console.log(`  Bias: ${finalState.bias.toFixed(4)}`);
    console.log(`  Converged: ${finalState.converged}`);
}

console.log('\n=== Verification Complete ===');
