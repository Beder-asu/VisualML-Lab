import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'

const LessonPage = React.lazy(() => import('./pages/LessonPage'))
const DataVizCheatSheetPage = React.lazy(() => import('./pages/DataVizCheatSheetPage'))
const DatasetExplorerPage = React.lazy(() => import('./pages/DatasetExplorerPage'))
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { TutorialProvider } from './contexts/TutorialContext'

const App: React.FC = () => {
    return (
        <Router>
            <TutorialProvider>
                <ScrollToTop />
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Header />
                    <main className="flex-1 w-full relative z-0">
                        <Suspense fallback={
                            <div className="flex items-center justify-center min-h-[60vh]">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        }>
                            <Routes>
                                <Route path="/" element={<>
                                    <HomePage />
                                    <section aria-labelledby="explore-data-heading" className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
                                        <h2 id="explore-data-heading" className="text-xl font-semibold">Explore your own data</h2>
                                        <p className="mt-1 text-sm text-gray-700">Preview a CSV and plot its numeric columns.</p>
                                        <Link to="/dataset-explorer" className="mt-2 inline-flex min-h-11 items-center font-semibold text-indigo-800 underline">Open Dataset Explorer</Link>
                                    </section>
                                </>} />
                                <Route path="/eda-cheatsheet" element={<DataVizCheatSheetPage />} />
                                <Route path="/dataset-explorer" element={<DatasetExplorerPage />} />
                                <Route path="/lesson/:algorithm" element={<LessonPage />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <Footer />
                </div>
            </TutorialProvider>
        </Router>
    )
}

export default App
