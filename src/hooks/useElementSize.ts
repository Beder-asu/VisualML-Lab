import { useState, useEffect, useRef } from 'react';

interface ElementSize {
    width: number;
    height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
    (node: T | null) => void,
    ElementSize
] {
    // Mutable values like 'ref.current' aren't valid dependencies
    // because mutating them doesn't re-render the component.
    // Instead, we use a state as a ref to be reactive.
    const [ref, setRef] = useState<T | null>(null);
    const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
    
    // Prevent too many state updates
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!ref) {
            return;
        }

        const handleSize = () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(() => {
                const { clientWidth, clientHeight } = ref;
                setSize({ width: clientWidth, height: clientHeight });
            });
        };

        // Initialize size
        handleSize();

        let resizeObserver: ResizeObserver | null = null;

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => handleSize());
            resizeObserver.observe(ref);
        } else {
            // Fallback to window resize
            window.addEventListener('resize', handleSize);
        }

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
            } else {
                window.removeEventListener('resize', handleSize);
            }
        };
    }, [ref]);

    return [setRef, size];
}
