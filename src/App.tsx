import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

const App: React.FC = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 w-full">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/lesson/:algorithm" element={<LessonPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    )
}

export default App
