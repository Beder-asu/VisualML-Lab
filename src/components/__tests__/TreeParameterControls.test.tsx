/**
 * TreeParameterControls.test.tsx — Unit tests for tree parameter controls
 * 
 * Tests slider and dropdown onChange triggers param update, pause-before-reset logic, and debouncing.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeParameterControls, TreeParams } from '../TreeParameterControls';

describe('TreeParameterControls', () => {
    const mockOnParamsChange = vi.fn();
    const mockOnPause = vi.fn();

    const defaultParams: TreeParams = {
        maxDepth: 4,
        criterion: 'gini',
        minSamplesSplit: 2,
    };

    const defaultProps = {
        params: defaultParams,
        isBuilding: false,
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

    it('renders all controls', () => {
        render(<TreeParameterControls {...defaultProps} />);

        expect(screen.getByLabelText(/Max Depth/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Split Criterion/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Min Samples Split/i)).toBeInTheDocument();
    });

    it('displays current parameter values', () => {
        render(<TreeParameterControls {...defaultProps} />);

        // Check max depth value
        const maxDepthValue = screen.getAllByText('4')[0];
        expect(maxDepthValue).toBeInTheDocument();

        // Check criterion value
        const criterionSelect = screen.getByLabelText(/Split Criterion/i) as HTMLSelectElement;
        expect(criterionSelect.value).toBe('gini');

        // Check min samples split value
        const minSamplesValue = screen.getAllByText('2')[0];
        expect(minSamplesValue).toBeInTheDocument();
    });

    it('calls onParamsChange on max depth slider change', async () => {
        render(<TreeParameterControls {...defaultProps} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;

        fireEvent.change(maxDepthSlider, { target: { value: '6' } });

        // Advance timers to trigger debounced callback
        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledWith({ maxDepth: 6 });
    });

    it('calls onParamsChange on criterion dropdown change', async () => {
        render(<TreeParameterControls {...defaultProps} />);

        const criterionSelect = screen.getByLabelText(/Split Criterion/i) as HTMLSelectElement;

        fireEvent.change(criterionSelect, { target: { value: 'entropy' } });

        // Advance timers to trigger debounced callback
        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledWith({ criterion: 'entropy' });
    });

    it('calls onParamsChange on min samples split slider change', async () => {
        render(<TreeParameterControls {...defaultProps} />);

        const minSamplesSlider = screen.getByLabelText(/Min Samples Split/i) as HTMLInputElement;

        fireEvent.change(minSamplesSlider, { target: { value: '10' } });

        // Advance timers to trigger debounced callback
        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledWith({ minSamplesSplit: 10 });
    });

    it('calls onPause when building and parameter changes', async () => {
        render(<TreeParameterControls {...defaultProps} isBuilding={true} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;

        fireEvent.change(maxDepthSlider, { target: { value: '5' } });

        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnPause).toHaveBeenCalled();
        expect(mockOnParamsChange).toHaveBeenCalledWith({ maxDepth: 5 });
    });

    it('does not call onPause when not building', async () => {
        render(<TreeParameterControls {...defaultProps} isBuilding={false} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;

        fireEvent.change(maxDepthSlider, { target: { value: '5' } });

        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnPause).not.toHaveBeenCalled();
        expect(mockOnParamsChange).toHaveBeenCalledWith({ maxDepth: 5 });
    });

    it('disables controls during building', () => {
        render(<TreeParameterControls {...defaultProps} isBuilding={true} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;
        const criterionSelect = screen.getByLabelText(/Split Criterion/i) as HTMLSelectElement;
        const minSamplesSlider = screen.getByLabelText(/Min Samples Split/i) as HTMLInputElement;

        expect(maxDepthSlider.disabled).toBe(true);
        expect(criterionSelect.disabled).toBe(true);
        expect(minSamplesSlider.disabled).toBe(true);
    });

    it('enables controls when not building', () => {
        render(<TreeParameterControls {...defaultProps} isBuilding={false} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;
        const criterionSelect = screen.getByLabelText(/Split Criterion/i) as HTMLSelectElement;
        const minSamplesSlider = screen.getByLabelText(/Min Samples Split/i) as HTMLInputElement;

        expect(maxDepthSlider.disabled).toBe(false);
        expect(criterionSelect.disabled).toBe(false);
        expect(minSamplesSlider.disabled).toBe(false);
    });

    it('debounces rapid slider changes', async () => {
        render(<TreeParameterControls {...defaultProps} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;

        fireEvent.change(maxDepthSlider, { target: { value: '5' } });
        await vi.advanceTimersByTimeAsync(50);
        fireEvent.change(maxDepthSlider, { target: { value: '6' } });
        await vi.advanceTimersByTimeAsync(50);
        fireEvent.change(maxDepthSlider, { target: { value: '7' } });

        await vi.advanceTimersByTimeAsync(100);

        expect(mockOnParamsChange).toHaveBeenCalledTimes(1);
        expect(mockOnParamsChange).toHaveBeenCalledWith({ maxDepth: 7 });
    });

    it('updates local state immediately for responsive UI', () => {
        render(<TreeParameterControls {...defaultProps} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;

        fireEvent.change(maxDepthSlider, { target: { value: '7' } });

        expect(screen.getByText('7')).toBeInTheDocument();
        expect(mockOnParamsChange).not.toHaveBeenCalled();
    });

    it('cleans up debounce timer on unmount', () => {
        const { unmount } = render(<TreeParameterControls {...defaultProps} />);

        const maxDepthSlider = screen.getByLabelText(/Max Depth/i) as HTMLInputElement;

        fireEvent.change(maxDepthSlider, { target: { value: '5' } });

        unmount();

        vi.advanceTimersByTime(100);

        expect(mockOnParamsChange).not.toHaveBeenCalled();
    });
});
