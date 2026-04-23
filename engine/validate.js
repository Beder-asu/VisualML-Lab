/**
 * engine/validate.js — Hyperparameter validation
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

/**
 * Validate training params before executing a step.
 * @param {Object} params
 * @param {string} algorithm
 */
function validateParams(params, algorithm) {
    const { lr, nIter, C } = params;

    // Requirements 6.1: lr must be a finite positive number
    if (!isFinite(lr) || lr <= 0) {
        throw new Error(`Learning rate must be a positive number, got: ${lr}`);
    }

    // Requirements 6.2: lr must not exceed 1
    if (lr > 1) {
        throw new Error(`Learning rate must not exceed 1, got: ${lr}`);
    }

    // Requirements 6.3: nIter must be a positive integer
    if (!Number.isInteger(nIter) || nIter <= 0) {
        throw new Error(`nIter must be a positive integer, got: ${nIter}`);
    }

    // Requirements 6.4: C must be > 0 for SVM
    if (algorithm === 'svm') {
        if (!isFinite(C) || C <= 0) {
            throw new Error(`Regularization parameter C must be positive, got: ${C}`);
        }
    }
}

export { validateParams };
