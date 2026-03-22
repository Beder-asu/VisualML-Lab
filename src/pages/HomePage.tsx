import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface AlgorithmCard {
    id: string
    name: string
    description: string
    category: 'regression' | 'classification'
    icon: string
}

const algorithms: AlgorithmCard[] = [
    {
        id: 'linearRegression',
        name: 'Linear Regression',
        description: 'Learn how linear regression finds the best-fit line through data points using gradient descent.',
        category: 'regression',
        icon: '📈'
    },
    {
        id: 'logisticRegression',
        name: 'Logistic Regression',
        description: 'Watch how logistic regression learns to classify data into two categories using a sigmoid function.',
        category: 'classification',
        icon: '🎯'
    },
    {
        id: 'svm',
        name: 'Support Vector Machine',
        description: 'See how SVM finds the optimal decision boundary that maximizes the margin between classes.',
        category: 'classification',
        icon: '⚡'
    }
]

const HomePage: React.FC = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        VisualML Lab
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
                        Watch machine learning algorithms learn in real-time
                    </p>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        An interactive visualization platform where you control the training process,
                        adjust parameters, and see exactly how algorithms evolve step-by-step.
                    </p>
                </div>

                {/* Interactive Preview Demo */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-16 border border-gray-200">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Interactive Learning Experience
                        </h2>
                        <p className="text-gray-600">
                            Control training with play, pause, and step buttons • Adjust hyperparameters in real-time •
                            See decision boundaries evolve • Track loss curves
                        </p>
                    </div>

                    {/* Demo Preview Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-4xl mb-3">🎮</div>
                            <h3 className="font-semibold text-gray-800 mb-2">Playback Controls</h3>
                            <p className="text-sm text-gray-600">
                                Play, pause, step through training iterations at your own pace
                            </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-4xl mb-3">🎛️</div>
                            <h3 className="font-semibold text-gray-800 mb-2">Live Parameters</h3>
                            <p className="text-sm text-gray-600">
                                Adjust learning rate and other hyperparameters with instant feedback
                            </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-4xl mb-3">📊</div>
                            <h3 className="font-semibold text-gray-800 mb-2">Real-time Visualization</h3>
                            <p className="text-sm text-gray-600">
                                Watch decision boundaries and loss curves update with each step
                            </p>
                        </div>
                    </div>
                </div>

                {/* Algorithm Cards */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Choose an Algorithm to Explore
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {algorithms.map((algo) => (
                            <Link
                                key={algo.id}
                                to={`/lesson/${algo.id}`}
                                className="block"
                                onMouseEnter={() => setHoveredCard(algo.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div
                                    className={`
                                        bg-white rounded-lg shadow-md p-6 h-full
                                        transition-all duration-200 border-2
                                        ${hoveredCard === algo.id
                                            ? 'border-primary shadow-xl transform -translate-y-1'
                                            : 'border-transparent hover:border-primary/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-start mb-4">
                                        <span className="text-4xl mr-3">{algo.icon}</span>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                {algo.name}
                                            </h3>
                                            <span className={`
                                                inline-block px-2 py-1 text-xs font-medium rounded
                                                ${algo.category === 'regression'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                                }
                                            `}>
                                                {algo.category}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {algo.description}
                                    </p>
                                    <div className="mt-4 flex items-center text-primary font-medium text-sm">
                                        Start Learning
                                        <svg
                                            className={`ml-2 w-4 h-4 transition-transform ${hoveredCard === algo.id ? 'translate-x-1' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
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
                <div className="text-center mt-16 pt-12 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">
                        Built for Learning
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <span className="text-primary mr-2">✓</span>
                                No Server Required
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Everything runs in your browser. No setup, no installation, just pure learning.
                            </p>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <span className="text-primary mr-2">✓</span>
                                Keyboard Shortcuts
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Control training efficiently with spacebar, arrow keys, and more.
                            </p>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <span className="text-primary mr-2">✓</span>
                                View the Code
                            </h3>
                            <p className="text-gray-600 text-sm">
                                See the actual implementation in JavaScript and Python side-by-side.
                            </p>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <span className="text-primary mr-2">✓</span>
                                Multiple Datasets
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Experiment with different data distributions to see how algorithms adapt.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
