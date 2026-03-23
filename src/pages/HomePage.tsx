import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Target, Zap, PlayCircle, Sliders, Activity, Check, HelpCircle } from 'lucide-react'
import { NetworkBackground } from '../components/NetworkBackground'
import { useTutorial } from '../contexts/TutorialContext'

interface AlgorithmCard {
    id: string
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
    }
]

const HomePage: React.FC = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)
    const { startTutorial } = useTutorial()

    return (
        <div className="min-h-[calc(100vh-130px)] bg-gray-50 flex flex-col relative overflow-hidden">
            {/* Interactive Network Canvas */}
            <NetworkBackground />

            {/* Hero Section */}
            <section className="px-6 py-20 md:py-28 max-w-6xl mx-auto relative z-10 w-full flex-1 pointer-events-none">
                <div className="text-center mb-20 pointer-events-auto">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-50/90 backdrop-blur-sm border border-indigo-100 text-indigo-700 text-sm font-semibold tracking-wide uppercase shadow-sm">
                        Interactive Learning
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-sm">
                        VisualML <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Lab</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto font-normal drop-shadow-sm">
                        Watch machine learning algorithms learn in real-time
                    </p>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto drop-shadow-sm bg-white/40 p-2 rounded-xl backdrop-blur-sm border border-white/40">
                        An interactive visualization platform where you control the training process,
                        tune hyperparameters dynamically, and see exact mathematical convergence step-by-step.
                    </p>

                    <div className="mt-8 flex justify-center pointer-events-auto">
                        <button
                            id="how-it-works-btn"
                            onClick={() => startTutorial()}
                            className="hidden bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2 hover:shadow-indigo-500/50"
                        >
                            <HelpCircle size={20} />
                            How does it work?
                        </button>
                    </div>
                </div>

                {/* Interactive Preview Demo */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl p-8 md:p-12 mb-24 border border-white/60 pointer-events-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                                Complete Training Control
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Control the learning process step-by-step. Adjust hyperparameters in real-time, see decision boundaries evolve, and watch the math come to life.
                            </p>
                            <ul className="space-y-5">
                                <li className="flex items-center text-gray-700 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mr-4 text-indigo-600 shadow-sm border border-indigo-100">
                                        <PlayCircle size={20} />
                                    </div>
                                    Full playback control over training iterations
                                </li>
                                <li className="flex items-center text-gray-700 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mr-4 text-emerald-600 shadow-sm border border-emerald-100">
                                        <Sliders size={20} />
                                    </div>
                                    Live parameter tuning with instant feedback
                                </li>
                                <li className="flex items-center text-gray-700 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mr-4 text-rose-600 shadow-sm border border-rose-100">
                                        <Activity size={20} />
                                    </div>
                                    Real-time loss curve analysis
                                </li>
                            </ul>
                        </div>

                        {/* Mini Canvas Animation */}
                        <div className="relative h-80 bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-2xl flex items-center justify-center border border-slate-700 hidden md:flex">
                            {/* Animated SVG to simulate regression */}
                            <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="100%" stopColor="#22d3ee" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                {/* Grid lines */}
                                <g stroke="#334155" strokeWidth="1" opacity="0.4">
                                    <line x1="0" y1="100" x2="400" y2="100" />
                                    <line x1="0" y1="200" x2="400" y2="200" />
                                    <line x1="100" y1="0" x2="100" y2="300" />
                                    <line x1="200" y1="0" x2="200" y2="300" />
                                    <line x1="300" y1="0" x2="300" y2="300" />
                                </g>
                                {/* Data points */}
                                <g fill="#94a3b8">
                                    <circle cx="60" cy="220" r="5" fillOpacity="0.9">
                                        <animate attributeName="cy" values="220;215;220" dur="3s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx="130" cy="180" r="5" fillOpacity="0.9">
                                        <animate attributeName="cy" values="180;185;180" dur="4s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx="200" cy="160" r="5" fillOpacity="0.9">
                                        <animate attributeName="cy" values="160;155;160" dur="3.5s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx="270" cy="110" r="5" fillOpacity="0.9">
                                        <animate attributeName="cy" values="110;115;110" dur="4.2s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx="340" cy="80" r="5" fillOpacity="0.9">
                                        <animate attributeName="cy" values="80;75;80" dur="3.8s" repeatCount="indefinite" />
                                    </circle>
                                </g>
                                {/* Animated Fit Line */}
                                <path
                                    d="M20,260 L380,40"
                                    stroke="url(#lineGrad)"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    fill="none"
                                    filter="url(#glow)"
                                >
                                    <animate
                                        attributeName="d"
                                        values="M20,200 L380,100; M20,260 L380,40; M20,200 L380,100"
                                        dur="5s"
                                        repeatCount="indefinite"
                                        calcMode="spline"
                                        keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                                    />
                                </path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Algorithm Cards */}
                <div className="mb-20 pointer-events-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center tracking-tight">
                        Choose an Algorithm to Explore
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
                        {algorithms.map((algo) => (
                            <Link
                                key={algo.id}
                                id={`algo-${algo.id}`}
                                to={`/lesson/${algo.id}`}
                                className="block group"
                                onMouseEnter={() => setHoveredCard(algo.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div
                                    className={`
                                        bg-white/80 backdrop-blur-md rounded-2xl p-8 h-full
                                        transition-all duration-300 border border-white
                                        relative overflow-hidden
                                        ${hoveredCard === algo.id
                                            ? 'shadow-2xl shadow-indigo-500/10 transform -translate-y-2 border-indigo-100 bg-white'
                                            : 'shadow-lg shadow-gray-200/50 hover:border-indigo-50/50'
                                        }
                                    `}
                                >
                                    {/* Subtle gradient hover glow */}
                                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-0 transition-opacity duration-300 blur-md -z-10 ${hoveredCard === algo.id ? 'opacity-20' : ''}`}></div>

                                    <div className="flex flex-col items-start mb-6">
                                        <div className={`p-4 rounded-xl mb-6 transition-colors duration-300 ${algo.category === 'regression' ? 'bg-indigo-50' :
                                                algo.id === 'svm' ? 'bg-amber-50' : 'bg-emerald-50'
                                            }`}>
                                            {algo.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                {algo.name}
                                            </h3>
                                            <span className={`
                                                inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md
                                                ${algo.category === 'regression'
                                                    ? 'bg-blue-100/80 text-blue-800'
                                                    : 'bg-green-100/80 text-green-800'
                                                }
                                            `}>
                                                {algo.category}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-base leading-relaxed">
                                        {algo.description}
                                    </p>
                                    <div className={`mt-8 flex items-center font-bold text-sm tracking-wide transition-colors ${hoveredCard === algo.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                                        START LEARNING
                                        <svg
                                            className={`ml-2 w-5 h-5 transition-transform duration-300 ${hoveredCard === algo.id ? 'translate-x-1' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2.5}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Features Section */}
                <div className="text-center pt-16 border-t border-gray-200/80 max-w-5xl mx-auto relative z-20 pointer-events-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">
                        Built for Educational Clarity
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-700">
                                <Check size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Browser Native</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Runs entirely in client without heavy server backends</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-700">
                                <Check size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Shortcuts Ready</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Spacebar, arrows, and hotkeys for rapid flow</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-700">
                                <Check size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Real Code Views</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">JS and Python mathematical mappings</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-700">
                                <Check size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Custom Datasets</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Experiment live with diverse distributions</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
