import React from 'react';
import type { HoveredPoint } from '../types/ui';
import { getAlgorithmLabels } from '../utils/algorithmLabels';

interface PointTooltipProps {
    algorithm: string;
    point: HoveredPoint;
    plotWidth: number;
}

const PointTooltip: React.FC<PointTooltipProps> = ({ algorithm, point, plotWidth }) => {
    const { class0, class1, f1Name, f2Name, isRegression } = getAlgorithmLabels(algorithm);
    const classNameText = point.label === 0 ? class0 : class1;
    const width = Math.min(152, plotWidth);
    const left = Math.max(0, Math.min(point.x - width / 2, plotWidth - width));

    return (
        <div
            role="tooltip"
            className="absolute z-10 bg-gray-900/90 text-white text-xs rounded shadow-lg pointer-events-none transform -translate-y-[calc(100%+10px)]"
            style={{
                left,
                top: point.y,
                padding: '6px 10px',
                width,
            }}
        >
            {!isRegression && (
                <div className="font-semibold border-b border-gray-600 pb-1 mb-1">
                    Class: {classNameText}
                </div>
            )}
            <div className="flex justify-between gap-3">
                <span className="text-gray-300">{f1Name}</span>
                <span className="font-mono">{point.dataX.toFixed(3)}</span>
            </div>
            <div className="flex justify-between gap-3">
                <span className="text-gray-300">{f2Name}</span>
                <span className="font-mono">{point.dataY.toFixed(3)}</span>
            </div>
            {/* Tooltip triangle pointer */}
            <div className="absolute bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900/90" style={{ left: point.x - left }} />
        </div>
    );
};

export default PointTooltip;
