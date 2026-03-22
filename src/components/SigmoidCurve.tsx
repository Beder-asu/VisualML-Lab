/**
 * SigmoidCurve component for visualizing 1D Logistic Regression probability
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { select } from 'd3-selection';

interface SigmoidCurveProps {
    state: any; // ML Engine state
    width?: number;
    height?: number;
}

const SigmoidCurve: React.FC<SigmoidCurveProps> = ({
    state,
    width = 400,
    height = 400,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Memoize margin configuration
    const margin = useMemo(() => ({
        top: 20,
        right: 20,
        bottom: 60,
        left: 60
    }), []);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const colors = useMemo(() => ({
        class0: '#3B82F6', // blue
        class1: '#EF4444', // red
    }), []);

    // Render the sigmoid curve and points
    useEffect(() => {
        if (!svgRef.current || !state || !state.dataset?.X || !state.weights) return;

        const svg = select(svgRef.current);
        const g = svg.select<SVGGElement>('.chart-group');
        g.selectAll('*').remove();

        const X = state.dataset.X;
        const y = state.dataset.y;
        const weights = state.weights;
        const bias = state.bias;

        // Calculate z values for all points: z = w^T x + b
        const zValues = X.map((point: number[]) => {
            return (weights[0] || 0) * point[0] + (weights[1] || 0) * point[1] + bias;
        });

        // Dynamic domain bounds
        const minZ = Math.min(-5, ...zValues) - 1;
        const maxZ = Math.max(5, ...zValues) + 1;

        const xScale = scaleLinear().domain([minZ, maxZ]).range([0, innerWidth]);
        const yScale = scaleLinear().domain([1, 0]).range([0, innerHeight]);

        // Draw axes
        // X-axis (y = 0, representing 0% probability)
        g.append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', yScale(0))
            .attr('y2', yScale(0))
            .attr('stroke', '#9CA3AF');

        // Y-axis (x = 0, representing 50% probability threshold distance)
        g.append('line')
            .attr('x1', xScale(0))
            .attr('x2', xScale(0))
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .attr('stroke', '#9CA3AF')
            .attr('stroke-dasharray', '5,5');

        // Draw Sigmoid Curve (The math mathematical S-Curve)
        const generateCurvePoints = () => {
            const points = [];
            const steps = 100;
            const stepSize = (maxZ - minZ) / steps;
            for (let i = 0; i <= steps; i++) {
                const z = minZ + i * stepSize;
                const p = 1 / (1 + Math.exp(-z));
                points.push({ z, p });
            }
            return points;
        };

        const curvePoints = generateCurvePoints();
        const lineGenerator = line<{z: number, p: number}>()
            .x(d => xScale(d.z))
            .y(d => yScale(d.p));

        g.append('path')
            .datum(curvePoints)
            .attr('fill', 'none')
            .attr('stroke', '#4F46E5')
            .attr('stroke-width', 2)
            .attr('d', lineGenerator);

        // Draw original dataset circles on the curve
        g.append('g')
            .selectAll('circle')
            .data(X)
            .join('circle')
            .attr('cx', (_, i) => xScale(zValues[i]))
            .attr('cy', (_, i) => yScale(1 / (1 + Math.exp(-zValues[i]))))
            .attr('r', 5)
            .attr('fill', (_, i) => y[i] === 0 ? colors.class0 : colors.class1)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5);

        // Chart Labels
        g.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('fill', '#374151')
            .text('Distance from boundary (z)');

        g.append('text')
            .attr('x', -innerHeight / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('font-size', '14px')
            .attr('fill', '#374151')
            .text('Probability P(y=1)');

    }, [state, innerWidth, innerHeight, colors]);

    return (
        <div className="sigmoid-curve-container">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                style={{ overflow: 'visible' }}
            >
                <g className="chart-group" transform={`translate(${margin.left}, ${margin.top})`} />
            </svg>
        </div>
    );
};

export default SigmoidCurve;
