import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

const LessonPage = React.lazy(() => import('./pages/LessonPage'))
const DataVizCheatSheetPage = React.lazy(() => import('./pages/DataVizCheatSheetPage'))
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { LessonProgressProvider } from './contexts/LessonProgress'

const App: React.FC = () => {
    return (
        <Router>
            <LessonProgressProvider>
                <ScrollToTop />
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60] focus:rounded focus:bg-white focus:p-3 focus:text-indigo-700">
                        Skip to main content
                    </a>
                    <Header />
                    <main id="main-content" tabIndex={-1} className="flex-1 w-full relative z-0 scroll-mt-20">
                        <Suspense fallback={
                            <div className="flex items-center justify-center min-h-[60vh]">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        }>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/eda-cheatsheet" element={<DataVizCheatSheetPage />} />
                                <Route path="/lesson/:algorithm" element={<LessonPage />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <Footer />
                </div>
            </LessonProgressProvider>
        </Router>
    )
}

export default App
