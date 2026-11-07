export function numericExtent(values: number[]) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Scaling before subtraction keeps the span finite for opposite-sign extremes.
    const factor = Number.isFinite(max - min) ? 1 : Math.max(Math.abs(min), Math.abs(max));
    const low = min / factor;
    const span = max / factor - low;
    return {
        min, max,
        position: (value: number) => span === 0 ? 0.5 : (value / factor - low) / span,
        valueAt: (position: number) => position === 0 ? min : position === 1 ? max : (low + position * span) * factor,
    };
}

export function scatterPoints(x: (number | null)[], y: (number | null)[]) {
    return x.flatMap((value, index) => {
        const paired = y[index];
        return value === null || paired == null ? [] : [{ x: value, y: paired }];
    });
}

export function histogramBins(values: number[]) {
    const extent = numericExtent(values);
    const counts = Array<number>(extent.min === extent.max ? 1 : 20).fill(0);
    for (const value of values) {
        const index = Math.min(counts.length - 1, Math.floor(extent.position(value) * counts.length));
        counts[index] += 1;
    }
    return { extent, counts };
}
