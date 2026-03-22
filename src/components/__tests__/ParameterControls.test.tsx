/**
 * ParameterControls.test.tsx — Unit tests for parameter controls
 * 
 * Tests slider onChange triggers param update and reset, pause-before-reset logic, and debouncing.
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterControls } from '../ParameterControls';

describe('ParameterControls', () => {
    const mockOnParamsChange = vi.fn();
    const mockOnPause = vi.fn();

    const defaultProps = {
        algorithm: 'linearRegression',
        params: { lr: 0.01, nIter: 100 },
        isPlaying: false,
        onParamsChange: mockOnParamsChange,
        onPause: mockOnPause,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('renders parameter sliders based on algorithm', () => {
        render(<ParameterControls {...defaultProps} />);

        expect(screen.getByLabelText('Learning Rate')).toBeInTheDocument();
        expect(screen.getByLabelText('Max Iterations')).toBeInTheDocument();
    });

    it('renders SVM-specific parameter when algorithm is svm', () => {
        render(<ParameterControls {...defaultProps} algorithm="svm" params={{ lr: 0.01, nIter: 100, C: 1.0 }} />);

        expect(screen.getByLabelText('Learning Rate')).toBeInTheDocument();
        expect(screen.getByLabelText('Max Iterations')).toBeInTheDocument();
        expect(screen.getByLabelText('C (Regularization)')).toBeInTheDocument();
    });

    it('displays current parameter values', () => {
        render(<ParameterControls {...defaultProps} />);

        expect(screen.getByText('0.010')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('triggers param update when learning rate slider changes', async () => {
        render(<ParameterControls {...defaultProps} />);

        const lrSlider = screen.getByLabelText('Learning Rate') as HTMLInputElement;

        fireEvent.change(lrSlider, { target: { value: '0.05' } });

        // Advance timers to trigger debounced callback
        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledWith({ lr: 0.05 });
    });

    it('triggers param update when iteration slider changes', async () => {
        render(<ParameterControls {...defaultProps} />);

        const nIterSlider = screen.getByLabelText('Max Iterations') as HTMLInputElement;

        fireEvent.change(nIterSlider, { target: { value: '200' } });

        // Advance timers to trigger debounced callback
        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledWith({ nIter: 200 });
    });

    it('triggers param update when SVM C parameter changes', async () => {
        render(<ParameterControls {...defaultProps} algorithm="svm" params={{ lr: 0.01, nIter: 100, C: 1.0 }} />);

        const cSlider = screen.getByLabelText('C (Regularization)') as HTMLInputElement;

        fireEvent.change(cSlider, { target: { value: '2.5' } });

        // Advance timers to trigger debounced callback
        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledWith({ C: 2.5 });
    });

    it('debounces rapid slider changes', async () => {
        render(<ParameterControls {...defaultProps} />);

        const lrSlider = screen.getByLabelText('Learning Rate') as HTMLInputElement;

        fireEvent.change(lrSlider, { target: { value: '0.02' } });
        await vi.advanceTimersByTimeAsync(50);
        fireEvent.change(lrSlider, { target: { value: '0.03' } });
        await vi.advanceTimersByTimeAsync(50);
        fireEvent.change(lrSlider, { target: { value: '0.04' } });

        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledTimes(1);
        expect(mockOnParamsChange).toHaveBeenCalledWith({ lr: 0.04 });
    });

    it('updates local state immediately for responsive UI', () => {
        render(<ParameterControls {...defaultProps} />);

        const lrSlider = screen.getByLabelText('Learning Rate') as HTMLInputElement;

        fireEvent.change(lrSlider, { target: { value: '0.05' } });

        expect(screen.getByText('0.050')).toBeInTheDocument();
        expect(mockOnParamsChange).not.toHaveBeenCalled();
    });

    it('calls onPause when slider changes during active training', async () => {
        render(<ParameterControls {...defaultProps} isPlaying={true} />);

        const lrSlider = screen.getByLabelText('Learning Rate') as HTMLInputElement;

        fireEvent.change(lrSlider, { target: { value: '0.05' } });

        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnPause).toHaveBeenCalled();
        expect(mockOnParamsChange).toHaveBeenCalledWith({ lr: 0.05 });
    });

    it('does not call onPause when slider changes while not playing', async () => {
        render(<ParameterControls {...defaultProps} isPlaying={false} />);

        const lrSlider = screen.getByLabelText('Learning Rate') as HTMLInputElement;

        fireEvent.change(lrSlider, { target: { value: '0.05' } });

        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnPause).not.toHaveBeenCalled();
        expect(mockOnParamsChange).toHaveBeenCalledWith({ lr: 0.05 });
    });

    it('does not call onPause if onPause callback is not provided', async () => {
        const propsWithoutPause = {
            ...defaultProps,
            isPlaying: true,
            onPause: undefined,
        };

        render(<ParameterControls {...propsWithoutPause} />);

        const lrSlider = screen.getByLabelText('Learning Rate') as HTMLInputElement;

        fireEvent.change(lrSlider, { target: { value: '0.05' } });

        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledWith({ lr: 0.05 });
    });

    it('cleans up debounce timer on unmount', () => {
        const { unmount } = render(<ParameterControls {...defaultProps} />);

        const lrSlider = screen.getByLabelText('Learning Rate') as HTMLInputElement;

        fireEvent.change(lrSlider, { target: { value: '0.05' } });

        unmount();

        vi.advanceTimersByTime(100);

        expect(mockOnParamsChange).not.toHaveBeenCalled();
    });
});
