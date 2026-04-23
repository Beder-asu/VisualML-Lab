import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutError, useCodePanelState, useLayoutKeyboardShortcuts } from '../useLayoutHooks';

describe('useLayoutHooks', () => {
    describe('useLayoutError', () => {
        it('initializes with null error', () => {
            const { result } = renderHook(() => useLayoutError());
            expect(result.current.error).toBeNull();
        });

        it('sets error message', () => {
            const { result } = renderHook(() => useLayoutError());

            act(() => {
                result.current.setError('Test error message');
            });

            expect(result.current.error).toBe('Test error message');
        });

        it('clears error', () => {
            const { result } = renderHook(() => useLayoutError());

            act(() => {
                result.current.setError('Test error');
            });
            expect(result.current.error).toBe('Test error');

            act(() => {
                result.current.clearError();
            });
            expect(result.current.error).toBeNull();
        });

        it('updates error message multiple times', () => {
            const { result } = renderHook(() => useLayoutError());

            act(() => {
                result.current.setError('First error');
            });
            expect(result.current.error).toBe('First error');

            act(() => {
                result.current.setError('Second error');
            });
            expect(result.current.error).toBe('Second error');
        });
    });

    describe('useCodePanelState', () => {
        it('initializes with false by default', () => {
            const { result } = renderHook(() => useCodePanelState());
            expect(result.current.isExpanded).toBe(false);
        });

        it('initializes with provided value', () => {
            const { result } = renderHook(() => useCodePanelState(true));
            expect(result.current.isExpanded).toBe(true);
        });

        it('toggles expanded state', () => {
            const { result } = renderHook(() => useCodePanelState(false));

            act(() => {
                result.current.toggle();
            });
            expect(result.current.isExpanded).toBe(true);

            act(() => {
                result.current.toggle();
            });
            expect(result.current.isExpanded).toBe(false);
        });

        it('expands when collapsed', () => {
            const { result } = renderHook(() => useCodePanelState(false));

            act(() => {
                result.current.expand();
            });
            expect(result.current.isExpanded).toBe(true);
        });

        it('remains expanded when already expanded', () => {
            const { result } = renderHook(() => useCodePanelState(true));

            act(() => {
                result.current.expand();
            });
            expect(result.current.isExpanded).toBe(true);
        });

        it('collapses when expanded', () => {
            const { result } = renderHook(() => useCodePanelState(true));

            act(() => {
                result.current.collapse();
            });
            expect(result.current.isExpanded).toBe(false);
        });

        it('remains collapsed when already collapsed', () => {
            const { result } = renderHook(() => useCodePanelState(false));

            act(() => {
                result.current.collapse();
            });
            expect(result.current.isExpanded).toBe(false);
        });
    });

    describe('useLayoutKeyboardShortcuts', () => {
        it('calls onPlayPause handler when provided', () => {
            const onPlayPause = vi.fn();

            renderHook(() => useLayoutKeyboardShortcuts({ onPlayPause }));

            const event = new KeyboardEvent('keydown', { key: ' ' });
            window.dispatchEvent(event);

            expect(onPlayPause).toHaveBeenCalledTimes(1);
        });

        it('calls onStep handler when provided', () => {
            const onStep = vi.fn();

            renderHook(() => useLayoutKeyboardShortcuts({ onStep }));

            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);

            expect(onStep).toHaveBeenCalledTimes(1);
        });

        it('calls onReset handler when provided', () => {
            const onReset = vi.fn();

            renderHook(() => useLayoutKeyboardShortcuts({ onReset }));

            const event = new KeyboardEvent('keydown', { key: 'r' });
            window.dispatchEvent(event);

            expect(onReset).toHaveBeenCalledTimes(1);
        });

        it('calls onToggleCodePanel handler when provided', () => {
            const onToggleCodePanel = vi.fn();

            renderHook(() => useLayoutKeyboardShortcuts({ onToggleCodePanel }));

            const event = new KeyboardEvent('keydown', { key: 'c' });
            window.dispatchEvent(event);

            expect(onToggleCodePanel).toHaveBeenCalledTimes(1);
        });

        it('calls onToggleHelp handler when provided', () => {
            const onToggleHelp = vi.fn();

            renderHook(() => useLayoutKeyboardShortcuts({ onToggleHelp }));

            const event = new KeyboardEvent('keydown', { key: '?' });
            window.dispatchEvent(event);

            expect(onToggleHelp).toHaveBeenCalledTimes(1);
        });

        it('does not throw when handlers are undefined', () => {
            expect(() => {
                renderHook(() => useLayoutKeyboardShortcuts({}));

                const event = new KeyboardEvent('keydown', { key: ' ' });
                window.dispatchEvent(event);
            }).not.toThrow();
        });

        it('respects enabled parameter', () => {
            const onPlayPause = vi.fn();

            renderHook(() => useLayoutKeyboardShortcuts({ onPlayPause }, false));

            const event = new KeyboardEvent('keydown', { key: ' ' });
            window.dispatchEvent(event);

            expect(onPlayPause).not.toHaveBeenCalled();
        });

        it('calls multiple handlers correctly', () => {
            const onPlayPause = vi.fn();
            const onStep = vi.fn();
            const onReset = vi.fn();

            renderHook(() => useLayoutKeyboardShortcuts({
                onPlayPause,
                onStep,
                onReset,
            }));

            window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(onPlayPause).toHaveBeenCalledTimes(1);

            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            expect(onStep).toHaveBeenCalledTimes(1);

            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
            expect(onReset).toHaveBeenCalledTimes(1);
        });
    });
});
