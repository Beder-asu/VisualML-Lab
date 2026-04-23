import React from 'react';
import { useElementSize } from '../hooks/useElementSize';

interface ResponsiveWrapperProps {
    children: (size: { width: number; height: number }) => React.ReactNode;
    className?: string;
    minHeight?: number;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({ 
    children, 
    className = 'w-full h-full relative',
    minHeight = 350
}) => {
    const [ref, { width, height }] = useElementSize<HTMLDivElement>();
    
    return (
        <div ref={ref} className={className} style={{ minHeight }}>
            {width > 0 && height > 0 ? (
                children({ width, height })
            ) : null}
        </div>
    );
};
