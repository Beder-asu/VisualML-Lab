/**
 * BaseLayout.test.tsx — Unit tests for BaseLayout component
 * 
 * Tests concept panel visibility, code panel visibility, slot rendering,
 * grid layout classes, error toast, help modal, and keyboard shortcuts integration.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BaseLayout } from '../BaseLayout';

// Mock the hooks
vi.mock('../../hooks/useLayoutHooks', () => ({
    useLayoutKeyboardShortcuts: vi.fn(),
    KeyboardHandlers: {},
}));

// Mock child components
vi.mock('../ConceptPanel', () => ({
    ConceptPanel: ({ algorithm }: { algorithm: string }) => (
        <div data-testid="concept-panel">ConceptPanel: {algorithm}</div>
    ),
}));

vi.mock('../CodePanel', () => ({
    CodePanel: ({ algorithm, isExpanded, onToggle }: any) => (
        <div data-testid="code-panel">
            CodePanel: {algorithm}, Expanded: {isExpanded.toString()}
            <button onClick={onToggle}>Toggle</button>
        </div>
    ),
}));

vi.mock('../HelpModal', () => ({
    HelpModal: ({ isOpen, onClose }: any) => (
        isOpen ? (
            <div data-testid="help-modal">
                HelpModal
                <button onClick={onClose}>Close</button>
            </div>
        ) : null
    ),
}));

vi.mock('../Toast', () => ({
    Toast: ({ message, onDismiss }: any) => (
        <div data-testid="toast">
            Toast: {message}
            <button onClick={onDismiss}>Dismiss</button>
        </div>
    ),
}));

describe('BaseLayout', () => {
    const defaultProps = {
        algorithm: 'linearRegression',
        controlsSlot: <div data-testid="controls-slot">Controls</div>,
        visualizationSlot: <div data-testid="visualization-slot">Visualization</div>,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Concept panel rendering', () => {
        it('should render concept panel by default', () => {
            render(<BaseLayout {...defaultProps} />);
            expect(screen.getByTestId('concept-panel')).toBeInTheDocument();
        });

        it('should render concept panel when showConceptPanel is true', () => {
            render(<BaseLayout {...defaultProps} showConceptPanel={true} />);
            expect(screen.getByTestId('concept-panel')).toBeInTheDocument();
        });

        it('should hide concept panel when showConceptPanel is false', () => {
            render(<BaseLayout {...defaultProps} showConceptPanel={false} />);
            expect(screen.queryByTestId('concept-panel')).not.toBeInTheDocument();
        });

        it('should pass algorithm prop to ConceptPanel', () => {
            render(<BaseLayout {...defaultProps} algorithm="logisticRegression" />);
            expect(screen.getByText(/ConceptPanel: logisticRegression/)).toBeInTheDocument();
        });
    });

    describe('Code panel rendering', () => {
        it('should render code panel by default', () => {
            render(<BaseLayout {...defaultProps} />);
            expect(screen.getByTestId('code-panel')).toBeInTheDocument();
        });

        it('should render code panel when showCodePanel is true', () => {
            render(<BaseLayout {...defaultProps} showCodePanel={true} />);
            expect(screen.getByTestId('code-panel')).toBeInTheDocument();
        });

        it('should hide code panel when showCodePanel is false', () => {
            render(<BaseLayout {...defaultProps} showCodePanel={false} />);
            expect(screen.queryByTestId('code-panel')).not.toBeInTheDocument();
        });

        it('should pass algorithm prop to CodePanel', () => {
            render(<BaseLayout {...defaultProps} algorithm="svm" />);
            expect(screen.getByText(/CodePanel: svm/)).toBeInTheDocument();
        });

        it('should pass codePanelExpanded prop to CodePanel', () => {
            render(<BaseLayout {...defaultProps} codePanelExpanded={true} />);
            expect(screen.getByText(/Expanded: true/)).toBeInTheDocument();
        });

        it('should pass onToggleCodePanel to CodePanel', () => {
            const onToggle = vi.fn();
            render(<BaseLayout {...defaultProps} onToggleCodePanel={onToggle} />);

            const toggleButton = screen.getByRole('button', { name: /toggle/i });
            toggleButton.click();

            expect(onToggle).toHaveBeenCalledTimes(1);
        });

        it('should render customFooter instead of code panel when provided', () => {
            const customFooter = <div data-testid="custom-footer">Custom Footer</div>;
            render(<BaseLayout {...defaultProps} customFooter={customFooter} />);

            expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
            expect(screen.queryByTestId('code-panel')).not.toBeInTheDocument();
        });
    });

    describe('Slot rendering', () => {
        it('should render controlsSlot in correct location', () => {
            render(<BaseLayout {...defaultProps} />);

            const controlsArea = screen.getByTestId('controls-slot');
            expect(controlsArea).toBeInTheDocument();
            expect(controlsArea.textContent).toBe('Controls');
        });

        it('should render visualizationSlot in correct location', () => {
            render(<BaseLayout {...defaultProps} />);

            const visualizationArea = screen.getByTestId('visualization-slot');
            expect(visualizationArea).toBeInTheDocument();
            expect(visualizationArea.textContent).toBe('Visualization');
        });

        it('should handle null controlsSlot gracefully', () => {
            render(
                <BaseLayout
                    {...defaultProps}
                    controlsSlot={null}
                />
            );

            expect(screen.queryByTestId('controls-slot')).not.toBeInTheDocument();
            expect(screen.getByTestId('visualization-slot')).toBeInTheDocument();
        });

        it('should handle undefined visualizationSlot with placeholder', () => {
            render(
                <BaseLayout
                    {...defaultProps}
                    visualizationSlot={undefined}
                />
            );

            expect(screen.getByText(/visualization not available/i)).toBeInTheDocument();
        });

        it('should render complex slot content', () => {
            const complexControls = (
                <div>
                    <button>Play</button>
                    <button>Pause</button>
                    <input type="range" />
                </div>
            );

            render(
                <BaseLayout
                    {...defaultProps}
                    controlsSlot={complexControls}
                />
            );

            expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
            expect(screen.getByRole('slider')).toBeInTheDocument();
        });
    });

    describe('Grid layout classes', () => {
        it('should apply default grid layout classes', () => {
            const { container } = render(<BaseLayout {...defaultProps} />);

            const gridElement = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
            expect(gridElement).toBeInTheDocument();
        });

        it('should apply full-width grid layout classes', () => {
            const { container } = render(
                <BaseLayout {...defaultProps} gridLayout="full-width" />
            );

            const gridElement = container.querySelector('.grid.grid-cols-1');
            expect(gridElement).toBeInTheDocument();
        });

        it('should apply side-by-side grid layout classes', () => {
            const { container } = render(
                <BaseLayout {...defaultProps} gridLayout="side-by-side" />
            );

            const gridElement = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
            expect(gridElement).toBeInTheDocument();
        });

        it('should apply custom grid classes when gridLayout is custom', () => {
            const customClasses = 'grid grid-cols-4 gap-8';
            const { container } = render(
                <BaseLayout
                    {...defaultProps}
                    gridLayout="custom"
                    customGridClasses={customClasses}
                />
            );

            const gridElement = container.querySelector('.grid.grid-cols-4.gap-8');
            expect(gridElement).toBeInTheDocument();
        });

        it('should fall back to default when custom layout has no customGridClasses', () => {
            const { container } = render(
                <BaseLayout {...defaultProps} gridLayout="custom" />
            );

            // Should fall back to default grid
            const gridElement = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
            expect(gridElement).toBeInTheDocument();
        });
    });

    describe('Error toast rendering', () => {
        it('should not render toast when no error', () => {
            render(<BaseLayout {...defaultProps} />);
            expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
        });

        it('should render toast when error is provided', () => {
            const onClearError = vi.fn();
            render(
                <BaseLayout
                    {...defaultProps}
                    error="Training failed"
                    onClearError={onClearError}
                />
            );

            expect(screen.getByTestId('toast')).toBeInTheDocument();
            expect(screen.getByText(/Toast: Training failed/)).toBeInTheDocument();
        });

        it('should call onClearError when toast is dismissed', () => {
            const onClearError = vi.fn();
            render(
                <BaseLayout
                    {...defaultProps}
                    error="Training failed"
                    onClearError={onClearError}
                />
            );

            const dismissButton = screen.getByRole('button', { name: /dismiss/i });
            dismissButton.click();

            expect(onClearError).toHaveBeenCalledTimes(1);
        });

        it('should not render toast when error is provided but onClearError is missing', () => {
            render(
                <BaseLayout
                    {...defaultProps}
                    error="Training failed"
                />
            );

            expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
        });
    });

    describe('Help modal rendering', () => {
        it('should not render help modal when helpModalOpen is false', () => {
            const onToggleHelp = vi.fn();
            render(
                <BaseLayout
                    {...defaultProps}
                    helpModalOpen={false}
                    onToggleHelp={onToggleHelp}
                />
            );

            expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
        });

        it('should render help modal when helpModalOpen is true', () => {
            const onToggleHelp = vi.fn();
            render(
                <BaseLayout
                    {...defaultProps}
                    helpModalOpen={true}
                    onToggleHelp={onToggleHelp}
                />
            );

            expect(screen.getByTestId('help-modal')).toBeInTheDocument();
        });

        it('should call onToggleHelp when help modal is closed', () => {
            const onToggleHelp = vi.fn();
            render(
                <BaseLayout
                    {...defaultProps}
                    helpModalOpen={true}
                    onToggleHelp={onToggleHelp}
                />
            );

            const closeButton = screen.getByRole('button', { name: /close/i });
            closeButton.click();

            expect(onToggleHelp).toHaveBeenCalledTimes(1);
        });

        it('should not render help modal when onToggleHelp is missing', () => {
            render(
                <BaseLayout
                    {...defaultProps}
                    helpModalOpen={true}
                />
            );

            expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
        });
    });

    describe('Keyboard shortcuts integration', () => {
        it('should call useLayoutKeyboardShortcuts with provided handlers', async () => {
            const { useLayoutKeyboardShortcuts } = await import('../../hooks/useLayoutHooks');

            const keyboardHandlers = {
                onPlayPause: vi.fn(),
                onStep: vi.fn(),
                onReset: vi.fn(),
            };

            render(
                <BaseLayout
                    {...defaultProps}
                    keyboardHandlers={keyboardHandlers}
                />
            );

            expect(useLayoutKeyboardShortcuts).toHaveBeenCalledWith(keyboardHandlers, true);
        });

        it('should call useLayoutKeyboardShortcuts with empty object when no handlers provided', async () => {
            const { useLayoutKeyboardShortcuts } = await import('../../hooks/useLayoutHooks');

            render(<BaseLayout {...defaultProps} />);

            expect(useLayoutKeyboardShortcuts).toHaveBeenCalledWith({}, true);
        });

        it('should enable keyboard shortcuts by default', async () => {
            const { useLayoutKeyboardShortcuts } = await import('../../hooks/useLayoutHooks');

            render(<BaseLayout {...defaultProps} />);

            expect(useLayoutKeyboardShortcuts).toHaveBeenCalledWith(expect.anything(), true);
        });
    });

    describe('Accessibility features', () => {
        it('should have ARIA label on concept panel', () => {
            render(<BaseLayout {...defaultProps} />);

            const conceptPanel = screen.getByLabelText(/lesson concept and explanation/i);
            expect(conceptPanel).toBeInTheDocument();
        });

        it('should have ARIA label on main content area', () => {
            render(<BaseLayout {...defaultProps} />);

            const mainArea = screen.getByLabelText(/interactive visualization and controls/i);
            expect(mainArea).toBeInTheDocument();
        });

        it('should have ARIA label on controls area', () => {
            render(<BaseLayout {...defaultProps} />);

            const controlsArea = screen.getByLabelText(/algorithm controls/i);
            expect(controlsArea).toBeInTheDocument();
        });

        it('should have ARIA label on visualization area', () => {
            render(<BaseLayout {...defaultProps} />);

            const visualizationArea = screen.getByLabelText(/algorithm visualization/i);
            expect(visualizationArea).toBeInTheDocument();
        });

        it('should have ARIA live region on visualization area', () => {
            render(<BaseLayout {...defaultProps} />);

            const visualizationArea = screen.getByLabelText(/algorithm visualization/i);
            expect(visualizationArea).toHaveAttribute('aria-live', 'polite');
        });

        it('should have proper role attributes', () => {
            render(<BaseLayout {...defaultProps} />);

            expect(screen.getByRole('complementary')).toBeInTheDocument(); // concept panel
            expect(screen.getByRole('main')).toBeInTheDocument(); // main content
            expect(screen.getAllByRole('region')).toHaveLength(3); // controls, visualization, code panel
        });
    });

    describe('Responsive behavior', () => {
        it('should apply responsive classes for mobile and desktop', () => {
            const { container } = render(<BaseLayout {...defaultProps} />);

            // Check for responsive grid classes
            const gridElement = container.querySelector('.grid-cols-1.lg\\:grid-cols-3');
            expect(gridElement).toBeInTheDocument();
        });

        it('should adjust concept panel span based on visibility', () => {
            const { container, rerender } = render(
                <BaseLayout {...defaultProps} showConceptPanel={true} />
            );

            let conceptPanel = container.querySelector('aside');
            expect(conceptPanel?.className).toContain('lg:col-span-1');

            rerender(<BaseLayout {...defaultProps} showConceptPanel={false} />);

            conceptPanel = container.querySelector('aside');
            expect(conceptPanel).not.toBeInTheDocument();
        });

        it('should adjust main content span based on concept panel visibility', () => {
            const { container, rerender } = render(
                <BaseLayout {...defaultProps} showConceptPanel={true} />
            );

            let mainContent = container.querySelector('main');
            expect(mainContent?.className).toContain('lg:col-span-2');

            rerender(<BaseLayout {...defaultProps} showConceptPanel={false} />);

            mainContent = container.querySelector('main');
            expect(mainContent?.className).not.toContain('lg:col-span-2');
        });
    });
});
