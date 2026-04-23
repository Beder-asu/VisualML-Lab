/**
 * LayoutErrorBoundary.tsx — Error boundary for layout loading failures
 * 
 * Catches errors during layout component loading and provides a user-friendly
 * error message with retry functionality.
 * Requirements: 9.3
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component for handling layout loading failures.
 * Displays an error message and provides a retry button.
 * 
 * Requirements: 9.3
 */
export class LayoutErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Layout loading error:', error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
        // Force a page reload to retry loading the layout
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="mb-6">
                            <svg
                                className="mx-auto h-16 w-16 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Failed to Load Lesson
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We encountered an error while loading this lesson. This might be due to a
                            network issue or a problem with the lesson content.
                        </p>
                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Technical details
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Retry
                            </button>
                            <a
                                href="/"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Go Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
