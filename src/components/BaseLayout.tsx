/**
 * BaseLayout.tsx — Base layout component for all algorithm lessons
 * 
 * Provides shared shell for all algorithm layouts with common UI elements,
 * keyboard shortcuts, error handling, and pluggable slots for algorithm-specific content.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5, 10.1, 10.2, 10.3, 10.4, 10.5
 */

import React, { useEffect } from 'react';
import { ConceptPanel } from './ConceptPanel';
import { CodePanel } from './CodePanel';
import { HelpModal } from './HelpModal';
import { Toast } from './Toast';
import { useLayoutKeyboardShortcuts, KeyboardHandlers } from '../hooks/useLayoutHooks';
import { isLessonId, lessonTitles } from '../data/lessons';
import { useLessonProgress } from '../contexts/LessonProgress';

/**
 * Grid layout options for the base layout
 */
type GridLayout = 'default' | 'full-width' | 'side-by-side' | 'custom';

/**
 * Props interface for BaseLayout component
 */
export interface BaseLayoutProps {
    // Required props
    algorithm: string;
    controlsSlot: React.ReactNode;
    visualizationSlot: React.ReactNode;
    guideSlot?: React.ReactNode;

    // Optional overrides
    showConceptPanel?: boolean;
    showCodePanel?: boolean;
    customFooter?: React.ReactNode;
    gridLayout?: GridLayout;
    customGridClasses?: string;

    // Shared state handlers
    error?: string | null;
    onClearError?: () => void;

    // Code panel state
    codePanelExpanded?: boolean;
    onToggleCodePanel?: () => void;

    // Help modal state
    helpModalOpen?: boolean;
    onToggleHelp?: () => void;

    // Keyboard shortcut handlers
    keyboardHandlers?: KeyboardHandlers;
}

/**
 * BaseLayout component
 * 
 * Provides the shared shell for all algorithm layouts, handling common UI elements
 * and interactions while accepting pluggable slots for algorithm-specific content.
 * 
 * Wrapped in React.memo to prevent unnecessary re-renders when props haven't changed.
 * This is especially important since BaseLayout is rendered frequently during training.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */
export const BaseLayout: React.FC<BaseLayoutProps> = React.memo(({
    algorithm,
    controlsSlot,
    visualizationSlot,
    guideSlot,
    showConceptPanel = true,
    showCodePanel = true,
    customFooter,
    gridLayout = 'default',
    customGridClasses,
    error,
    onClearError,
    codePanelExpanded = false,
    onToggleCodePanel,
    helpModalOpen = false,
    onToggleHelp,
    keyboardHandlers = {},
}) => {
    const tracker = useLessonProgress();
    const lessonId = isLessonId(algorithm) ? algorithm : null;
    const visit = tracker?.visit;
    useEffect(() => {
        if (lessonId) visit?.(lessonId);
    }, [lessonId, visit]);
    const complete = lessonId && tracker?.progress.lessons[lessonId] === 'complete';
    // Integrate keyboard shortcuts (Requirements 1.4, 5.1)
    // This hook wraps useKeyboardShortcuts and provides no-op defaults for undefined handlers
    useLayoutKeyboardShortcuts(keyboardHandlers, !helpModalOpen);

    // Determine grid classes based on layout option (Requirements 4.1, 4.5, 8.1, 8.2)
    // Design Decision: Using Tailwind's responsive grid system for mobile-first design
    const getGridClasses = (): string => {
        // Custom layout: use provided classes
        if (gridLayout === 'custom' && customGridClasses) {
            return customGridClasses;
        }

        switch (gridLayout) {
            case 'full-width':
                // Single column, full width - useful for complex visualizations
                return 'grid grid-cols-1 gap-6';
            case 'side-by-side':
                // Equal 1/2 + 1/2 split on desktop, stacked on mobile
                return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
            case 'default':
            default:
                // Default: 1/3 concept + 2/3 main (Requirements 1.1, 8.1, 8.2)
                // This is the standard layout for most algorithm lessons
                return 'grid grid-cols-1 lg:grid-cols-3 gap-6';
        }
    };

    const gridClasses = getGridClasses();
    const hasSidebar = Boolean(controlsSlot) || showConceptPanel;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">{lessonId ? lessonTitles[lessonId] : 'Machine Learning Lesson'}</h1>
                    <div className="flex flex-wrap items-center gap-x-2">
                        {lessonId && tracker && (
                            <button type="button" onClick={() => tracker.setComplete(lessonId, !complete)}
                                className="min-h-11 rounded-md px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
                                {complete ? 'Undo completion' : 'Mark lesson complete'}
                            </button>
                        )}
                        {onToggleHelp && <button type="button" onClick={onToggleHelp}
                            className="min-h-11 rounded-md px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50">Help</button>}
                    </div>
                </div>
                {tracker?.persistent === false && <p role="status" className="mb-3 text-sm text-gray-700">Progress is available for this session. It will be lost when you reload.</p>}
                {guideSlot}
                <div className={`${gridClasses} mb-6`}>
                    <section
                        className={`min-w-0 space-y-6 ${gridLayout === 'default' ? (hasSidebar ? 'lg:col-span-2' : 'lg:col-span-3') : ''}`}
                        aria-label="Interactive visualization and controls"
                    >
                        {visualizationSlot && (
                            <div
                                id="visualization-area"
                                aria-label="Algorithm visualization"
                                role="region"
                            >
                                {visualizationSlot}
                            </div>
                        )}

                        {/* Placeholder for missing slot content */}
                        {/* Design Decision: Show placeholder instead of crashing */}
                        {!visualizationSlot && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                                Visualization not available
                            </div>
                        )}
                    </section>
                    {hasSidebar && <div className="min-w-0 space-y-6">
                        {controlsSlot && <section id="controls-area" aria-label="Algorithm controls">{controlsSlot}</section>}
                        {showConceptPanel && (
                            <aside aria-label="Lesson concept and explanation">
                                <ConceptPanel algorithm={algorithm} />
                            </aside>
                        )}
                    </div>}
                </div>

                {/* Code panel or custom footer (Requirements 1.1, 4.2, 4.3, 10.1, 10.2) */}
                {/* Shows implementation code in Python and JavaScript */}
                {/* Can be replaced with customFooter or hidden with showCodePanel={false} */}
                {customFooter ? (
                    <section
                        className="w-full"
                        aria-label="Custom footer content"
                        role="contentinfo"
                    >
                        {customFooter}
                    </section>
                ) : showCodePanel ? (
                    <section
                        id="code-panel"
                        className="w-full"
                        aria-label="Algorithm source code"
                        role="region"
                    >
                        <CodePanel
                            algorithm={algorithm}
                            isExpanded={codePanelExpanded}
                            onToggle={onToggleCodePanel || (() => { })}
                        />
                    </section>
                ) : null}

                {/* Error toast (Requirements 1.5, 5.2) */}
                {/* Displays error messages with dismiss action */}
                {/* Design Decision: Toast instead of modal for non-blocking errors */}
                {error && onClearError && (
                    <Toast
                        message={error}
                        onDismiss={onClearError}
                        type="error"
                    />
                )}

                {/* Help modal (Requirements 1.1) */}
                {/* Shows keyboard shortcut reference */}
                {helpModalOpen !== undefined && onToggleHelp && (
                    <HelpModal
                        isOpen={helpModalOpen}
                        onClose={onToggleHelp}
                    />
                )}
            </div>
        </div>
    );
});

BaseLayout.displayName = 'BaseLayout';
