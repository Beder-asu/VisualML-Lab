import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
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
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/lesson/:algorithm" element={<LessonPage />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </TutorialProvider>
        </Router>
    )
}

export default App
