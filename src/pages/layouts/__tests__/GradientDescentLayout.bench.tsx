/**
 * Performance benchmark for GradientDescentLayout
 * 
 * Tests rendering performance with React.memo and useMemo optimizations.
 * Run with: npm run bench
 */

import { bench, describe } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GradientDescentLayout } from '../GradientDescentLayout';

// Mock the training controller hook to avoid worker overhead
vi.mock('../../../hooks/useTrainingController', () => ({
    useTrainingController: () => [
        {
            isPlaying: false,
            isPaused: false,
            isConverged: false,
            engineState: null,
            lossHistory: [],
            error: null,
        },
        {
            play: () => { },
            pause: () => { },
            step: () => { },
            reset: () => { },
            updateParams: () => { },
            changeDataset: () => { },
            clearError: () => { },
        },
    ],
}));

// Mock other hooks
vi.mock('../../../hooks/useLayoutHooks', () => ({
    useLayoutKeyboardShortcuts: vi.fn(),
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

// Mock child components to isolate layout rendering
vi.mock('../../../components/ConceptPanel', () => ({
    ConceptPanel: () => <div>ConceptPanel</div>,
}));

vi.mock('../../../components/CodePanel', () => ({
    CodePanel: () => <div>CodePanel</div>,
}));

vi.mock('../../../components/ParameterControls', () => ({
    ParameterControls: () => <div>ParameterControls</div>,
}));

vi.mock('../../../components/StatusIndicator', () => ({
    StatusIndicator: () => <div>StatusIndicator</div>,
}));

vi.mock('../../../components/PlaybackControls', () => ({
    PlaybackControls: () => <div>PlaybackControls</div>,
}));

vi.mock('../../../components/Canvas2D', () => ({
    default: () => <div>Canvas2D</div>,
}));

vi.mock('../../../components/LossCurve', () => ({
    default: () => <div>LossCurve</div>,
}));

vi.mock('../../../components/HelpModal', () => ({
    HelpModal: () => null,
}));

vi.mock('../../../components/Toast', () => ({
    Toast: () => null,
}));

describe('GradientDescentLayout rendering performance', () => {
    bench('Initial render - linearRegression', () => {
        const { unmount } = render(
            <MemoryRouter>
                <GradientDescentLayout algorithm="linearRegression" />
            </MemoryRouter>
        );
        unmount();
    });

    bench('Initial render - logisticRegression', () => {
        const { unmount } = render(
            <MemoryRouter>
                <GradientDescentLayout algorithm="logisticRegression" />
            </MemoryRouter>
        );
        unmount();
    });

    bench('Initial render - svm', () => {
        const { unmount } = render(
            <MemoryRouter>
                <GradientDescentLayout algorithm="svm" />
            </MemoryRouter>
        );
        unmount();
    });

    bench('Re-render with same props', () => {
        const { rerender, unmount } = render(
            <MemoryRouter>
                <GradientDescentLayout algorithm="linearRegression" />
            </MemoryRouter>
        );

        // Re-render with same props - should be fast due to React.memo
        rerender(
            <MemoryRouter>
                <GradientDescentLayout algorithm="linearRegression" />
            </MemoryRouter>
        );

        unmount();
    });
});
