// Common viewBox and sizing
const SVG_WRAPPER = "w-full h-full";

export const getChartSvg = (id: string) => {
    switch (id) {
        case 'bar-chart':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <rect x="15" y="40" width="15" height="45" fill="#6366f1" rx="2" />
                    <rect x="40" y="20" width="15" height="65" fill="#a5b4fc" rx="2" />
                    <rect x="65" y="55" width="15" height="30" fill="#6366f1" rx="2" />
                    <path d="M5 85 h90 m-90 0 v-80" stroke="#cbd5e1" strokeWidth="2" />
                </svg>
            );
        case 'histogram':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <rect x="10" y="60" width="16" height="25" fill="#10b981" />
                    <rect x="26" y="35" width="16" height="50" fill="#34d399" />
                    <rect x="42" y="15" width="16" height="70" fill="#10b981" />
                    <rect x="58" y="25" width="16" height="60" fill="#34d399" />
                    <rect x="74" y="55" width="16" height="30" fill="#10b981" />
                    <path d="M5 85 h90 m-90 0 v-80" stroke="#cbd5e1" strokeWidth="2" />
                </svg>
            );
        case 'line-chart':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <path d="M10 70 L30 40 L50 45 L70 20 L90 25" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="10" cy="70" r="4" fill="#fda4af" />
                    <circle cx="30" cy="40" r="4" fill="#fda4af" />
                    <circle cx="50" cy="45" r="4" fill="#fda4af" />
                    <circle cx="70" cy="20" r="4" fill="#fda4af" />
                    <circle cx="90" cy="25" r="4" fill="#fda4af" />
                    <path d="M5 85 h90 m-90 0 v-80" stroke="#cbd5e1" strokeWidth="2" />
                </svg>
            );
        case 'scatter-plot':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <circle cx="20" cy="70" r="3" fill="#6366f1" />
                    <circle cx="35" cy="55" r="4" fill="#6366f1" />
                    <circle cx="25" cy="40" r="3" fill="#6366f1" />
                    <circle cx="50" cy="65" r="5" fill="#06b6d4" />
                    <circle cx="65" cy="45" r="4" fill="#06b6d4" />
                    <circle cx="55" cy="30" r="3" fill="#06b6d4" />
                    <circle cx="80" cy="40" r="4" fill="#6366f1" />
                    <circle cx="75" cy="20" r="3" fill="#6366f1" />
                    <circle cx="90" cy="30" r="5" fill="#06b6d4" />
                    <path d="M5 85 h90 m-90 0 v-80" stroke="#cbd5e1" strokeWidth="2" />
                </svg>
            );
        case 'box-plot':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <path d="M25 20 v60 M75 30 v40 M20 20 h10 M20 80 h10 M70 30 h10 M70 70 h10" stroke="#6366f1" strokeWidth="2" />
                    <rect x="15" y="40" width="20" height="20" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" />
                    <rect x="65" y="45" width="20" height="15" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" />
                    <path d="M15 50 h20 M65 52 h20" stroke="#4f46e5" strokeWidth="2" />
                    <circle cx="25" cy="12" r="2" fill="#94a3b8" />
                    <circle cx="75" cy="80" r="2" fill="#94a3b8" />
                </svg>
            );
        case 'pie-chart':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <circle cx="50" cy="50" r="40" fill="#10b981" />
                    <path d="M50 50 L90 50 A40 40 0 0 1 50 90 Z" fill="#f43f5e" />
                    <path d="M50 50 L50 90 A40 40 0 0 1 10 50 Z" fill="#6366f1" />
                </svg>
            );
        case 'heatmap':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <rect x="10" y="10" width="20" height="20" fill="#f43f5e" opacity="0.9" rx="2" />
                    <rect x="35" y="10" width="20" height="20" fill="#f43f5e" opacity="0.4" rx="2" />
                    <rect x="60" y="10" width="20" height="20" fill="#6366f1" opacity="0.2" rx="2" />
                    <rect x="10" y="35" width="20" height="20" fill="#f43f5e" opacity="0.5" rx="2" />
                    <rect x="35" y="35" width="20" height="20" fill="#6366f1" opacity="0.4" rx="2" />
                    <rect x="60" y="35" width="20" height="20" fill="#6366f1" opacity="0.8" rx="2" />
                    <rect x="10" y="60" width="20" height="20" fill="#f43f5e" opacity="0.2" rx="2" />
                    <rect x="35" y="60" width="20" height="20" fill="#6366f1" opacity="0.5" rx="2" />
                    <rect x="60" y="60" width="20" height="20" fill="#6366f1" opacity="1.0" rx="2" />
                    <path d="M5 90 h80 m-80 0 v-80" stroke="#cbd5e1" strokeWidth="2" />
                </svg>
            );
        case 'area-chart':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <path d="M10 70 L30 50 L50 60 L70 30 L90 40 V85 H10 Z" fill="#a5b4fc" opacity="0.6" />
                    <path d="M10 50 L30 20 L50 40 L70 15 L90 20 V85 H10 Z" fill="#10b981" opacity="0.4" />
                    <path d="M10 70 L30 50 L50 60 L70 30 L90 40" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 50 L30 20 L50 40 L70 15 L90 20" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 85 h90 m-90 0 v-80" stroke="#cbd5e1" strokeWidth="2" />
                </svg>
            );
        case 'violin-plot':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <path d="M30 20 C20 40 40 60 30 80 C20 60 40 40 30 20" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
                    <path d="M70 10 C50 40 90 70 70 90 C50 70 90 40 70 10" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" />
                    <rect x="29" y="45" width="2" height="15" fill="#881337" />
                    <rect x="69" y="40" width="2" height="20" fill="#312e81" />
                </svg>
            );
        case 'pair-plot':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    {/* Matrix Grid Lines */}
                    <path d="M5 5 h90 v90 h-90 z M35 5 v90 M65 5 v90 M5 35 h90 M5 65 h90" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Diagonal Distributions */}
                    <path d="M5 35 Q20 5 35 35 Z" fill="#6366f1" opacity="0.5" />
                    <path d="M35 65 Q50 35 65 65 Z" fill="#10b981" opacity="0.5" />
                    <path d="M65 95 Q80 65 95 95 Z" fill="#f43f5e" opacity="0.5" />

                    {/* Scatter 1 */}
                    <circle cx="50" cy="20" r="1.5" fill="#475569" /><circle cx="55" cy="25" r="1.5" fill="#475569" /><circle cx="45" cy="15" r="1.5" fill="#475569" />
                    {/* Scatter 2 */}
                    <circle cx="80" cy="20" r="1.5" fill="#475569" /><circle cx="85" cy="15" r="1.5" fill="#475569" /><circle cx="75" cy="25" r="1.5" fill="#475569" />
                    {/* Scatter 3 */}
                    <circle cx="20" cy="50" r="1.5" fill="#475569" /><circle cx="25" cy="55" r="1.5" fill="#475569" /><circle cx="15" cy="45" r="1.5" fill="#475569" />
                    {/* Scatter 4 */}
                    <circle cx="80" cy="50" r="1.5" fill="#475569" /><circle cx="85" cy="55" r="1.5" fill="#475569" /><circle cx="75" cy="45" r="1.5" fill="#475569" />
                </svg>
            );
        case 'radar-chart':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    {/* Web Lines */}
                    <polygon points="50,10 90,40 75,85 25,85 10,40" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <polygon points="50,30 70,45 62,65 38,65 30,45" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <path d="M50 50 L50 10 M50 50 L90 40 M50 50 L75 85 M50 50 L25 85 M50 50 L10 40" stroke="#cbd5e1" strokeWidth="1" />
                    {/* Data Polygon 1 */}
                    <polygon points="50,20 70,40 60,70 40,60 20,45" fill="#6366f1" opacity="0.4" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
                    {/* Data Polygon 2 */}
                    <polygon points="50,40 85,45 55,80 30,70 25,35" fill="#f43f5e" opacity="0.4" stroke="#f43f5e" strokeWidth="2" strokeLinejoin="round" />
                </svg>
            );
        case 'geospatial-map':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <path d="M10 30 Q20 10 40 20 T60 10 T90 30 Q100 50 80 70 T50 90 T20 70 Z" fill="#06b6d4" opacity="0.2" stroke="#0891b2" strokeWidth="1" />
                    <circle cx="30" cy="40" r="6" fill="#f59e0b" opacity="0.8" />
                    <circle cx="55" cy="30" r="10" fill="#f43f5e" opacity="0.6" />
                    <circle cx="70" cy="60" r="4" fill="#6366f1" opacity="0.8" />
                    <circle cx="20" cy="65" r="8" fill="#10b981" opacity="0.7" />
                </svg>
            );
        case 'animation-graph':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    <path d="M10 70 Q30 30 50 50 T90 20" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,5" />
                    <path d="M10 70 Q30 30 50 50 T75 35" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="75" cy="35" r="6" fill="#f43f5e" />
                    {/* Play Button Icon in Center */}
                    <circle cx="50" cy="50" r="15" fill="#0f172a" opacity="0.7" />
                    <polygon points="45,42 45,58 58,50" fill="#ffffff" />
                </svg>
            );
        case 'dashboard':
            return (
                <svg viewBox="0 0 100 100" className={SVG_WRAPPER} fill="none">
                    {/* Grid Layout Backgrounds */}
                    <rect x="5" y="5" width="55" height="40" fill="#f1f5f9" rx="3" />
                    <rect x="65" y="5" width="30" height="40" fill="#f1f5f9" rx="3" />
                    <rect x="5" y="50" width="30" height="45" fill="#f1f5f9" rx="3" />
                    <rect x="40" y="50" width="55" height="45" fill="#f1f5f9" rx="3" />
                    {/* Mini Line */}
                    <path d="M10 35 L20 15 L30 25 L40 10 L50 20" stroke="#f43f5e" strokeWidth="2" />
                    {/* Mini Pie */}
                    <circle cx="80" cy="25" r="12" fill="#10b981" />
                    <path d="M80 25 L92 25 A12 12 0 0 1 80 37 Z" fill="#6366f1" />
                    {/* Mini Bar */}
                    <rect x="10" y="75" width="5" height="15" fill="#a5b4fc" />
                    <rect x="18" y="65" width="5" height="25" fill="#a5b4fc" />
                    <rect x="26" y="55" width="5" height="35" fill="#6366f1" />
                    {/* Mini Scatter */}
                    <circle cx="50" cy="80" r="2" fill="#06b6d4" />
                    <circle cx="65" cy="65" r="3" fill="#06b6d4" />
                    <circle cx="80" cy="70" r="2" fill="#06b6d4" />
                    <circle cx="75" cy="85" r="3" fill="#06b6d4" />
                </svg>
            );
        default:
            return <div className="bg-gray-100 w-full h-full rounded-xl"></div>;
    }
};
