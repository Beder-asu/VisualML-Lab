import { calculateGini } from '../algorithms/decisionTree.js';

describe('Decision Tree', () => {
    it('works', () => {
        expect(calculateGini([0, 0])).toBe(0);
    });
});
