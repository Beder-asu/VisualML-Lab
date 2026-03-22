/**
 * LossCurve component for visualizing loss over training iterations
 * Requirements: 4.1, 4.2, 4.3
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { select } from 'd3-selection';

interface LossCurveProps {
    lossHistory: number[];
    width?: number;
    height?: number;
}

const LossCurve: React.FC<LossCurveProps> = ({
    lossHistory,
    width = 400,
    height = 200,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Memoize margin configuration
    const margin = useMemo(() => ({
        top: 20,
        right: 20,
        bottom: 40,
        left: 60
    }), []);

    // Calculate inner dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales with auto-scaling y-axis based on loss range
    const { xScale, yScale } = useMemo(() => {
        // X scale: iteration number
        const maxIteration = Math.max(lossHistory.length - 1, 1);
        const xScale = scaleLinear()
            .domain([0, maxIteration])
            .range([0, innerWidth]);

        // Y scale: loss value (auto-scale based on data range)
        let minLoss = 0;
        let maxLoss = 1;

        if (lossHistory.length > 0) {
            minLoss = Math.min(...lossHistory);
            maxLoss = Math.max(...lossHistory);

            // Add 10% padding to y-axis range for better visualization
            const padding = (maxLoss - minLoss) * 0.1;
            minLoss = Math.max(0, minLoss - padding);
            maxLoss = maxLoss + padding;

            // Handle case where all losses are the same
            if (minLoss === maxLoss) {
                minLoss = Math.max(0, maxLoss - 0.1);
                maxLoss = maxLoss + 0.1;
            }
        }

        const yScale = scaleLinear()
            .domain([maxLoss, minLoss]) // Inverted: higher loss at top
            .range([0, innerHeight]);

        return { xScale, yScale };
    }, [lossHistory, innerWidth, innerHeight]);

    // Create line generator
    const lineGenerator = useMemo(() => {
        return line<number>()
            .x((_, i) => xScale(i))
            .y(d => yScale(d));
    }, [xScale, yScale]);

    // Render the loss curve
    useEffect(() => {
        if (!svgRef.current) return;

        const svg = select(svgRef.current);
        const g = svg.select<SVGGElement>('.chart-group');

        // Clear previous content
        g.selectAll('*').remove();

        // If no data, just clear and return
        if (lossHistory.length === 0) return;

        // Draw axes
        // X-axis
        const xAxisTicks = Math.min(5, lossHistory.length);
        const xTickValues = Array.from({ length: xAxisTicks }, (_, i) =>
            Math.floor((i * (lossHistory.length - 1)) / (xAxisTicks - 1))
        );

        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${innerHeight})`)
            .selectAll('line')
            .data(xTickValues)
            .join('line')
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', 6)
            .attr('stroke', '#9CA3AF');

        // X-axis labels
        g.append('g')
            .attr('class', 'x-axis-labels')
            .attr('transform', `translate(0, ${innerHeight})`)
            .selectAll('text')
            .data(xTickValues)
            .join('text')
            .attr('x', d => xScale(d))
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#6B7280')
            .text(d => d);

        // X-axis label
        g.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#374151')
            .text('Iteration');

        // Y-axis
        const yAxisTicks = 5;
        const yDomain = yScale.domain();
        const yTickValues = Array.from({ length: yAxisTicks }, (_, i) =>
            yDomain[0] - (i * (yDomain[0] - yDomain[1])) / (yAxisTicks - 1)
        );

        g.append('g')
            .attr('class', 'y-axis')
            .selectAll('line')
            .data(yTickValues)
            .join('line')
            .attr('x1', -6)
            .attr('x2', 0)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke', '#9CA3AF');

        // Y-axis labels
        g.append('g')
            .attr('class', 'y-axis-labels')
            .selectAll('text')
            .data(yTickValues)
            .join('text')
            .attr('x', -10)
            .attr('y', d => yScale(d))
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#6B7280')
            .text(d => d.toFixed(3));

        // Y-axis label
        g.append('text')
            .attr('x', -innerHeight / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('font-size', '12px')
            .attr('fill', '#374151')
            .text('Loss');

        // Draw the loss curve line
        const pathData = lineGenerator(lossHistory);
        if (pathData) {
            g.append('path')
                .datum(lossHistory)
                .attr('class', 'loss-line')
                .attr('d', pathData)
                .attr('fill', 'none')
                .attr('stroke', '#4F46E5') // Indigo color
                .attr('stroke-width', 2);
        }

        // Draw data points for better visibility
        g.append('g')
            .attr('class', 'loss-points')
            .selectAll('circle')
            .data(lossHistory)
            .join('circle')
            .attr('cx', (_, i) => xScale(i))
            .attr('cy', d => yScale(d))
            .attr('r', 2)
            .attr('fill', '#4F46E5');

    }, [lossHistory, xScale, yScale, lineGenerator, innerWidth, innerHeight]);

    // Generate accessible description for loss curve
    const getLossCurveDescription = useMemo(() => {
        if (lossHistory.length === 0) {
            return 'Loss curve: No training data yet';
        }

        const currentLoss = lossHistory[lossHistory.length - 1];
        const initialLoss = lossHistory[0];
        const minLoss = Math.min(...lossHistory);
        const maxLoss = Math.max(...lossHistory);
        const iterations = lossHistory.length;

        return `Loss curve showing ${iterations} training iterations. Initial loss: ${initialLoss.toFixed(4)}, Current loss: ${currentLoss.toFixed(4)}, Minimum loss: ${minLoss.toFixed(4)}, Maximum loss: ${maxLoss.toFixed(4)}.`;
    }, [lossHistory]);

    return (
        <div
            className="loss-curve-container"
            role="img"
            aria-label={getLossCurveDescription}
        >
            <svg
                ref={svgRef}
                width={width}
                height={height}
                style={{ overflow: 'visible' }}
                aria-hidden="true"
            >
                <g
                    className="chart-group"
                    transform={`translate(${margin.left}, ${margin.top})`}
                />
            </svg>
            {/* Screen reader only text description */}
            <div className="sr-only">
                {getLossCurveDescription}
            </div>
        </div>
    );
};

export default LossCurve;
