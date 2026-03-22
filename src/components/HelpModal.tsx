/**
 * HelpModal.tsx — Keyboard shortcuts help modal
 * 
 * Displays all available keyboard shortcuts with descriptions.
 * Accessible via '?' key.
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ShortcutItem {
    key: string;
    description: string;
}

const shortcuts: ShortcutItem[] = [
    {
        key: 'Space',
        description: 'Toggle play/pause training',
    },
    {
        key: 'Right Arrow',
        description: 'Execute a single training step',
    },
    {
        key: 'R',
        description: 'Reset training to initial state',
    },
    {
        key: 'C',
        description: 'Toggle code panel visibility',
    },
    {
        key: '?',
        description: 'Show/hide this help modal',
    },
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    // Handle escape key to close modal
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Trap focus within modal when open
    useEffect(() => {
        if (!isOpen) return;

        const modal = document.getElementById('help-modal');
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTab = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        window.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => window.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                id="help-modal"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-modal-title"
            >
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <Keyboard className="w-6 h-6 text-indigo-600" aria-hidden="true" />
                            <h2
                                id="help-modal-title"
                                className="text-xl font-semibold text-gray-900"
                            >
                                Keyboard Shortcuts
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1"
                            aria-label="Close help modal"
                        >
                            <X className="w-6 h-6" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-6">
                            Use these keyboard shortcuts to control training and navigate the interface efficiently.
                        </p>

                        <div className="space-y-3">
                            {shortcuts.map((shortcut, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="text-sm text-gray-700">
                                        {shortcut.description}
                                    </span>
                                    <kbd className="px-3 py-1.5 text-sm font-mono font-semibold text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
