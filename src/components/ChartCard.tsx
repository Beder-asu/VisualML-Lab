import React, { useState, useEffect } from 'react';
import { ChartDef } from '../data/visualizationCheatSheet';
import { X, Code2, ChevronDown, ChevronUp, Eye, Copy, Check } from 'lucide-react';
import { getChartSvg } from './ChartSVGs';

interface ChartCardProps {
    chart: ChartDef;
}

export const ChartCard: React.FC<ChartCardProps> = ({ chart }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCodeSectionOpen, setIsCodeSectionOpen] = useState(false);
    const [expandedCode, setExpandedCode] = useState<string | null>(chart.codeSnippets[0]?.library || null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Close on Escape Key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    const handleCopy = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <>
            {/* The Summary Card */}
            <div
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col h-full cursor-pointer"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {chart.name}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${chart.cognitiveLoad === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                            chart.cognitiveLoad === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                        }`}>
                        {chart.cognitiveLoad}
                    </span>
                </div>

                <p className="text-sm text-gray-500 mb-4 font-medium italic">
                    Goal: <span className="text-gray-800 not-italic">{chart.analyticalGoal}</span>
                </p>

                {/* Dynamic Height Lists */}
                <div className="flex flex-col gap-3 text-sm flex-1 mb-4">
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50 flex flex-col flex-1">
                        <span className="font-bold text-emerald-800 block mb-1 flex-none">When to Use</span>
                        <ul className="text-emerald-700/80 space-y-1 list-disc list-outside ml-3">
                            {chart.whenToUse.map((item, i) => (
                                <li key={i} className="text-sm leading-snug">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100/50 flex flex-col flex-1">
                        <span className="font-bold text-rose-800 block mb-1 flex-none">Avoid When</span>
                        <ul className="text-rose-700/80 space-y-1 list-disc list-outside ml-3">
                            {chart.avoidWhen.map((item, i) => (
                                <li key={i} className="text-sm leading-snug">{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto align-bottom pb-1 flex-none">
                    {chart.variableStructure.map((vs, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-md font-bold tracking-wide border border-slate-200 uppercase">
                            {vs.split(':')[0]}
                        </span>
                    ))}
                </div>
            </div>

            {/* The Deep Dive Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setIsModalOpen(false)}>
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"></div>
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-slate-50">
                            <div className="flex gap-8 items-center w-full">
                                {/* The Example SVG Icon/Chart */}
                                <div className="w-32 h-32 flex-none bg-white rounded-2xl shadow-sm border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
                                    {getChartSvg(chart.svgId)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between w-full">
                                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{chart.name}</h2>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors flex-none self-start"
                                        >
                                            <X size={26} />
                                        </button>
                                    </div>
                                    <p className="text-indigo-600 font-bold mt-2 text-lg">{chart.analyticalGoal} Analysis</p>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {chart.variableStructure.map((vs, i) => (
                                            <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-lg font-bold border border-indigo-200">
                                                {vs}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">

                            {/* How to Read Section */}
                            <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                                <h4 className="font-bold text-indigo-900 mb-4 flex items-center text-lg">
                                    <Eye className="mr-2" size={20} /> How to Read This Chart
                                </h4>
                                <ul className="space-y-3">
                                    {chart.howToRead.map((item, idx) => (
                                        <li key={idx} className="flex font-medium text-slate-700 items-start">
                                            <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm border border-slate-200 mr-3 mt-0.5 flex-none text-indigo-600">
                                                {idx + 1}
                                            </div>
                                            <span className="leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">When to Use</h4>
                                    <ul className="space-y-2">
                                        {chart.whenToUse.map((item, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-emerald-500 mr-2 font-bold font-mono">+</span>
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Avoid When</h4>
                                    <ul className="space-y-2">
                                        {chart.avoidWhen.map((item, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-rose-500 mr-2 font-bold font-mono">-</span>
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-t border-b border-gray-100 py-8">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Data Requirements</h4>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        {chart.dataRequirements.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Encoding Information</h4>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        {chart.howItEncodesInformation.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Interpretation</h4>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        {chart.interpretationNotes.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="mb-8 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                                <h4 className="font-bold text-indigo-900 mb-2">Quick Example</h4>
                                <p className="text-indigo-700 font-medium">"{chart.quickExampleUseCase}"</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Variants</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {chart.variants.map((v, i) => (
                                            <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">{v}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Extensions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {chart.extensions.map((e, i) => (
                                            <span key={i} className="bg-white border border-gray-200 text-gray-600 shadow-sm px-3 py-1.5 rounded-lg text-sm">{e}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Code Snippets Section */}
                            <div className="border border-gray-200 rounded-2xl overflow-hidden mt-6">
                                <button
                                    className="w-full bg-slate-50 flex items-center justify-between p-4 focus:outline-none hover:bg-slate-100 transition-colors"
                                    onClick={() => setIsCodeSectionOpen(!isCodeSectionOpen)}
                                >
                                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                                        <Code2 size={20} className="text-indigo-500" />
                                        Implementation Code
                                    </div>
                                    {isCodeSectionOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                </button>

                                {isCodeSectionOpen && (
                                    <div className="p-0 border-t border-gray-200">
                                        <div className="flex gap-2 border-b border-gray-700 p-2 bg-gray-900">
                                            {chart.codeSnippets.map((snippet) => (
                                                <button
                                                    key={snippet.library}
                                                    onClick={() => setExpandedCode(expandedCode === snippet.library ? null : snippet.library)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors ${expandedCode === snippet.library
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {snippet.library}
                                                    {expandedCode === snippet.library ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Expanded Code View */}
                                        <div className="bg-[#1e1e1e] p-4 relative">
                                            {chart.codeSnippets.map((snippet, idx) => (
                                                expandedCode === snippet.library && (
                                                    <div key={snippet.library} className="relative group">
                                                        <button
                                                            onClick={() => handleCopy(snippet.code, idx)}
                                                            className="absolute top-2 right-2 bg-gray-700/80 hover:bg-gray-600 p-2 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center"
                                                            aria-label="Copy code"
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <Check size={16} className="text-emerald-400" />
                                                            ) : (
                                                                <Copy size={16} className="text-gray-300" />
                                                            )}
                                                        </button>
                                                        <pre className="text-sm font-mono text-indigo-200 overflow-x-auto custom-scrollbar pb-2 pt-1 pr-12 whitespace-pre">
                                                            {snippet.code}
                                                        </pre>
                                                    </div>
                                                )
                                            ))}
                                            {!expandedCode && (
                                                <div className="text-gray-500 text-center py-4 italic">
                                                    Select a library above to view the implementation code.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
