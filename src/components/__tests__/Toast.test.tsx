/**
 * Unit tests for Toast component
 * 
 * Tests toast display, dismiss functionality, and accessibility
 * Requirements: 12.1, 12.2, 12.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
    it('renders error message', () => {
        render(
            <Toast
                message="Test error message"
                onDismiss={vi.fn()}
                type="error"
            />
        );

        expect(screen.getByText('Test error message')).toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders success message', () => {
        render(
            <Toast
                message="Operation successful"
                onDismiss={vi.fn()}
                type="success"
            />
        );

        expect(screen.getByText('Operation successful')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('renders info message', () => {
        render(
            <Toast
                message="Information message"
                onDismiss={vi.fn()}
                type="info"
            />
        );

        expect(screen.getByText('Information message')).toBeInTheDocument();
        expect(screen.getByText('Info')).toBeInTheDocument();
    });

    it('defaults to error type when type is not specified', () => {
        render(
            <Toast
                message="Default message"
                onDismiss={vi.fn()}
            />
        );

        expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
        const onDismiss = vi.fn();

        render(
            <Toast
                message="Test message"
                onDismiss={onDismiss}
                type="error"
            />
        );

        const dismissButton = screen.getByLabelText('Dismiss notification');
        fireEvent.click(dismissButton);

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('has proper ARIA attributes for accessibility', () => {
        render(
            <Toast
                message="Accessible message"
                onDismiss={vi.fn()}
                type="error"
            />
        );

        const toast = screen.getByRole('alert');
        expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('dismiss button has accessible label', () => {
        render(
            <Toast
                message="Test message"
                onDismiss={vi.fn()}
                type="error"
            />
        );

        const dismissButton = screen.getByLabelText('Dismiss notification');
        expect(dismissButton).toBeInTheDocument();
    });

    it('applies correct styling for error type', () => {
        const { container } = render(
            <Toast
                message="Error message"
                onDismiss={vi.fn()}
                type="error"
            />
        );

        const toast = container.querySelector('.bg-red-50');
        expect(toast).toBeInTheDocument();
    });

    it('applies correct styling for success type', () => {
        const { container } = render(
            <Toast
                message="Success message"
                onDismiss={vi.fn()}
                type="success"
            />
        );

        const toast = container.querySelector('.bg-green-50');
        expect(toast).toBeInTheDocument();
    });

    it('applies correct styling for info type', () => {
        const { container } = render(
            <Toast
                message="Info message"
                onDismiss={vi.fn()}
                type="info"
            />
        );

        const toast = container.querySelector('.bg-blue-50');
        expect(toast).toBeInTheDocument();
    });

    it('renders with animation class', () => {
        const { container } = render(
            <Toast
                message="Animated message"
                onDismiss={vi.fn()}
                type="error"
            />
        );

        const toast = container.querySelector('.animate-slide-in');
        expect(toast).toBeInTheDocument();
    });

    it('is positioned fixed at bottom-right', () => {
        const { container } = render(
            <Toast
                message="Positioned message"
                onDismiss={vi.fn()}
                type="error"
            />
        );

        const toast = container.querySelector('.fixed.bottom-4.right-4');
        expect(toast).toBeInTheDocument();
    });
});
