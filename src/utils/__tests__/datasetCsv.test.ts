import { describe, expect, it } from 'vitest';
import { csvLimits, parseDatasetCsv } from '../datasetCsv';
import { histogramBins, numericExtent, scatterPoints } from '../datasetPlots';

describe('CSV import', () => {
    it('preserves quoted cells and original units while classifying numeric columns', () => {
        const data = parseDatasetCsv('fixture.csv', '\uFEFFamount,rate,label,mixed,blank\r\n1.2e3,-2,"a,b",2,\r\n,3,"two\nlines",x,');
        expect(data.rows[1][2]).toBe('two\nlines');
        expect(data.rows[0][2]).toBe('a,b');
        expect(data.columns.map(column => column.numbers)).toEqual([[1200, null], [-2, 3], null, null, null]);
        expect(data.columns.map(column => column.missing)).toEqual([1, 0, 0, 0, 2]);
        expect(parseDatasetCsv('quoted.csv', 'label\n"He said ""hello"""').rows).toEqual([['He said "hello"']]);
    });

    it.each([
        ['x,y\n"unfinished,2', /quotes|quote/i],
        ['x,y\n"wrapped\nvalue",2\nbare"quote,3', /record 3.*inner quote/],
        ['x, x\n1,2', /different name/],
        ['x,\n1,2', /every column/],
        ['x,y\n1', /record 2.*Expected 2/],
        ['x,y\n1,2,3', /record 2.*Expected 2/],
        ['x\n', /at least one data row/],
    ])('rejects invalid CSV %s', (contents, message) => {
        expect(() => parseDatasetCsv('bad.csv', contents)).toThrow(message);
    });

    it('accepts the row and column limits and rejects the next row or column', () => {
        expect(parseDatasetCsv('rows.csv', 'x\n' + '1\n'.repeat(csvLimits.rows)).rows).toHaveLength(csvLimits.rows);
        expect(() => parseDatasetCsv('rows.csv', 'x\n' + '1\n'.repeat(csvLimits.rows + 1))).toThrow(/10,000/);
        const row = (size: number) => Array.from({ length: size }, (_, i) => i).join(',');
        const columns = (size: number) => row(size) + '\n' + row(size);
        expect(parseDatasetCsv('columns.csv', columns(csvLimits.columns)).columns).toHaveLength(csvLimits.columns);
        expect(() => parseDatasetCsv('columns.csv', columns(csvLimits.columns + 1))).toThrow(/50 columns/);
    });
});

describe('plot data', () => {
    it('pairs coordinates by row and excludes missing values', () => {
        expect(scatterPoints([-10, null, 30], [2, 3, null])).toEqual([{ x: -10, y: 2 }]);
        expect(numericExtent([-10, 30]).position(10)).toBe(0.5);
    });

    it('puts each sample into exactly one bin including both endpoints', () => {
        const result = histogramBins([-10, -9, 0, 10]);
        expect(result.counts[0]).toBe(1);
        expect(result.counts[1]).toBe(1);
        expect(result.counts[10]).toBe(1);
        expect(result.counts[19]).toBe(1);
        expect(result.counts.reduce((total, count) => total + count, 0)).toBe(4);
        expect(histogramBins([5, 5, 5]).counts).toEqual([3]);
        expect(numericExtent([-Number.MAX_VALUE, Number.MAX_VALUE]).position(0)).toBe(0.5);
    });
});
