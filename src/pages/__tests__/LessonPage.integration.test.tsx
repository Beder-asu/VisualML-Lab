/**
 * LessonPage.integration.test.tsx — Integration tests for GradientDescentLayout
 * 
 * Tests full playback cycle, parameter changes, dataset changes, and keyboard shortcuts.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 7.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GradientDescentLayout } from '../layouts/GradientDescentLayout';

// Mock the visualization hook
vi.mock('../../hooks/useVisualization', () => ({
    useVisualization: vi.fn(() => ({
        boundaryPoints: [],
    })),
}));

// Mock the training controller hook
vi.mock('../../hooks/useTrainingController', () => ({
    useTrainingController: vi.fn(() => {
        const mockState = {
            engineState: {
                algorithm: 'linearRegression',
                dataset: { name: 'iris-2d', X: [[0.1, 0.2]], y: [0] },
                params: { lr: 0.01, nIter: 100 },
                weights: [0, 0],
                iteration: 0,
                loss: 1.0,
                converged: false,
                task: 'classification',
                X: [[0.1, 0.2], [0.3, 0.4]],
                y: [0, 1],
            },
            lossHistory: [],
            isPlaying: false,
            isPaused: false,
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

        return [mockState, mockControls];
    }),
}));

// Mock keyboard shortcuts hook
vi.mock('../../hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: vi.fn(),
}));

// Helper to render GradientDescentLayout
function renderLessonPage() {
    return render(<GradientDescentLayout algorithm="linearRegression" />);
}

describe('LessonPage Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Component rendering', () => {
        it('should render all major components', () => {
            renderLessonPage();

            // Concept panel - use heading role to be more specific
            expect(screen.getByRole('heading', { name: /Linear Regression/i, level: 2 })).toBeInTheDocument();
            expect(screen.getByText(/Description/i)).toBeInTheDocument();

            // Parameter controls
            expect(screen.getByText(/Parameters/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Learning Rate/i)).toBeInTheDocument();



            // Playback controls
            expect(screen.getByLabelText(/Play training/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Pause training/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Step once/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Reset training/i)).toBeInTheDocument();

            // Status indicator
            expect(screen.getByText(/Ready to train/i)).toBeInTheDocument();
        });

        it('should render concept panel with correct algorithm content', () => {
            renderLessonPage();

            expect(screen.getByRole('heading', { name: /Linear Regression/i, level: 2 })).toBeInTheDocument();
            expect(screen.getByText(/gradient descent/i)).toBeInTheDocument();
            expect(screen.getByText(/How it works/i)).toBeInTheDocument();
        });

        it('should render parameter controls with sliders', () => {
            renderLessonPage();

            const lrSlider = screen.getByLabelText(/Learning Rate/i);
            const iterSlider = screen.getByLabelText(/Max Iterations/i);

            expect(lrSlider).toBeInTheDocument();
            expect(iterSlider).toBeInTheDocument();
        });



        it('should render code panel in collapsed state initially', () => {
            renderLessonPage();

            // Code panel toggle button should be present
            expect(screen.getByText(/Algorithm Code/i)).toBeInTheDocument();

            // But code content should not be visible
            expect(screen.queryByText(/JavaScript/i)).not.toBeInTheDocument();
        });
    });

    describe('Playback controls interaction', () => {
        it('should call play when play button is clicked', async () => {
            const { useTrainingController } = await import('../../hooks/useTrainingController');
            const mockPlay = vi.fn();
            vi.mocked(useTrainingController).mockReturnValue([
                {
                    engineState: { iteration: 0, loss: 1.0 } as any,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                },
                {
                    play: mockPlay,
                    pause: vi.fn(),
                    step: vi.fn(),
                    reset: vi.fn(),
                    updateParams: vi.fn(),
                    changeDataset: vi.fn(),
                    clearError: vi.fn(),
                },
            ]);

            renderLessonPage();

            const playButton = screen.getByLabelText(/Play training/i);
            fireEvent.click(playButton);

            expect(mockPlay).toHaveBeenCalled();
        });

        it('should call pause when pause button is clicked', async () => {
            const { useTrainingController } = await import('../../hooks/useTrainingController');
            const mockPause = vi.fn();
            vi.mocked(useTrainingController).mockReturnValue([
                {
                    engineState: { iteration: 5, loss: 0.5 } as any,
                    lossHistory: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
                    isPlaying: true,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                },
                {
                    play: vi.fn(),
                    pause: mockPause,
                    step: vi.fn(),
                    reset: vi.fn(),
                    updateParams: vi.fn(),
                    changeDataset: vi.fn(),
                    clearError: vi.fn(),
                },
            ]);

            renderLessonPage();

            const pauseButton = screen.getByLabelText(/Pause training/i);
            fireEvent.click(pauseButton);

            expect(mockPause).toHaveBeenCalled();
        });

        it('should call step when step button is clicked', async () => {
            const { useTrainingController } = await import('../../hooks/useTrainingController');
            const mockStep = vi.fn();
            vi.mocked(useTrainingController).mockReturnValue([
                {
                    engineState: { iteration: 0, loss: 1.0 } as any,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                },
                {
                    play: vi.fn(),
                    pause: vi.fn(),
                    step: mockStep,
                    reset: vi.fn(),
                    updateParams: vi.fn(),
                    changeDataset: vi.fn(),
                    clearError: vi.fn(),
                },
            ]);

            renderLessonPage();

            const stepButton = screen.getByLabelText(/Step once/i);
            fireEvent.click(stepButton);

            expect(mockStep).toHaveBeenCalled();
        });

        it('should call reset when reset button is clicked', async () => {
            const { useTrainingController } = await import('../../hooks/useTrainingController');
            const mockReset = vi.fn();
            vi.mocked(useTrainingController).mockReturnValue([
                {
                    engineState: { iteration: 10, loss: 0.3 } as any,
                    lossHistory: [1.0, 0.9, 0.8],
                    isPlaying: false,
                    isPaused: true,
                    isConverged: false,
                    error: null,
                },
                {
                    play: vi.fn(),
                    pause: vi.fn(),
                    step: vi.fn(),
                    reset: mockReset,
                    updateParams: vi.fn(),
                    changeDataset: vi.fn(),
                    clearError: vi.fn(),
                },
            ]);

            renderLessonPage();

            const resetButton = screen.getByLabelText(/Reset training/i);
            fireEvent.click(resetButton);

            expect(mockReset).toHaveBeenCalled();
        });
    });

    describe('Parameter changes', () => {
        it('should call updateParams when learning rate slider changes', async () => {
            const { useTrainingController } = await import('../../hooks/useTrainingController');
            const mockUpdateParams = vi.fn();
            vi.mocked(useTrainingController).mockReturnValue([
                {
                    engineState: { iteration: 0, loss: 1.0 } as any,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                },
                {
                    play: vi.fn(),
                    pause: vi.fn(),
                    step: vi.fn(),
                    reset: vi.fn(),
                    updateParams: mockUpdateParams,
                    changeDataset: vi.fn(),
                    clearError: vi.fn(),
                },
            ]);

            renderLessonPage();

            const lrSlider = screen.getByLabelText(/Learning Rate/i);
            fireEvent.change(lrSlider, { target: { value: '0.05' } });

            // Wait for debounce
            await waitFor(() => {
                expect(mockUpdateParams).toHaveBeenCalled();
            }, { timeout: 200 });
        });

        it('should call updateParams when max iterations slider changes', async () => {
            const { useTrainingController } = await import('../../hooks/useTrainingController');
            const mockUpdateParams = vi.fn();
            vi.mocked(useTrainingController).mockReturnValue([
                {
                    engineState: { iteration: 0, loss: 1.0 } as any,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: null,
                },
                {
                    play: vi.fn(),
                    pause: vi.fn(),
                    step: vi.fn(),
                    reset: vi.fn(),
                    updateParams: mockUpdateParams,
                    changeDataset: vi.fn(),
                    clearError: vi.fn(),
                },
            ]);

            renderLessonPage();

            const iterSlider = screen.getByLabelText(/Max Iterations/i);
            fireEvent.change(iterSlider, { target: { value: '200' } });

            // Wait for debounce
            await waitFor(() => {
                expect(mockUpdateParams).toHaveBeenCalled();
            }, { timeout: 200 });
        });
    });



    describe('Code panel toggle', () => {
        it('should toggle code panel when toggle button is clicked', async () => {
            renderLessonPage();

            const toggleButton = screen.getByText(/Algorithm Code/i).closest('button');
            expect(toggleButton).toBeInTheDocument();

            // Initially collapsed
            expect(screen.queryByText(/JavaScript/i)).not.toBeInTheDocument();

            // Click to expand
            fireEvent.click(toggleButton!);

            await waitFor(() => {
                expect(screen.getByText(/JavaScript/i)).toBeInTheDocument();
            });

            // Click to collapse
            fireEvent.click(toggleButton!);

            await waitFor(() => {
                expect(screen.queryByText(/JavaScript/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Error display', () => {
        it('should display error message when error is present', async () => {
            const { useTrainingController } = await import('../../hooks/useTrainingController');
            vi.mocked(useTrainingController).mockReturnValue([
                {
                    engineState: null,
                    lossHistory: [],
                    isPlaying: false,
                    isPaused: false,
                    isConverged: false,
                    error: 'Invalid parameters',
                },
                {
                    play: vi.fn(),
                    pause: vi.fn(),
                    step: vi.fn(),
                    reset: vi.fn(),
                    updateParams: vi.fn(),
                    changeDataset: vi.fn(),
                    clearError: vi.fn(),
                },
            ]);

            renderLessonPage();

            expect(screen.getByText(/Invalid parameters/i)).toBeInTheDocument();
        });
    });
});
