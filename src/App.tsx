import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

const LessonPage = React.lazy(() => import('./pages/LessonPage'))
const DataVizCheatSheetPage = React.lazy(() => import('./pages/DataVizCheatSheetPage'))
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
                                <Route path="/" element={<HomePage />} />
                                <Route path="/eda-cheatsheet" element={<DataVizCheatSheetPage />} />
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
