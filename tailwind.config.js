/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5',    // Indigo
                secondary: '#14B8A6',  // Teal
                background: '#F9FAFB', // Light gray
                error: '#F97316',      // Orange
                success: '#22C55E',    // Green
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
