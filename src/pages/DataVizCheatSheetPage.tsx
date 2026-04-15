import React, { useState } from 'react';
import { visualizationCheatSheet } from '../data/visualizationCheatSheet';
import { ChartCard } from '../components/ChartCard';
import { NetworkBackground } from '../components/NetworkBackground';
import { BarChart3, Filter, Search } from 'lucide-react';

export const DataVizCheatSheetPage: React.FC = () => {
    const [activeGoalFilter, setActiveGoalFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // Simplify goals for filter to make them clean and avoid multi-line items
    const rawGoals = Array.from(new Set(visualizationCheatSheet.map(c => c.analyticalGoal.split(' / ')[0].split(' + ')[0])));
    const goals = ['All', ...rawGoals];

    const filteredCharts = visualizationCheatSheet.filter(chart => {
        const matchesGoal = activeGoalFilter === 'All' || chart.analyticalGoal.includes(activeGoalFilter);
        const matchesSearch = chart.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGoal && matchesSearch;
    });

    return (
        <div className="min-h-[calc(100vh-130px)] bg-gray-50 flex flex-col relative overflow-hidden">
            <NetworkBackground />
            
            <div className="px-6 py-16 md:py-24 max-w-7xl mx-auto relative z-10 w-full flex-1">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-indigo-50/90 backdrop-blur-sm border border-indigo-100 text-indigo-700 text-sm font-semibold tracking-wide uppercase shadow-sm">
                        <BarChart3 size={16} />
                        Data Preparation & EDA
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-sm">
                        Data Visualization <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Cheat Sheet</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto font-normal drop-shadow-sm">
                        Choose the right chart for your analytical goal. A clean, decision-focused guide to essential data visualizations.
                    </p>
                </div>

                {/* Filters & Search Section */}
                <div className="mb-10 max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex-1 w-full relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search models (e.g., Violin, Heatmap...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/80 backdrop-blur-md border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
                        />
                    </div>

                    <div className="flex-2 w-full md:w-auto">
                        <div className="flex items-center text-gray-500 font-bold mb-3 text-sm px-2">
                            <Filter size={16} className="mr-2" />
                            Filter by Goal
                        </div>
                        <div className="flex flex-wrap items-center gap-3 px-2">
                            {goals.map(goal => (
                            <button
                                key={goal}
                                onClick={() => setActiveGoalFilter(goal)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                                    activeGoalFilter === goal 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200/50 scale-105' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm'
                                }`}
                            >
                                {goal}
                            </button>
                        ))}
                    </div>
                </div>
                </div>

                {/* Grid Section */}
                {filteredCharts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No charts found for this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCharts.map(chart => (
                            <ChartCard key={chart.id} chart={chart} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataVizCheatSheetPage;
