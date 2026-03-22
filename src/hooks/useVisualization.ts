import { useState, useEffect, useRef } from 'react';
// @ts-ignore - engine is JavaScript module without type definitions
import * as boundaryModule from '../../engine/boundary';

const { getDecisionBoundary } = boundaryModule;

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
export function useVisualization(state: any): UseVisualizationResult {
    const [boundaryPoints, setBoundaryPoints] = useState<BoundaryPoint[]>([]);
    const [marginPosPoints, setMarginPosPoints] = useState<BoundaryPoint[]>([]);
    const [marginNegPoints, setMarginNegPoints] = useState<BoundaryPoint[]>([]);
    
    const [isAnimating, setIsAnimating] = useState(false);
    const animationFrameRef = useRef<number | undefined>(undefined);
    
    const prevBoundaryRef = useRef<BoundaryPoint[]>([]);
    const prevMarginPosRef = useRef<BoundaryPoint[]>([]);
    const prevMarginNegRef = useRef<BoundaryPoint[]>([]);

    useEffect(() => {
        if (!state) {
            setBoundaryPoints([]);
            setMarginPosPoints([]);
            setMarginNegPoints([]);
            return;
        }

        try {
            // Get new boundary points from ML Engine
            const result = getDecisionBoundary(state, 100);
            
            // Handle backwards compatibility for pure arrays or object returns
            const newBoundary = Array.isArray(result) ? result : (result?.boundary || []);
            const newMarginPos = result?.marginPos || [];
            const newMarginNeg = result?.marginNeg || [];

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
