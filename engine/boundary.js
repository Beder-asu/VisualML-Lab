/**
 * engine/boundary.js — Decision boundary computation
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

/**
 * Compute decision boundary / regression line points for rendering.
 *
 * For Logistic Regression and SVM (classification):
 *   The decision boundary is where w·x + b = 0.
 *   In 2D with features [x0, x1]: w[0]*x0 + w[1]*x1 + b = 0
 *   Solving for x1 (y): x1 = -(w[0]*x0 + b) / w[1]
 *
 * For Linear Regression:
 *   The regression line is: y = w[0]*x + b
 *   (1D feature, so weights has one element)
 *
 * When weights are all zero, returns a horizontal line at y = 0.5 (Req 4.4).
 *
 * @param {Object} state       - Current training state
 * @param {number} [gridSize=100] - Number of evenly spaced x points
 * @returns {Array<{x: number, y: number}>}
 */
function getDecisionBoundary(state, gridSize = 100) {
    const { weights, bias, algorithm } = state;

    // Req 4.4: zero weights → horizontal line at y = 0.5
    const allZero = weights.every(w => w === 0);
    if (allZero) {
        return {
            boundary: Array.from({ length: gridSize }, (_, i) => ({
                x: i / (gridSize - 1),
                y: 0.5,
            })),
        };
    }

    const points = [];

    if (algorithm === 'linearRegression') {
        // Req 4.3: regression line — y = w[0]*x + b
        for (let i = 0; i < gridSize; i++) {
            const x = i / (gridSize - 1);
            const y = weights[0] * x + bias;
            points.push({ x, y });
        }
    } else {
        // Req 4.1, 4.2: classification boundary — w[0]*x + w[1]*y + b = 0
        // Solve for y: y = -(w[0]*x + b) / w[1]
        for (let i = 0; i < gridSize; i++) {
            const x = i / (gridSize - 1);
            const y = -(weights[0] * x + bias) / weights[1];
            points.push({ x, y });
        }

        if (algorithm === 'svm') {
            const marginPos = [];
            const marginNeg = [];
            for (let i = 0; i < gridSize; i++) {
                const x = i / (gridSize - 1);
                // Wx + b = 1 => y = -(w[0]x + b - 1)/w[1]
                const yp = -(weights[0] * x + bias - 1) / weights[1];
                // Wx + b = -1 => y = -(w[0]x + b + 1)/w[1]
                const yn = -(weights[0] * x + bias + 1) / weights[1];
                marginPos.push({ x, y: yp });
                marginNeg.push({ x, y: yn });
            }
            return { boundary: points, marginPos, marginNeg };
        }
        return { boundary: points };
    }

    return { boundary: points };
}

export { getDecisionBoundary };
