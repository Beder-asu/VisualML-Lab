/**
 * Unit tests for useKeyboardShortcuts hook
 * 
 * Tests each keyboard shortcut triggers correct action and preventDefault is called
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
    let mockOnPlayPause: () => void;
    let mockOnStep: () => void;
    let mockOnReset: () => void;
    let mockOnToggleCodePanel: () => void;

    beforeEach(() => {
        mockOnPlayPause = vi.fn();
        mockOnStep = vi.fn();
        mockOnReset = vi.fn();
        mockOnToggleCodePanel = vi.fn();
    });

    // ---------------------------------------------------------------------------
    // Spacebar for play/pause toggle (Requirement 8.1)
    // ---------------------------------------------------------------------------

    it('calls onPlayPause when spacebar is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(event);

        expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
    });

    it('prevents default behavior when spacebar is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: ' ' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    // ---------------------------------------------------------------------------
    // Right arrow for step (Requirement 8.2)
    // ---------------------------------------------------------------------------

    it('calls onStep when right arrow is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        window.dispatchEvent(event);

        expect(mockOnStep).toHaveBeenCalledTimes(1);
    });

    it('prevents default behavior when right arrow is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    // ---------------------------------------------------------------------------
    // R key for reset (Requirement 8.3)
    // ---------------------------------------------------------------------------

    it('calls onReset when lowercase r is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'r' });
        window.dispatchEvent(event);

        expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('calls onReset when uppercase R is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'R' });
        window.dispatchEvent(event);

        expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('prevents default behavior when R is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'R' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    // ---------------------------------------------------------------------------
    // C key for code panel toggle (Requirement 8.4)
    // ---------------------------------------------------------------------------

    it('calls onToggleCodePanel when lowercase c is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'c' });
        window.dispatchEvent(event);

        expect(mockOnToggleCodePanel).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleCodePanel when uppercase C is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'C' });
        window.dispatchEvent(event);

        expect(mockOnToggleCodePanel).toHaveBeenCalledTimes(1);
    });

    it('prevents default behavior when C is pressed', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'C' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    // ---------------------------------------------------------------------------
    // Ignore shortcuts in input fields (Requirement 8.5)
    // ---------------------------------------------------------------------------

    it('does not trigger shortcuts when typing in an input field', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const input = document.createElement('input');
        document.body.appendChild(input);

        const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
        Object.defineProperty(event, 'target', { value: input, enumerable: true });
        input.dispatchEvent(event);

        expect(mockOnPlayPause).not.toHaveBeenCalled();

        document.body.removeChild(input);
    });

    it('does not trigger shortcuts when typing in a textarea', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        const event = new KeyboardEvent('keydown', { key: 'r', bubbles: true });
        Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
        textarea.dispatchEvent(event);

        expect(mockOnReset).not.toHaveBeenCalled();

        document.body.removeChild(textarea);
    });

    it('does not trigger shortcuts in contentEditable elements', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const div = document.createElement('div');
        div.contentEditable = 'true';
        document.body.appendChild(div);

        const event = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
        Object.defineProperty(event, 'target', { value: div, enumerable: true });
        div.dispatchEvent(event);

        expect(mockOnToggleCodePanel).not.toHaveBeenCalled();

        document.body.removeChild(div);
    });

    // ---------------------------------------------------------------------------
    // Other keys should not trigger actions
    // ---------------------------------------------------------------------------

    it('does not trigger any action for unhandled keys', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        const event = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(event);

        expect(mockOnPlayPause).not.toHaveBeenCalled();
        expect(mockOnStep).not.toHaveBeenCalled();
        expect(mockOnReset).not.toHaveBeenCalled();
        expect(mockOnToggleCodePanel).not.toHaveBeenCalled();
    });

    // ---------------------------------------------------------------------------
    // Enabled/disabled state
    // ---------------------------------------------------------------------------

    it('does not trigger shortcuts when disabled', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
                enabled: false,
            })
        );

        const event = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(event);

        expect(mockOnPlayPause).not.toHaveBeenCalled();
    });

    it('triggers shortcuts when explicitly enabled', () => {
        renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
                enabled: true,
            })
        );

        const event = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(event);

        expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
    });

    // ---------------------------------------------------------------------------
    // Cleanup
    // ---------------------------------------------------------------------------

    it('removes event listener on unmount', () => {
        const { unmount } = renderHook(() =>
            useKeyboardShortcuts({
                onPlayPause: mockOnPlayPause,
                onStep: mockOnStep,
                onReset: mockOnReset,
                onToggleCodePanel: mockOnToggleCodePanel,
            })
        );

        unmount();

        const event = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(event);

        expect(mockOnPlayPause).not.toHaveBeenCalled();
    });
});
