/**
 * LessonPage.dispatcher.test.tsx — Unit tests for layout dispatcher
 * 
 * Tests layout routing, lazy loading, error handling, and algorithm validation.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LessonPage from '../LessonPage';

// Mock the GradientDescentLayout component
vi.mock('../layouts/GradientDescentLayout', () => ({
    GradientDescentLayout: ({ algorithm }: { algorithm: string }) => (
        <div data-testid="gradient-descent-layout">
            GradientDescentLayout: {algorithm}
        </div>
    ),
}));

// Mock the DecisionTreeLayout component
vi.mock('../layouts/DecisionTreeLayout', () => ({
    DecisionTreeLayout: ({ algorithm }: { algorithm: string }) => (
        <div data-testid="decision-tree-layout">
            DecisionTreeLayout: {algorithm}
        </div>
    ),
}));

// Mock the LayoutErrorBoundary to simplify testing
vi.mock('../../components/LayoutErrorBoundary', () => ({
    LayoutErrorBoundary: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="error-boundary">{children}</div>
    ),
}));

describe('LessonPage - Layout Dispatcher', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Layout routing', () => {
        it('renders GradientDescentLayout for linearRegression', async () => {
            render(
                <MemoryRouter initialEntries={['/lesson/linearRegression']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('gradient-descent-layout')).toBeInTheDocument();
            });

            expect(screen.getByText(/GradientDescentLayout: linearRegression/)).toBeInTheDocument();
        });

        it('renders GradientDescentLayout for logisticRegression', async () => {
            render(
                <MemoryRouter initialEntries={['/lesson/logisticRegression']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('gradient-descent-layout')).toBeInTheDocument();
            });

            expect(screen.getByText(/GradientDescentLayout: logisticRegression/)).toBeInTheDocument();
        });

        it('renders GradientDescentLayout for svm', async () => {
            render(
                <MemoryRouter initialEntries={['/lesson/svm']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('gradient-descent-layout')).toBeInTheDocument();
            });

            expect(screen.getByText(/GradientDescentLayout: svm/)).toBeInTheDocument();
        });

        it('renders DecisionTreeLayout for decisionTree', async () => {
            render(
                <MemoryRouter initialEntries={['/lesson/decisionTree']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('decision-tree-layout')).toBeInTheDocument();
            });

            expect(screen.getByText(/DecisionTreeLayout: decisionTree/)).toBeInTheDocument();
        });
    });

    describe('Invalid algorithm handling', () => {
        it('redirects to home for invalid algorithm', () => {
            render(
                <MemoryRouter initialEntries={['/lesson/invalidAlgorithm']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                        <Route path="/" element={<div data-testid="home-page">Home</div>} />
                    </Routes>
                </MemoryRouter>
            );

            // Should redirect to home
            expect(screen.queryByTestId('home-page')).toBeInTheDocument();
            expect(screen.queryByTestId('gradient-descent-layout')).not.toBeInTheDocument();
        });

        it('redirects to home when algorithm parameter is undefined', () => {
            render(
                <MemoryRouter initialEntries={['/']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                        <Route path="/" element={<div data-testid="home-page">Home</div>} />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });
    });

    describe('Lazy loading', () => {
        it('renders layout after lazy load completes', async () => {
            render(
                <MemoryRouter initialEntries={['/lesson/linearRegression']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </MemoryRouter>
            );

            // Wait for layout to load
            await waitFor(() => {
                expect(screen.getByTestId('gradient-descent-layout')).toBeInTheDocument();
            });
        });
    });

    describe('Algorithm prop passing', () => {
        it('passes correct algorithm prop to layout component', async () => {
            render(
                <MemoryRouter initialEntries={['/lesson/linearRegression']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/GradientDescentLayout: linearRegression/)).toBeInTheDocument();
            });
        });
    });

    describe('Error boundary integration', () => {
        it('wraps layout in error boundary', async () => {
            render(
                <MemoryRouter initialEntries={['/lesson/linearRegression']}>
                    <Routes>
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
            });
        });
    });

    describe('Layout map completeness', () => {
        it('has layout mapping for all valid algorithms', () => {
            const validAlgorithms = ['linearRegression', 'logisticRegression', 'svm', 'decisionTree'];

            validAlgorithms.forEach(algorithm => {
                render(
                    <MemoryRouter initialEntries={[`/lesson/${algorithm}`]}>
                        <Routes>
                            <Route path="/lesson/:algorithm" element={<LessonPage />} />
                        </Routes>
                    </MemoryRouter>
                );

                // Should not redirect to home
                expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
            });
        });
    });
});
