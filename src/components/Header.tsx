import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';

export function Header() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const links = [
        { path: '/', label: 'Home' },
        { path: '/eda-cheatsheet', label: 'EDA Cheat Sheet' },
        { path: '/lesson/linearRegression', label: 'Linear Regression' },
        { path: '/lesson/logisticRegression', label: 'Logistic Regression' },
        { path: '/lesson/svm', label: 'SVM' },
        { path: '/lesson/decisionTree', label: 'Decision Tree' },
    ];

    return (
        <header id="main-navbar" className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Brand / Logo Placeholder */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                            <Activity size={20} className="stroke-[2.5]" />
                        </div>
                        <Link to="/" className="font-bold text-xl text-gray-900 tracking-tight hover:opacity-80 transition-opacity">
                            VisualML Lab
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex gap-6 items-center">
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`font-medium text-sm transition-colors whitespace-nowrap ${location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                                        ? 'text-indigo-600'
                                        : 'text-gray-500 hover:text-indigo-600'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <nav className="flex flex-col px-4 pt-2 pb-4 space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                    location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
