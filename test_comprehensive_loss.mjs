/**
 * Comprehensive test for loss calculations and plotting coordinates
 */

import { initState, step, loadDataset } from './engine/index.js';

console.log('=== Comprehensive Loss Verification ===\n');

function testAlgorithm(algorithm, datasetName, params) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${algorithm.toUpperCase()}`);
    console.log(`Dataset: ${datasetName}`);
    console.log(`Params: lr=${params.lr}, nIter=${params.nIter}${params.C ? `, C=${params.C}` : ''}`);
    console.log('='.repeat(60));

    const dataset = loadDataset(datasetName);
    let state = initState(algorithm, dataset, params);

    console.log('\nInitial State:');
    console.log(`  iteration: ${state.iteration}`);
    console.log(`  loss: ${state.loss}`);
    console.log(`  weights: [${state.weights.join(', ')}]`);
    console.log(`  bias: ${state.bias}`);
    console.log(`  converged: ${state.converged}`);

    const lossHistory = [];
    const iterations = [];

    console.log('\nTraining Progress:');
    console.log('Iteration | Loss       | Loss Change | Plot X | Plot Y');
    console.log('----------|------------|-------------|--------|------------');

    let prevLoss = null;
    for (let i = 0; i < 10; i++) {
        state = step(state, params);
        lossHistory.push(state.loss);
        iterations.push(state.iteration);

        const lossChange = prevLoss !== null ? (state.loss - prevLoss).toFixed(6) : 'N/A';
        const plotX = state.iteration; // For plotting, x = iteration number
        const plotY = state.loss;

        console.log(
            `${state.iteration.toString().padStart(9)} | ` +
            `${state.loss.toFixed(6).padStart(10)} | ` +
            `${lossChange.toString().padStart(11)} | ` +
            `${plotX.toString().padStart(6)} | ` +
            `${plotY.toFixed(6)}`
        );

        prevLoss = state.loss;
    }

    console.log('\nVerification Checks:');

    // Check 1: Loss values are finite
    const allFinite = lossHistory.every(l => isFinite(l));
    console.log(`  ✓ All loss values are finite: ${allFinite ? 'PASS' : 'FAIL'}`);

    // Check 2: Iteration count matches history length
    const iterMatch = state.iteration === lossHistory.length;
    console.log(`  ✓ Iteration count (${state.iteration}) matches history length (${lossHistory.length}): ${iterMatch ? 'PASS' : 'FAIL'}`);

    // Check 3: Loss values are non-negative
    const allNonNegative = lossHistory.every(l => l >= 0);
    console.log(`  ✓ All loss values are non-negative: ${allNonNegative ? 'PASS' : 'FAIL'}`);

    // Check 4: Weights and bias are finite
    const weightsFinite = state.weights.every(w => isFinite(w));
    const biasFinite = isFinite(state.bias);
    console.log(`  ✓ Weights are finite: ${weightsFinite ? 'PASS' : 'FAIL'}`);
    console.log(`  ✓ Bias is finite: ${biasFinite ? 'PASS' : 'FAIL'}`);

    // Check 5: For plotting - x should be 1-indexed
    console.log('\nPlotting Coordinates (first 3 points):');
    for (let i = 0; i < Math.min(3, lossHistory.length); i++) {
        console.log(`  Point ${i}: x=${i + 1} (iteration), y=${lossHistory[i].toFixed(6)} (loss)`);
    }

    return {
        algorithm,
        finalLoss: state.loss,
        lossHistory,
        allChecksPass: allFinite && iterMatch && allNonNegative && weightsFinite && biasFinite
    };
}

// Test all algorithms
const results = [];

results.push(testAlgorithm('linearRegression', 'linear', {
    lr: 0.01,
    nIter: 100
}));

results.push(testAlgorithm('logisticRegression', 'blobs', {
    lr: 0.1,
    nIter: 100
}));

results.push(testAlgorithm('svm', 'blobs', {
    lr: 0.001, // Lower learning rate for SVM
    nIter: 100,
    C: 1.0
}));

console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));

for (const result of results) {
    const status = result.allChecksPass ? '✓ PASS' : '✗ FAIL';
    console.log(`${result.algorithm.padEnd(20)}: ${status} (final loss: ${result.finalLoss.toFixed(6)})`);
}

console.log('\n=== All Tests Complete ===');
