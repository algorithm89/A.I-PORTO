import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header           from './components/Header'
import Hero             from './components/Hero'
import StoriesSection   from './components/StoriesSection'
import CartoonBelt      from './components/CartoonBelt'
import OriginalCartoon  from './components/OriginalCartoon'
import AISection        from './components/AISection'
import CategoryCards    from './components/CategoryCards'
import Footer           from './components/Footer'
import ChatBot          from './components/ChatBot'
import ScrollToTop      from './components/ScrollToTop'
import BlogPage         from './pages/BlogPage'
import TutorialsPage    from './pages/TutorialsPage'
import TutorialPage     from './pages/TutorialPage'
import CartoonBlogPage  from './pages/CartoonBlogPage'
import NeonSpiritEpPage from './pages/NeonSpiritEp1Page'
import AboutPage        from './pages/AboutPage'
import ProtectedRoute   from './components/ProtectedRoute'

function HomePage() {
  return (
    <>
      <Hero />
      <StoriesSection />
      <CartoonBelt />
      <OriginalCartoon />
      <AISection />
      <CategoryCards />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/blog"       element={<BlogPage />} />
        <Route path="/tutorials"  element={<TutorialsPage />} />
        <Route path="/tutorials/:slug/part/:partNum" element={<TutorialPage />} />
        <Route path="/tutorials/:slug"               element={<TutorialPage />} />
        <Route path="/cartoons"                   element={<CartoonBlogPage />} />
        <Route path="/cartoons/neon-spirit/ep/:epNum/ch/:chNum" element={<ProtectedRoute><NeonSpiritEpPage /></ProtectedRoute>} />
        <Route path="/cartoons/neon-spirit/ep/:epNum"          element={<ProtectedRoute><NeonSpiritEpPage /></ProtectedRoute>} />
        <Route path="/about"                      element={<AboutPage />} />
      </Routes>
      <Footer />
      <ChatBot />
    </div>
  )
}

export default App