/**
 * Shared hooks for layout components.
 * Provides error handling, code panel state, and keyboard shortcut integration.
 * 
 * @module useLayoutHooks
 */

import { useState, useCallback } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

/**
 * Error state management hook for layouts.
 * Provides error state and handlers for setting and clearing errors.
 * 
 * This hook manages error messages that should be displayed to the user,
 * typically rendered as toast notifications by the BaseLayout component.
 * 
 * @returns {Object} Error state and handler functions
 * @returns {string | null} returns.error - Current error message or null if no error
 * @returns {(errorMessage: string) => void} returns.setError - Function to set an error message
 * @returns {() => void} returns.clearError - Function to clear the current error
 * 
 * @example
 * const { error, setError, clearError } = useLayoutError();
 * 
 * // Set an error
 * setError('Training failed: invalid parameters');
 * 
 * // Clear the error
 * clearError();
 * 
 * // Pass to BaseLayout
 * <BaseLayout error={error} onClearError={clearError} />
 */
export function useLayoutError() {
    const [error, setErrorState] = useState<string | null>(null);

    const setError = useCallback((errorMessage: string) => {
        setErrorState(errorMessage);
    }, []);

    const clearError = useCallback(() => {
        setErrorState(null);
    }, []);

    return { error, setError, clearError };
}

/**
 * Code panel state management hook.
 * Provides expanded/collapsed state and control functions for the code panel.
 * 
 * The code panel displays algorithm implementation code and can be toggled
 * between expanded and collapsed states. This hook manages that state.
 * 
 * @param {boolean} [initialExpanded=false] - Initial expanded state
 * @returns {Object} Code panel state and control functions
 * @returns {boolean} returns.isExpanded - Whether the code panel is currently expanded
 * @returns {() => void} returns.toggle - Function to toggle between expanded and collapsed
 * @returns {() => void} returns.expand - Function to expand the code panel
 * @returns {() => void} returns.collapse - Function to collapse the code panel
 * 
 * @example
 * const { isExpanded, toggle, expand, collapse } = useCodePanelState(false);
 * 
 * // Toggle the panel
 * toggle();
 * 
 * // Explicitly expand
 * expand();
 * 
 * // Explicitly collapse
 * collapse();
 * 
 * // Pass to BaseLayout
 * <BaseLayout 
 *   codePanelExpanded={isExpanded} 
 *   onToggleCodePanel={toggle} 
 * />
 */
export function useCodePanelState(initialExpanded: boolean = false) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const toggle = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const expand = useCallback(() => {
        setIsExpanded(true);
    }, []);

    const collapse = useCallback(() => {
        setIsExpanded(false);
    }, []);

    return { isExpanded, toggle, expand, collapse };
}

/**
 * Keyboard handler configuration for layouts.
 * 
 * Defines optional callback functions for keyboard shortcuts.
 * All handlers are optional - undefined handlers will be replaced with no-op functions.
 * 
 * @interface KeyboardHandlers
 * @property {() => void} [onPlayPause] - Handler for play/pause toggle (Space bar)
 * @property {() => void} [onStep] - Handler for single step forward (Right arrow)
 * @property {() => void} [onReset] - Handler for reset (R key)
 * @property {() => void} [onToggleCodePanel] - Handler for code panel toggle (C key)
 * @property {() => void} [onToggleHelp] - Handler for help modal toggle (? key)
 */
export interface KeyboardHandlers {
    onPlayPause?: () => void;
    onStep?: () => void;
    onReset?: () => void;
    onToggleCodePanel?: () => void;
    onToggleHelp?: () => void;
}

/**
 * Keyboard shortcut integration hook for layouts.
 * Wraps the existing useKeyboardShortcuts hook with optional handlers.
 * 
 * This hook provides a convenient way to integrate keyboard shortcuts into
 * layout components. It handles the common pattern of providing default no-op
 * handlers for undefined callbacks, ensuring the keyboard system always has
 * valid functions to call.
 * 
 * @param {KeyboardHandlers} handlers - Object containing optional keyboard shortcut handlers
 * @param {boolean} [enabled=true] - Whether keyboard shortcuts are enabled
 * 
 * @example
 * // Basic usage with some handlers
 * useLayoutKeyboardShortcuts({
 *   onPlayPause: handlePlayPause,
 *   onStep: handleStep,
 *   onReset: handleReset,
 * });
 * 
 * @example
 * // Disable shortcuts conditionally
 * useLayoutKeyboardShortcuts(handlers, !isModalOpen);
 * 
 * @example
 * // Pass to BaseLayout
 * <BaseLayout
 *   keyboardHandlers={{
 *     onPlayPause: () => console.log('Play/Pause'),
 *     onStep: () => console.log('Step'),
 *   }}
 * />
 */
export function useLayoutKeyboardShortcuts(
    handlers: KeyboardHandlers,
    enabled: boolean = true
): void {
    // Provide no-op defaults for undefined handlers
    const noop = () => { };

    useKeyboardShortcuts({
        onPlayPause: handlers.onPlayPause || noop,
        onStep: handlers.onStep || noop,
        onReset: handlers.onReset || noop,
        onToggleCodePanel: handlers.onToggleCodePanel || noop,
        onToggleHelp: handlers.onToggleHelp,
        enabled,
    });
}
