/**
 * Unit tests for DecisionTreeLayout component
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 10.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DecisionTreeLayout } from '../DecisionTreeLayout';
import * as useTreeControllerModule from '../../../hooks/useTreeController';
import * as layoutUtilsModule from '../../../utils/layoutUtils';

// Mock dependencies
vi.mock('../../../hooks/useTreeController');
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
vi.mock('../../../components/TreeParameterControls', () => ({
    TreeParameterControls: ({ params }: any) => (
        <div data-testid="tree-parameter-controls">
            maxDepth: {params.maxDepth}, criterion: {params.criterion}
        </div>
    ),
}));
vi.mock('../../../components/StatusIndicator', () => ({
    StatusIndicator: () => <div data-testid="status-indicator">Status</div>,
}));
vi.mock('../../../components/PlaybackControls', () => ({
    PlaybackControls: () => <div data-testid="playback-controls">Playback</div>,
}));
vi.mock('../../../components/TreeDiagram', () => ({
    default: () => <div data-testid="tree-diagram">Tree Diagram</div>,
}));
vi.mock('../../../components/DecisionRegions', () => ({
    default: () => <div data-testid="decision-regions">Decision Regions</div>,
}));

describe('DecisionTreeLayout', () => {
    const mockTreeState = {
        treeState: {
            root: {
                id: '0',
                depth: 0,
                feature: null,
                threshold: null,
                prediction: 0,
                samples: 100,
                impurity: 0.5,
                left: null,
                right: null,
            },
            currentDepth: 0,
            maxDepth: 3,
            nodeCount: 1,
            leafCount: 1,
            dataset: { X: [], y: [] },
        },
        isBuilding: false,
        isPaused: false,
        isComplete: false,
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
        vi.spyOn(useTreeControllerModule, 'useTreeController').mockReturnValue([
            mockTreeState,
            mockControls,
        ] as any);
        vi.spyOn(layoutUtilsModule, 'getDefaultDataset').mockReturnValue('iris-2d');
    });

    it('initializes tree controller correctly', () => {
        render(<DecisionTreeLayout algorithm="decisionTree" />);

        expect(useTreeControllerModule.useTreeController).toHaveBeenCalledWith(
            'decisionTree',
            'iris-2d',
            expect.objectContaining({ maxDepth: 3, criterion: 'gini', minSamplesSplit: 2 }),
            500
        );
    });

    it('renders TreeParameterControls with correct props', () => {
        render(<DecisionTreeLayout algorithm="decisionTree" />);

        const paramControls = screen.getByTestId('tree-parameter-controls');
        expect(paramControls).toBeInTheDocument();
        expect(paramControls).toHaveTextContent('maxDepth: 3');
        expect(paramControls).toHaveTextContent('criterion: gini');
    });

    it('renders TreeDiagram and DecisionRegions', () => {
        render(<DecisionTreeLayout algorithm="decisionTree" />);

        expect(screen.getByTestId('tree-diagram')).toBeInTheDocument();
        expect(screen.getByTestId('decision-regions')).toBeInTheDocument();
    });

    it('maps algorithm to correct default dataset', () => {
        render(<DecisionTreeLayout algorithm="decisionTree" />);

        expect(layoutUtilsModule.getDefaultDataset).toHaveBeenCalledWith('decisionTree');
    });

    it('renders BaseLayout with correct algorithm prop', () => {
        render(<DecisionTreeLayout algorithm="decisionTree" />);

        const algorithmElement = screen.getByTestId('algorithm');
        expect(algorithmElement).toHaveTextContent('decisionTree');
    });

    it('renders StatusIndicator and PlaybackControls', () => {
        render(<DecisionTreeLayout algorithm="decisionTree" />);

        expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
        expect(screen.getByTestId('playback-controls')).toBeInTheDocument();
    });
});
