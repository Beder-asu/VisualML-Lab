/**
 * Test to verify loss history tracking matches iteration numbers
 */

import { initState, step, loadDataset } from './engine/index.js';

console.log('=== Loss History Index Verification ===\n');

const params = { lr: 0.01, nIter: 10, C: 1.0 };
const algorithm = 'linearRegression';
const dataset = loadDataset('linear');

let state = initState(algorithm, dataset, params);
const lossHistory = [];

console.log('Initial state:');
console.log(`  Iteration: ${state.iteration}`);
console.log(`  Loss: ${state.loss}`);
console.log('');

console.log('Stepping through training:');
console.log('Step | State.iteration | State.loss | History Index | History Value');
console.log('-----|-----------------|------------|---------------|---------------');

for (let stepNum = 1; stepNum <= 5; stepNum++) {
    state = step(state, params);
    lossHistory.push(state.loss);

    const historyIndex = lossHistory.length - 1;
    const historyValue = lossHistory[historyIndex];

    console.log(
        `${stepNum.toString().padStart(4)} | ` +
        `${state.iteration.toString().padStart(15)} | ` +
        `${state.loss.toFixed(6).padStart(10)} | ` +
        `${historyIndex.toString().padStart(13)} | ` +
        `${historyValue.toFixed(6)}`
    );
}

console.log('\n=== Verification ===');
console.log(`Final state.iteration: ${state.iteration}`);
console.log(`Loss history length: ${lossHistory.length}`);
console.log(`Loss history: [${lossHistory.map(l => l.toFixed(4)).join(', ')}]`);

// Verify that iteration number matches history length
if (state.iteration === lossHistory.length) {
    console.log('✓ PASS: Iteration count matches loss history length');
} else {
    console.log('✗ FAIL: Iteration count does NOT match loss history length');
}

// Verify that x-axis (iteration) should be 0-indexed or 1-indexed?
console.log('\nFor plotting:');
console.log('  If x-axis represents iteration number: use state.iteration (1, 2, 3, ...)');
console.log('  If x-axis represents array index: use index (0, 1, 2, ...)');
console.log('  Current implementation uses: array index (0-based)');
