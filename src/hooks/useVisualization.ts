import { useState, useEffect, useRef } from 'react';
import type { State, BoundaryResult } from '../types/engine';
import { getDecisionBoundary } from '../../engine/boundary';

export interface BoundaryPoint {
    x: number;
    y: number;
}

export interface UseVisualizationResult {
    boundaryPoints: BoundaryPoint[];
    marginPosPoints: BoundaryPoint[];
    marginNegPoints: BoundaryPoint[];
    isAnimating: boolean;
}

/**
 * Custom hook for managing decision boundary and margin visualization with smooth transitions
 */
export function useVisualization(state: State | null): UseVisualizationResult {
    const [boundaryPoints, setBoundaryPoints] = useState<BoundaryPoint[]>([]);
    const [marginPosPoints, setMarginPosPoints] = useState<BoundaryPoint[]>([]);
    const [marginNegPoints, setMarginNegPoints] = useState<BoundaryPoint[]>([]);

    const [isAnimating, setIsAnimating] = useState(false);
    const animationFrameRef = useRef<number | undefined>(undefined);

    const prevBoundaryRef = useRef<BoundaryPoint[]>([]);
    const prevMarginPosRef = useRef<BoundaryPoint[]>([]);
    const prevMarginNegRef = useRef<BoundaryPoint[]>([]);

    const prevWeightsRef = useRef<number[] | null>(null);
    const prevBiasRef = useRef<number | null>(null);

    useEffect(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        if (!state) {
            setBoundaryPoints([]);
            setMarginPosPoints([]);
            setMarginNegPoints([]);
            return;
        }

        // Skip recompute if weights and bias haven't changed (shallow comparison)
        const currentWeights = state.weights;
        const currentBias = state.bias;
        const weightsUnchanged =
            prevWeightsRef.current !== null &&
            Array.isArray(currentWeights) &&
            currentWeights.length === prevWeightsRef.current.length &&
            currentWeights.every((w, i) => w === prevWeightsRef.current![i]);
        const biasUnchanged = prevBiasRef.current !== null && currentBias === prevBiasRef.current;

        if (weightsUnchanged && biasUnchanged) {
            return;
        }

        try {
            // Get new boundary points from ML Engine
            const result: BoundaryResult = getDecisionBoundary(state, 100);

            const newBoundary = result?.boundary || [];
            const newMarginPos = result?.marginPos || [];
            const newMarginNeg = result?.marginNeg || [];

            // Update memoization refs before animating
            prevWeightsRef.current = Array.isArray(currentWeights) ? [...currentWeights] : null;
            prevBiasRef.current = currentBias ?? null;

            animateTransitions(newBoundary, newMarginPos, newMarginNeg);
        } catch (error) {
            console.warn('Failed to compute decision boundaries:', error);
            setBoundaryPoints([]);
            setMarginPosPoints([]);
            setMarginNegPoints([]);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [state]);

    const animateTransitions = (
        targetBoundary: BoundaryPoint[],
        targetMarginPos: BoundaryPoint[],
        targetMarginNeg: BoundaryPoint[]
    ) => {
        const startBoundary = prevBoundaryRef.current.length > 0 ? prevBoundaryRef.current : targetBoundary;
        const startMarginPos = prevMarginPosRef.current.length > 0 ? prevMarginPosRef.current : targetMarginPos;
        const startMarginNeg = prevMarginNegRef.current.length > 0 ? prevMarginNegRef.current : targetMarginNeg;

        const startTime = performance.now();
        const duration = 200; // 200ms smooth transition

        setIsAnimating(true);

        const interpolate = (start: BoundaryPoint[], target: BoundaryPoint[], limit: number) => {
            if (target.length === 0) return [];
            return target.map((t, i) => {
                const s = start[i] || t;
                return {
                    x: s.x + (t.x - s.x) * limit,
                    y: s.y + (t.y - s.y) * limit,
                };
            });
        };

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);

            setBoundaryPoints(interpolate(startBoundary, targetBoundary, eased));
            setMarginPosPoints(interpolate(startMarginPos, targetMarginPos, eased));
            setMarginNegPoints(interpolate(startMarginNeg, targetMarginNeg, eased));

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
                prevBoundaryRef.current = targetBoundary;
                prevMarginPosRef.current = targetMarginPos;
                prevMarginNegRef.current = targetMarginNeg;
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    };

    return {
        boundaryPoints,
        marginPosPoints,
        marginNegPoints,
        isAnimating,
    };
}
