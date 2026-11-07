import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { conceptData } from '../data/concepts';

export function ConceptPanel({ algorithm }: { algorithm: string }) {
    const markdown = conceptData[algorithm]?.markdown ?? 'Explore how this algorithm learns from data.';
    return (
        <details className="rounded-xl border border-gray-200 bg-white">
            <summary className="cursor-pointer p-4 font-semibold text-gray-900">Concept and equations</summary>
            <div className="min-w-0 px-4 pb-4 text-sm leading-relaxed text-gray-700">
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
                    {markdown}
                </ReactMarkdown>
            </div>
        </details>
    );
}
