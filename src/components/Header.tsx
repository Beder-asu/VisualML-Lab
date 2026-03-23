import { Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function Header() {
    const location = useLocation();
    
    const links = [
        { path: '/', label: 'Home' },
        { path: '/lesson/linearRegression', label: 'Linear Regression' },
        { path: '/lesson/logisticRegression', label: 'Logistic Regression' },
        { path: '/lesson/svm', label: 'SVM' },
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
                                className={`font-medium text-sm transition-colors whitespace-nowrap ${
                                    location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                                    ? 'text-indigo-600' 
                                    : 'text-gray-500 hover:text-indigo-600'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
