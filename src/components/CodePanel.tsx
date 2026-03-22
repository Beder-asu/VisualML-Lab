/**
 * CodePanel.tsx — Collapsible code panel with language tabs
 * 
 * Displays syntax-highlighted algorithm implementations in JavaScript and Python.
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { getAlgorithmCode } from '../utils/codeContent';

type Language = 'javascript' | 'python';

interface CodePanelProps {
    algorithm: string;
    isExpanded: boolean;
    onToggle: () => void;
}

/**
 * CodePanel component with collapsible panel and language tabs
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export function CodePanel({ algorithm, isExpanded, onToggle }: CodePanelProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');

    // Get code for current algorithm and language (Requirements 5.1, 5.2)
    const code = getAlgorithmCode(algorithm, selectedLanguage);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Toggle button (Requirements 5.4) */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                aria-expanded={isExpanded}
                aria-controls="code-panel-content"
                aria-label={isExpanded ? "Collapse code panel" : "Expand code panel"}
            >
                <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Algorithm Code
                    </h3>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" aria-hidden="true" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
                )}
            </button>

            {/* Collapsible content (Requirements 5.4) */}
            {isExpanded && (
                <div id="code-panel-content" className="border-t border-gray-200">
                    {/* Language tabs (Requirements 5.2) */}
                    <div
                        className="flex gap-2 p-4 pb-0"
                        role="tablist"
                        aria-label="Programming language selection"
                    >
                        <button
                            onClick={() => setSelectedLanguage('javascript')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${selectedLanguage === 'javascript'
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            role="tab"
                            aria-selected={selectedLanguage === 'javascript'}
                            aria-controls="code-content"
                            id="tab-javascript"
                        >
                            JavaScript
                        </button>
                        <button
                            onClick={() => setSelectedLanguage('python')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${selectedLanguage === 'python'
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            role="tab"
                            aria-selected={selectedLanguage === 'python'}
                            aria-controls="code-content"
                            id="tab-python"
                        >
                            Python
                        </button>
                    </div>

                    {/* Syntax-highlighted code (Requirements 5.3) */}
                    <div
                        className="p-4 pt-0"
                        role="tabpanel"
                        id="code-content"
                        aria-labelledby={`tab-${selectedLanguage}`}
                    >
                        <SyntaxHighlighter
                            language={selectedLanguage}
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                lineHeight: '1.5',
                            }}
                            showLineNumbers
                        >
                            {code}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}
        </div>
    );
}
