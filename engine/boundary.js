/**
 * engine/boundary.js — Decision boundary computation
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

const plotCorners = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
];

/** Sample the part of w0*x + w1*y + offset = 0 inside the plot. */
function sampleVisibleLine(w0, w1, offset, gridSize) {
    if (w0 === 0 && w1 === 0) return [];

    const scale = Math.max(Math.abs(w0), Math.abs(w1), Math.abs(offset));
    const values = plotCorners.map(({ x, y }) => (w0 / scale) * x + (w1 / scale) * y + offset / scale);
    const intersections = [];
    const add = (point) => {
        if (!intersections.some(({ x, y }) => x === point.x && y === point.y)) {
            intersections.push(point);
        }
    };

    for (let i = 0; i < plotCorners.length; i++) {
        const next = (i + 1) % plotCorners.length;
        const start = plotCorners[i];
        const end = plotCorners[next];
        const a = values[i];
        const b = values[next];
        if (a === 0) add(start);
        if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
            const t = a / (a - b);
            add({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t });
        }
    }

    if (intersections.length < 2) return [];
    intersections.sort((a, b) => a.x - b.x || a.y - b.y);
    const start = intersections[0];
    const end = intersections[intersections.length - 1];
    return Array.from({ length: gridSize }, (_, i) => {
        const t = i / (gridSize - 1);
        return { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t };
    });
}

/**
 * Compute decision boundary / regression line points for rendering.
 *
 * For Logistic Regression and SVM (classification):
 *   The decision boundary is where w·x + b = 0.
 *   In 2D with features [x0, x1]: w[0]*x0 + w[1]*x1 + b = 0
 *   Sample the segment inside the unit square. Offscreen lines and
 *   corner-only contacts return no points.
 *
 * For Linear Regression:
 *   The regression line is: y = w[0]*x + b
 *   (1D feature, so weights has one element)
 *
 * The all-zero model retains the initial horizontal guide at y = 0.5.
 *
 * @param {Object} state       - Current training state
 * @param {number} [gridSize=100] - Number of evenly spaced points per visible line (at least 2)
 * @returns {{boundary: Array<{x: number, y: number}>, marginPos?: Array<{x: number, y: number}>, marginNeg?: Array<{x: number, y: number}>}}
 */
function getDecisionBoundary(state, gridSize = 100) {
    const { weights, bias, algorithm } = state;

    // Req 4.4: zero weights → horizontal line at y = 0.5
    const allZero = weights.every(w => w === 0);
    if (allZero && bias === 0) {
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
        return { boundary: points };
    }

    const [w0, w1] = weights;
    const boundary = sampleVisibleLine(w0, w1, bias, gridSize);
    if (algorithm === 'svm') {
        return {
            boundary,
            marginPos: sampleVisibleLine(w0, w1, bias - 1, gridSize),
            marginNeg: sampleVisibleLine(w0, w1, bias + 1, gridSize),
        };
    }
    return { boundary };
}

export { getDecisionBoundary };
