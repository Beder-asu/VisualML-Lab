/**
 * ConceptPanel.tsx — Lesson concept explanation panel
 * 
 * Displays lesson title, description, and mathematical logic via Markdown.
 * Extended with a horizontal top rail to toggle between Concept, Python, and JS code views.
 * Requirements: 6.1
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { conceptData } from '../data/concepts';
import { getAlgorithmCode } from '../utils/codeContent';

// Imports for code highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BookOpen, FileCode2, Code2 } from 'lucide-react';

interface ConceptPanelProps {
    algorithm: string;
}

type TabState = 'concept' | 'python' | 'javascript';

export function ConceptPanel({ algorithm }: ConceptPanelProps) {
    const [activeTab, setActiveTab] = useState<TabState>('concept');
    
    const content = conceptData[algorithm] || {
        title: 'Machine Learning Algorithm',
        markdown: 'Explore how this algorithm learns from data.'
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden" style={{ minHeight: '600px' }}>
            {/* Horizontal Tabs Top Rail */}
            <div className="w-full bg-gray-50 border-b border-gray-200 flex items-center px-4 py-3 gap-2 flex-shrink-0 z-10">
                <button 
                    onClick={() => setActiveTab('concept')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'concept' ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    title="Concept Explanation"
                >
                    <BookOpen size={16} />
                    Concept
                </button>
                <div className="h-5 w-px bg-gray-300 mx-1"></div>
                <button 
                    onClick={() => setActiveTab('python')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'python' ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    title="Python Implementation"
                >
                    <FileCode2 size={16} />
                    Python
                </button>
                <button 
                    onClick={() => setActiveTab('javascript')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'javascript' ? 'bg-yellow-100 text-yellow-700 shadow-inner' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    title="JavaScript Implementation"
                >
                    <Code2 size={16} />
                    JS
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'concept' ? (
                    <div className="animate-in fade-in duration-300">
                        {/* Lesson title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{content.title}</h2>

                        {/* Markdown Content */}
                        <div className="text-gray-600 leading-relaxed text-sm">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mt-2 mb-4 space-y-1" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mt-2 mb-4 space-y-1" {...props} />,
                                    li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-4 bg-gray-50 py-2" {...props} />,
                                    code: ({node, className, children, ...props}) => (
                                        <code 
                                            className="bg-gray-100 text-indigo-600 px-1 py-0.5 rounded text-xs font-mono" 
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    )
                                }}
                            >
                                {content.markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300 h-full flex flex-col">
                        <div className="flex-1 overflow-hidden rounded-lg shadow-sm border border-gray-200 -mt-2 -mx-2 mb-[-1rem]">
                            <SyntaxHighlighter
                                language={activeTab}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    height: '100%',
                                    borderRadius: '0',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                }}
                                showLineNumbers
                            >
                                {getAlgorithmCode(algorithm, activeTab)}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
