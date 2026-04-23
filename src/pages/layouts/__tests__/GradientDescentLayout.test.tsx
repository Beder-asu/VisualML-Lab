/**
 * Unit tests for GradientDescentLayout component
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradientDescentLayout } from '../GradientDescentLayout';
import * as useTrainingControllerModule from '../../../hooks/useTrainingController';
import * as layoutUtilsModule from '../../../utils/layoutUtils';

// Mock dependencies
vi.mock('../../../hooks/useTrainingController');
vi.mock('../../../hooks/useLayoutHooks', () => ({
    useLayoutError: () => ({
        error: null,
        setError: vi.fn(),
        clearError: vi.fn(),
    }),
    useCodePanelState: () => ({
        isExpanded: false,
        toggle: vi.fn(),
        expand: vi.fn(),
        collapse: vi.fn(),
    }),
}));
vi.mock('../../../utils/layoutUtils');
vi.mock('../../../components/BaseLayout', () => ({
    BaseLayout: ({ algorithm, controlsSlot, visualizationSlot }: any) => (
        <div data-testid="base-layout">
            <div data-testid="algorithm">{algorithm}</div>
            <div data-testid="controls-slot">{controlsSlot}</div>
            <div data-testid="visualization-slot">{visualizationSlot}</div>
        </div>
    ),
}));
vi.mock('../../../components/ParameterControls', () => ({
    ParameterControls: ({ algorithm, params }: any) => (
        <div data-testid="parameter-controls">
            {algorithm} - lr: {params.lr}
        </div>
    ),
}));
vi.mock('../../../components/StatusIndicator', () => ({
    StatusIndicator: () => <div data-testid="status-indicator">Status</div>,
}));
vi.mock('../../../components/PlaybackControls', () => ({
    PlaybackControls: () => <div data-testid="playback-controls">Playback</div>,
}));
vi.mock('../../../components/Canvas2D', () => ({
    default: () => <div data-testid="canvas-2d">Canvas</div>,
}));
vi.mock('../../../components/LossCurve', () => ({
    default: () => <div data-testid="loss-curve">Loss Curve</div>,
}));

describe('GradientDescentLayout', () => {
    const mockTrainingState = {
        engineState: { iteration: 5 },
        lossHistory: [1.0, 0.8, 0.6],
        isPlaying: false,
        isPaused: true,
        isConverged: false,
        error: null,
    };

    const mockControls = {
        play: vi.fn(),
        pause: vi.fn(),
        step: vi.fn(),
        reset: vi.fn(),
        updateParams: vi.fn(),
        changeDataset: vi.fn(),
        clearError: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(useTrainingControllerModule, 'useTrainingController').mockReturnValue([
            mockTrainingState,
            mockControls,
        ] as any);
        vi.spyOn(layoutUtilsModule, 'getDefaultDataset').mockReturnValue('iris-2d');
    });

    it('initializes training controller correctly', () => {
        render(<GradientDescentLayout algorithm="linearRegression" />);

        expect(useTrainingControllerModule.useTrainingController).toHaveBeenCalledWith(
            'linearRegression',
            'iris-2d',
            expect.objectContaining({ lr: 0.01, nIter: 100, C: 1.0 }),
            100
        );
    });

    it('renders ParameterControls with correct props', () => {
        render(<GradientDescentLayout algorithm="logisticRegression" />);

        const paramControls = screen.getByTestId('parameter-controls');
        expect(paramControls).toBeInTheDocument();
        expect(paramControls).toHaveTextContent('logisticRegression');
        expect(paramControls).toHaveTextContent('lr: 0.01');
    });

    it('renders Canvas2D and LossCurve', () => {
        render(<GradientDescentLayout algorithm="svm" />);

        expect(screen.getByTestId('canvas-2d')).toBeInTheDocument();
        expect(screen.getByTestId('loss-curve')).toBeInTheDocument();
    });

    it('maps algorithm to correct default dataset', () => {
        render(<GradientDescentLayout algorithm="linearRegression" />);

        expect(layoutUtilsModule.getDefaultDataset).toHaveBeenCalledWith('linearRegression');
    });

    it('renders BaseLayout with correct algorithm prop', () => {
        render(<GradientDescentLayout algorithm="svm" />);

        const algorithmElement = screen.getByTestId('algorithm');
        expect(algorithmElement).toHaveTextContent('svm');
    });

    it('renders StatusIndicator and PlaybackControls', () => {
        render(<GradientDescentLayout algorithm="linearRegression" />);

        expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
        expect(screen.getByTestId('playback-controls')).toBeInTheDocument();
    });
});
