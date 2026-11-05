import { useState, useEffect, useRef } from 'react';
import type { State } from '../types/engine';
import { getDecisionBoundary } from '../../engine/boundary';

export interface BoundaryPoint { x: number; y: number; }
export interface UseVisualizationResult {
    boundaryPoints: BoundaryPoint[];
    marginPosPoints: BoundaryPoint[];
    marginNegPoints: BoundaryPoint[];
    isAnimating: boolean;
}

const emptyGeometry = () => ({ boundaryPoints: [], marginPosPoints: [], marginNegPoints: [] });
type Geometry = Omit<UseVisualizationResult, 'isAnimating'>;

/** Interpolate from the displayed geometry when a newer training result arrives. */
export function useVisualization(state: State | null): UseVisualizationResult {
    const [geometry, setGeometry] = useState<Geometry>(emptyGeometry);
    const [isAnimating, setIsAnimating] = useState(false);
    const displayedRef = useRef<Geometry>(emptyGeometry());
    // Loss/iteration updates alone do not alter geometry or interrupt a transition.
    const algorithm = state?.algorithm;
    const bias = state?.bias;
    const weightsKey = state?.weights.join(',');

    useEffect(() => {
        let frame: number | undefined;
        const display = (next: Geometry) => {
            displayedRef.current = next;
            setGeometry(next);
        };
        if (!algorithm || bias === undefined || weightsKey === undefined) {
            display(emptyGeometry());
            setIsAnimating(false);
            return;
        }
        try {
            const result = getDecisionBoundary({ algorithm, bias, weights: weightsKey.split(',').map(Number) } as State, 100);
            const target: Geometry = {
                boundaryPoints: result.boundary ?? [],
                marginPosPoints: result.marginPos ?? [],
                marginNegPoints: result.marginNeg ?? [],
            };
            const start = displayedRef.current;
            const startTime = performance.now();
            const interpolate = (from: BoundaryPoint[], to: BoundaryPoint[], progress: number) =>
                to.map((point, i) => ({
                    x: (from[i]?.x ?? point.x) + (point.x - (from[i]?.x ?? point.x)) * progress,
                    y: (from[i]?.y ?? point.y) + (point.y - (from[i]?.y ?? point.y)) * progress,
                }));
            const animate = (time: number) => {
                const progress = Math.max(0, Math.min((time - startTime) / 200, 1));
                const eased = 1 - Math.pow(1 - progress, 3);
                display({
                    boundaryPoints: interpolate(start.boundaryPoints, target.boundaryPoints, eased),
                    marginPosPoints: interpolate(start.marginPosPoints, target.marginPosPoints, eased),
                    marginNegPoints: interpolate(start.marginNegPoints, target.marginNegPoints, eased),
                });
                if (progress < 1) frame = requestAnimationFrame(animate);
                else setIsAnimating(false);
            };
            setIsAnimating(true);
            frame = requestAnimationFrame(animate);
        } catch (error) {
            console.warn('Failed to compute decision boundaries:', error);
            display(emptyGeometry());
            setIsAnimating(false);
        }
        return () => { if (frame !== undefined) cancelAnimationFrame(frame); };
    }, [algorithm, bias, weightsKey]);

    return { ...geometry, isAnimating };
}
