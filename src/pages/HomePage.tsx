import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Target, Zap, GitBranch, ArrowRight } from 'lucide-react'
import { NetworkBackground } from '../components/NetworkBackground'
import { useLessonProgress } from '../contexts/LessonProgress'
import { lessonIds, lessonTitles, type LessonId } from '../data/lessons'

interface AlgorithmCard {
    id: LessonId
    name: string
    description: string
    category: 'regression' | 'classification'
    icon: React.ReactNode
}

const algorithms: AlgorithmCard[] = [
    {
        id: 'linearRegression',
        name: 'Linear Regression',
        description: 'Learn how linear regression finds the best-fit line through data points using gradient descent.',
        category: 'regression',
        icon: <LineChart className="w-8 h-8 text-indigo-500" />
    },
    {
        id: 'logisticRegression',
        name: 'Logistic Regression',
        description: 'Watch how logistic regression learns to classify data into two categories using a sigmoid function.',
        category: 'classification',
        icon: <Target className="w-8 h-8 text-emerald-500" />
    },
    {
        id: 'svm',
        name: 'Support Vector Machine',
        description: 'See how SVM finds the optimal decision boundary that maximizes the margin between classes.',
        category: 'classification',
        icon: <Zap className="w-8 h-8 text-amber-500" />
    },
    {
        id: 'decisionTree',
        name: 'Decision Tree',
        description: 'Watch a decision tree grow level-by-level and see how it partitions the feature space into rectangular regions.',
        category: 'classification',
        icon: <GitBranch className="w-8 h-8 text-purple-500" />
    }
]


const HomePage: React.FC = () => {
    const tracker = useLessonProgress();
    const [confirmClear, setConfirmClear] = useState(false);
    const clearButton = useRef<HTMLButtonElement>(null);
    const lessons = tracker?.progress.lessons;
    const last = tracker?.progress.lastLesson;
    const next = last && lessons?.[last] !== 'complete'
        ? last
        : lessonIds.find(id => lessons?.[id] !== 'complete');
    const completed = lessonIds.filter(id => lessons?.[id] === 'complete').length;
    const hasProgress = lessonIds.some(id => Boolean(lessons?.[id]));
    const primaryLabel = !next ? 'Review lessons'
        : last === next ? 'Continue ' + lessonTitles[next]
        : hasProgress ? 'Start next lesson' : 'Start first lesson';

    return (
        <div className="relative min-h-screen bg-gray-50">
            <NetworkBackground />
            <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
                <section className="mb-12 max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-6xl">VisualML Lab</h1>
                    <p className="mt-4 text-lg text-gray-700">
                        Step through a machine learning model and see how each update changes its predictions.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link to={next ? '/lesson/' + next : '/#lessons'}
                            onClick={next ? undefined : () => document.getElementById('lessons')?.focus()}
                            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800">
                            {primaryLabel}<ArrowRight size={18} aria-hidden="true" />
                        </Link>
                        <Link to="/lesson/linearRegression?guide=1" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold text-indigo-800 hover:bg-indigo-50">
                            Start guided lesson
                        </Link>
                    </div>
                    {last === next && last && <p className="mt-2 text-sm text-gray-700">Opens the lesson with a fresh training run.</p>}
                </section>

                <section id="lessons" tabIndex={-1} aria-labelledby="lesson-list-title" className="scroll-mt-20">
                    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                        <h2 id="lesson-list-title" className="text-2xl font-semibold text-gray-900">Choose a lesson</h2>
                        <p className="text-sm font-medium text-gray-700">{completed} of 4 lessons complete</p>
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {algorithms.map(({id, name, description, icon}) => {
                            const status = lessons?.[id];
                            return (
                                <li key={id}>
                                    <Link to={'/lesson/' + id}
                                        className="flex h-full gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">
                                        <span aria-hidden="true">{icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{name}</h3>
                                            <p className="mt-1 text-sm text-gray-700">{description}</p>
                                            <p className="mt-2 text-xs font-medium text-indigo-800">
                                                {status === 'complete' ? 'Complete' : status === 'visited' ? 'Visited' : 'Not started'}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    {tracker?.persistent === false && <p className="mt-3 text-sm text-gray-700" role="status">Progress is available for this session. It will be lost when you reload.</p>}
                    {hasProgress && (
                        <button ref={clearButton} type="button" aria-expanded={confirmClear} aria-controls="clear-progress-confirmation"
                            className="mt-3 min-h-11 text-sm font-medium text-gray-700 underline" onClick={() => setConfirmClear(!confirmClear)}>
                            Clear lesson progress
                        </button>
                    )}
                    {hasProgress && confirmClear && (
                        <div id="clear-progress-confirmation" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm">
                            <p>Clear all lesson visits and completions in this browser?</p>
                            <div className="mt-2 flex gap-3">
                                <button type="button" className="min-h-11 font-semibold text-red-800" onClick={() => {
                                    tracker?.clear();
                                    setConfirmClear(false);
                                    document.getElementById('lessons')?.focus();
                                }}>Clear progress</button>
                                <button type="button" className="min-h-11 font-semibold text-gray-800" onClick={() => {
                                    setConfirmClear(false);
                                    clearButton.current?.focus();
                                }}>Cancel</button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-12 max-w-2xl" aria-labelledby="preview-title">
                    <h2 id="preview-title" className="text-xl font-semibold text-gray-900">What a training step changes</h2>
                    <svg role="img" aria-label="Illustration of a fitted line moving closer to three data points" viewBox="0 0 300 120" className="mt-3 w-full max-w-md rounded-xl border border-gray-200 bg-white">
                        <path d="M20 100 H280 M20 100 V18" fill="none" stroke="#9ca3af" />
                        <path d="M28 83 L270 65" stroke="#6b7280" strokeDasharray="5 4" fill="none" />
                        <path d="M28 88 L270 25" stroke="#4338ca" strokeWidth="2" fill="none" />
                        <circle cx="65" cy="73" r="4" fill="#374151" />
                        <circle cx="152" cy="53" r="4" fill="#374151" />
                        <circle cx="232" cy="35" r="4" fill="#374151" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-700">The solid line is closer to the data points than the dashed line.</p>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
