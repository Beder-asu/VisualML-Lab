import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
    onPlayPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onToggleCodePanel: () => void;
    onToggleHelp?: () => void;
    enabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts in the VisualML Lab UI.
 * 
 * Keyboard shortcuts:
 * - Spacebar: Toggle play/pause
 * - Right Arrow: Execute single step
 * - R: Reset training state
 * - C: Toggle code panel visibility
 * - ?: Toggle help modal
 * 
 * @param config Configuration object with callback functions for each shortcut
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig): void {
    const {
        onPlayPause,
        onStep,
        onReset,
        onToggleCodePanel,
        onToggleHelp,
        enabled = true,
    } = config;

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore shortcuts when user is typing in an input field
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                (target.contentEditable && target.contentEditable === 'true')
            ) {
                return;
            }

            switch (event.key) {
                case ' ': // Spacebar
                    event.preventDefault();
                    onPlayPause();
                    break;

                case 'ArrowRight':
                    event.preventDefault();
                    onStep();
                    break;

                case 'r':
                case 'R':
                    event.preventDefault();
                    onReset();
                    break;

                case 'c':
                case 'C':
                    event.preventDefault();
                    onToggleCodePanel();
                    break;

                case '?':
                    event.preventDefault();
                    if (onToggleHelp) {
                        onToggleHelp();
                    }
                    break;

                default:
                    // Do nothing for other keys
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onPlayPause, onStep, onReset, onToggleCodePanel, onToggleHelp, enabled]);
}
