/**
 * PlaybackControls.test.tsx — Unit tests for playback controls
 * 
 * Tests button click handlers and button disabled states.
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlaybackControls } from '../PlaybackControls';

describe('PlaybackControls', () => {
    const mockOnPlay = vi.fn();
    const mockOnPause = vi.fn();
    const mockOnStep = vi.fn();
    const mockOnReset = vi.fn();

    const defaultProps = {
        isPlaying: false,
        isPaused: false,
        isConverged: false,
        onPlay: mockOnPlay,
        onPause: mockOnPause,
        onStep: mockOnStep,
        onReset: mockOnReset,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all playback control buttons', () => {
        render(<PlaybackControls {...defaultProps} />);

        expect(screen.getByLabelText('Play training (Spacebar)')).toBeInTheDocument();
        expect(screen.getByLabelText('Pause training (Spacebar)')).toBeInTheDocument();
        expect(screen.getByLabelText('Step once (Right Arrow)')).toBeInTheDocument();
        expect(screen.getByLabelText('Reset training (R key)')).toBeInTheDocument();
    });

    // Requirements 1.1: Test play button click handler
    it('calls onPlay when play button is clicked', () => {
        render(<PlaybackControls {...defaultProps} />);

        const playButton = screen.getByLabelText('Play training (Spacebar)');
        fireEvent.click(playButton);

        expect(mockOnPlay).toHaveBeenCalledTimes(1);
    });

    // Requirements 1.2: Test pause button click handler
    it('calls onPause when pause button is clicked', () => {
        render(<PlaybackControls {...defaultProps} isPlaying={true} />);

        const pauseButton = screen.getByLabelText('Pause training (Spacebar)');
        fireEvent.click(pauseButton);

        expect(mockOnPause).toHaveBeenCalledTimes(1);
    });

    // Requirements 1.3: Test step button click handler
    it('calls onStep when step button is clicked', () => {
        render(<PlaybackControls {...defaultProps} />);

        const stepButton = screen.getByLabelText('Step once (Right Arrow)');
        fireEvent.click(stepButton);

        expect(mockOnStep).toHaveBeenCalledTimes(1);
    });

    // Requirements 1.4: Test reset button click handler
    it('calls onReset when reset button is clicked', () => {
        render(<PlaybackControls {...defaultProps} />);

        const resetButton = screen.getByLabelText('Reset training (R key)');
        fireEvent.click(resetButton);

        expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    // Test button disabled states
    it('disables play button when training is playing', () => {
        render(<PlaybackControls {...defaultProps} isPlaying={true} />);

        const playButton = screen.getByLabelText('Play training (Spacebar)');
        expect(playButton).toBeDisabled();
    });

    it('disables play button when training is converged', () => {
        render(<PlaybackControls {...defaultProps} isConverged={true} />);

        const playButton = screen.getByLabelText('Play training (Spacebar)');
        expect(playButton).toBeDisabled();
    });

    it('disables pause button when training is not playing', () => {
        render(<PlaybackControls {...defaultProps} isPlaying={false} />);

        const pauseButton = screen.getByLabelText('Pause training (Spacebar)');
        expect(pauseButton).toBeDisabled();

    });

    it('enables pause button when training is playing', () => {
        render(<PlaybackControls {...defaultProps} isPlaying={true} />);

        const pauseButton = screen.getByLabelText('Pause training (Spacebar)');
        expect(pauseButton).not.toBeDisabled();
    });

    it('disables step button when training is playing', () => {
        render(<PlaybackControls {...defaultProps} isPlaying={true} />);

        const stepButton = screen.getByLabelText('Step once (Right Arrow)');
        expect(stepButton).toBeDisabled();
    });

    it('disables step button when training is converged', () => {
        render(<PlaybackControls {...defaultProps} isConverged={true} />);

        const stepButton = screen.getByLabelText('Step once (Right Arrow)');
        expect(stepButton).toBeDisabled();
    });

    it('enables step button when training is paused and not converged', () => {
        render(<PlaybackControls {...defaultProps} isPaused={true} />);

        const stepButton = screen.getByLabelText('Step once (Right Arrow)');
        expect(stepButton).not.toBeDisabled();
    });

    it('reset button is always enabled', () => {
        render(<PlaybackControls {...defaultProps} />);

        const resetButton = screen.getByLabelText('Reset training (R key)');
        expect(resetButton).not.toBeDisabled();
    });

    it('reset button remains enabled when playing', () => {
        render(<PlaybackControls {...defaultProps} isPlaying={true} />);

        const resetButton = screen.getByLabelText('Reset training (R key)');
        expect(resetButton).not.toBeDisabled();
    });

    it('reset button remains enabled when converged', () => {
        render(<PlaybackControls {...defaultProps} isConverged={true} />);

        const resetButton = screen.getByLabelText('Reset training (R key)');
        expect(resetButton).not.toBeDisabled();
    });

    // Test multiple button states simultaneously
    it('correctly handles state when playing', () => {
        render(<PlaybackControls {...defaultProps} isPlaying={true} />);

        expect(screen.getByLabelText('Play training (Spacebar)')).toBeDisabled();
        expect(screen.getByLabelText('Pause training (Spacebar)')).not.toBeDisabled();
        expect(screen.getByLabelText('Step once (Right Arrow)')).toBeDisabled();
        expect(screen.getByLabelText('Reset training (R key)')).not.toBeDisabled();
    });

    it('correctly handles state when paused', () => {
        render(<PlaybackControls {...defaultProps} isPaused={true} />);

        expect(screen.getByLabelText('Play training (Spacebar)')).not.toBeDisabled();
        expect(screen.getByLabelText('Pause training (Spacebar)')).toBeDisabled();
        expect(screen.getByLabelText('Step once (Right Arrow)')).not.toBeDisabled();
        expect(screen.getByLabelText('Reset training (R key)')).not.toBeDisabled();
    });

    it('correctly handles state when converged', () => {
        render(<PlaybackControls {...defaultProps} isConverged={true} />);

        expect(screen.getByLabelText('Play training (Spacebar)')).toBeDisabled();
        expect(screen.getByLabelText('Pause training (Spacebar)')).toBeDisabled();
        expect(screen.getByLabelText('Step once (Right Arrow)')).toBeDisabled();
        expect(screen.getByLabelText('Reset training (R key)')).not.toBeDisabled();
    });
});
