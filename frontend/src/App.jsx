import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header           from './components/Header'
import Hero             from './components/Hero'
import StoriesSection   from './components/StoriesSection'
import CartoonBelt      from './components/CartoonBelt'
import AISection        from './components/AISection'
import CategoryCards    from './components/CategoryCards'
import Footer           from './components/Footer'
import ChatBot          from './components/ChatBot'
import BlogPage         from './pages/BlogPage'
import TutorialsPage    from './pages/TutorialsPage'
import CartoonBlogPage  from './pages/CartoonBlogPage'
import AboutPage        from './pages/AboutPage'

function HomePage() {
  return (
    <>
      <Hero />
      <StoriesSection />
      <CartoonBelt />
      <AISection />
      <CategoryCards />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/blog"       element={<BlogPage />} />
        <Route path="/tutorials"  element={<TutorialsPage />} />
        <Route path="/cartoons"   element={<CartoonBlogPage />} />
        <Route path="/about"      element={<AboutPage />} />
      </Routes>
      <Footer />
      <ChatBot />
    </div>
  )
}

export default App

