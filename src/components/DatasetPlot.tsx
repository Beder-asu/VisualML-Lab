import { useEffect, useId, useRef } from 'react';
import { useElementSize } from '../hooks/useElementSize';
import { histogramBins, numericExtent, scatterPoints } from '../utils/datasetPlots';
import type { DatasetColumn } from '../utils/datasetCsv';

export function DatasetPlot({ x, y, rowCount }: { x: DatasetColumn; y?: DatasetColumn; rowCount: number }) {
    const [container, { width }] = useElementSize();
    const titleId = useId();
    const descriptionId = useId();
    const values = x.numbers?.filter(value => value !== null) ?? [];
    const points = x.numbers && y?.numbers ? scatterPoints(x.numbers, y.numbers) : [];
    const plotted = y ? points.length : values.length;
    const title = y ? `${y.name} by ${x.name}` : `Distribution of ${x.name}`;
    return (
        <figure aria-labelledby={titleId} aria-describedby={descriptionId}>
            <figcaption id={titleId} className="break-words text-lg font-semibold">{title}</figcaption>
            <p id={descriptionId} className="mt-1 text-sm text-gray-700" aria-live="polite">
                {plotted} of {rowCount} rows plotted. {rowCount - plotted} excluded for missing values.
            </p>
            <div ref={container} className="mt-3 w-full">
                {plotted === 0 ? (
                    <p className="rounded-lg bg-gray-50 p-4 text-sm">No rows contain values for both columns. Choose another pair.</p>
                ) : width >= 120 && <Plot width={width} values={values} points={points} scatter={Boolean(y)} />}
            </div>
            <p className="mt-2 break-words text-sm text-gray-700">
                X axis: {x.name}. Y axis: {y?.name ?? 'Row count'}.
            </p>
        </figure>
    );
}

type Point = { x: number; y: number };
const tick = (value: number) => new Intl.NumberFormat('en', {
    maximumSignificantDigits: 3,
    notation: value !== 0 && (Math.abs(value) >= 1e4 || Math.abs(value) < 0.01) ? 'scientific' : 'standard',
}).format(value);

function Plot({ width, values, points, scatter }: { width: number; values: number[]; points: Point[]; scatter: boolean }) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const height = 270;
    const left = 62;
    const right = width - 25;
    const top = 15;
    const bottom = height - 31;
    const histogram = scatter ? null : histogramBins(values);
    const x = histogram?.extent ?? numericExtent(points.map(point => point.x));
    const y = numericExtent(scatter ? points.map(point => point.y) : [0, Math.max(...histogram!.counts)]);
    const pixelX = (fraction: number) => left + fraction * (right - left);
    const pixelY = (fraction: number) => bottom - fraction * (bottom - top);
    const ticks = (extent: ReturnType<typeof numericExtent>) =>
        extent.min === extent.max ? [0.5] : width < 400 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];

    useEffect(() => {
        const ctx = canvas.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#4338ca';
        ctx.globalAlpha = 0.55;
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(pixelX(x.position(point.x)), pixelY(y.position(point.y)), 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    return (
        <div className="relative" aria-hidden="true">
            <svg width={width} height={height} className="block" fontSize={11} fill="#374151">
                {ticks(y).map(position => (
                    <g key={position}>
                        <path d={`M${left} ${pixelY(position)}H${right}`} stroke="#e5e7eb" />
                        <text x={left - 8} y={pixelY(position)} textAnchor="end" dominantBaseline="middle">{tick(y.valueAt(position))}</text>
                    </g>
                ))}
                {histogram?.counts.map((count, index, bins) => {
                    const start = pixelX(index / bins.length);
                    const end = pixelX((index + 1) / bins.length);
                    const barTop = pixelY(y.position(count));
                    return <rect key={index} x={start + 1} y={barTop} width={Math.max(0, end - start - 2)} height={bottom - barTop} fill="#4338ca" />;
                })}
                <path d={`M${left} ${top}V${bottom}H${right}`} stroke="#6b7280" fill="none" />
                {ticks(x).map(position => (
                    <text key={position} x={pixelX(position)} y={bottom + 20}
                        textAnchor={position === 1 ? 'end' : position === 0 ? 'start' : 'middle'}>
                        {tick(x.valueAt(position))}
                    </text>
                ))}
            </svg>
            {scatter && <canvas ref={canvas} width={width} height={height} className="pointer-events-none absolute inset-0" />}
        </div>
    );
}
