/**
 * CodePanel.test.tsx — Unit tests for CodePanel component
 * 
 * Tests toggle functionality, language tab switching, and state persistence.
 * Requirements: 5.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodePanel } from '../CodePanel';

describe('CodePanel', () => {
    describe('Toggle functionality', () => {
        it('should call onToggle when toggle button is clicked', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={false}
                    onToggle={onToggle}
                />
            );

            const toggleButton = screen.getByRole('button', { name: /code panel/i });
            fireEvent.click(toggleButton);

            expect(onToggle).toHaveBeenCalledTimes(1);
        });

        it('should show content when isExpanded is true', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Language tabs should be visible
            expect(screen.getByRole('tab', { name: /javascript/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /python/i })).toBeInTheDocument();
        });

        it('should hide content when isExpanded is false', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={false}
                    onToggle={onToggle}
                />
            );

            // Language tabs should not be visible
            expect(screen.queryByRole('tab', { name: /javascript/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('tab', { name: /python/i })).not.toBeInTheDocument();
        });

        it('should set aria-expanded attribute correctly', () => {
            const onToggle = vi.fn();

            const { rerender } = render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={false}
                    onToggle={onToggle}
                />
            );

            const toggleButton = screen.getByRole('button', { name: /code panel/i });
            expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

            rerender(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
        });
    });

    describe('Language tab switching', () => {
        it('should start with JavaScript selected by default', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            const jsButton = screen.getByRole('tab', { name: /javascript/i });
            expect(jsButton).toHaveAttribute('aria-selected', 'true');
        });

        it('should switch to Python when Python tab is clicked', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            const pythonButton = screen.getByRole('tab', { name: /python/i });
            fireEvent.click(pythonButton);

            expect(pythonButton).toHaveAttribute('aria-selected', 'true');

            const jsButton = screen.getByRole('tab', { name: /javascript/i });
            expect(jsButton).toHaveAttribute('aria-selected', 'false');
        });

        it('should switch back to JavaScript when JavaScript tab is clicked', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Switch to Python first
            const pythonButton = screen.getByRole('tab', { name: /python/i });
            fireEvent.click(pythonButton);

            // Switch back to JavaScript
            const jsButton = screen.getByRole('tab', { name: /javascript/i });
            fireEvent.click(jsButton);

            expect(jsButton).toHaveAttribute('aria-selected', 'true');
            expect(pythonButton).toHaveAttribute('aria-selected', 'false');
        });
    });

    describe('State persistence', () => {
        it('should maintain language selection when toggling panel', () => {
            const onToggle = vi.fn();

            const { rerender } = render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Switch to Python
            const pythonButton = screen.getByRole('tab', { name: /python/i });
            fireEvent.click(pythonButton);
            expect(pythonButton).toHaveAttribute('aria-selected', 'true');

            // Collapse panel
            rerender(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={false}
                    onToggle={onToggle}
                />
            );

            // Expand panel again
            rerender(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Python should still be selected
            const pythonButtonAfter = screen.getByRole('tab', { name: /python/i });
            expect(pythonButtonAfter).toHaveAttribute('aria-selected', 'true');
        });

        it('should maintain language selection when algorithm changes', () => {
            const onToggle = vi.fn();

            const { rerender } = render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Switch to Python
            const pythonButton = screen.getByRole('tab', { name: /python/i });
            fireEvent.click(pythonButton);
            expect(pythonButton).toHaveAttribute('aria-selected', 'true');

            // Change algorithm
            rerender(
                <CodePanel
                    algorithm="logisticRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Python should still be selected
            const pythonButtonAfter = screen.getByRole('tab', { name: /python/i });
            expect(pythonButtonAfter).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('Algorithm code display', () => {
        it('should display code for linear regression', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Check that code content is rendered (syntax highlighter renders the code)
            expect(screen.getByText(/stepLinearRegression/i)).toBeInTheDocument();
        });

        it('should display code for logistic regression', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="logisticRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            expect(screen.getByText(/stepLogisticRegression/i)).toBeInTheDocument();
        });

        it('should display code for SVM', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="svm"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            expect(screen.getByText(/stepSVM/i)).toBeInTheDocument();
        });

        it('should display Python code when Python tab is selected', () => {
            const onToggle = vi.fn();

            render(
                <CodePanel
                    algorithm="linearRegression"
                    isExpanded={true}
                    onToggle={onToggle}
                />
            );

            // Switch to Python
            const pythonButton = screen.getByRole('tab', { name: /python/i });
            fireEvent.click(pythonButton);

            // Check for Python-specific syntax
            expect(screen.getByText(/step_linear_regression/i)).toBeInTheDocument();
        });
    });
});
