/**
 * ConceptPanel.tsx — Lesson concept explanation panel
 * 
 * Displays lesson title, description, and mathematical logic via Markdown.
 * Requirements: 6.1
 */

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { conceptData } from '../data/concepts';

interface ConceptPanelProps {
    algorithm: string;
}

export function ConceptPanel({ algorithm }: ConceptPanelProps) {
    const content = conceptData[algorithm] || {
        title: 'Machine Learning Algorithm',
        markdown: 'Explore how this algorithm learns from data.'
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
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
    );
}
