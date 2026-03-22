/**
 * Toast.tsx — Toast notification component for error messages
 * 
 * Displays error messages from ML Engine with dismiss functionality.
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
    message: string;
    onDismiss: () => void;
    type?: 'error' | 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({
    message,
    onDismiss,
    type = 'error'
}) => {
    const bgColor = type === 'error' ? 'bg-red-50' :
        type === 'success' ? 'bg-green-50' :
            'bg-blue-50';

    const borderColor = type === 'error' ? 'border-red-200' :
        type === 'success' ? 'border-green-200' :
            'border-blue-200';

    const textColor = type === 'error' ? 'text-red-800' :
        type === 'success' ? 'text-green-800' :
            'text-blue-800';

    const iconColor = type === 'error' ? 'text-red-600' :
        type === 'success' ? 'text-green-600' :
            'text-blue-600';

    return (
        <div
            className={`fixed bottom-4 right-4 ${bgColor} border ${borderColor} rounded-lg p-4 shadow-lg max-w-md z-50 animate-slide-in`}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {type === 'error' && (
                        <svg
                            className={`w-5 h-5 ${iconColor}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                    {type === 'success' && (
                        <svg
                            className={`w-5 h-5 ${iconColor}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${textColor} mb-1`}>
                        {type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info'}
                    </h4>
                    <p className={`text-sm ${textColor.replace('800', '700')}`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={onDismiss}
                    className={`flex-shrink-0 ${iconColor} hover:opacity-70 transition-opacity`}
                    aria-label="Dismiss notification"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
