import './Footer.css'
import logo from '../assets/LOGO.png'

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-top">

          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="BublikStudios" className="footer-logo-img" />
              <span className="footer-logo-name">Bublik<span>Studios</span></span>
            </div>
            <p className="footer-tagline">
              AI · MLOps · Inner Compass.<br />
              A blog where technology meets self-discovery.
            </p>
            <div className="footer-socials">
              <a href="#" className="fsoc fsoc-pink">𝕏 Twitter</a>
              <a href="#" className="fsoc fsoc-cyan">GitHub</a>
              <a href="#" className="fsoc fsoc-purple">LinkedIn</a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="fcol-head">Navigate</h4>
            <ul className="fcol-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#shop">Shop</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="fcol-head">Learn</h4>
            <ul className="fcol-links">
              <li><a href="#blog">🤖 MLOps / AI Tutorials</a></li>
              <li><a href="#blog">AI Roadmap</a></li>
              <li><a href="#blog">Local AI with Ollama</a></li>
              <li><a href="#blog">Math for ML</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="fcol-head">Read</h4>
            <ul className="fcol-links">
              <li><a href="#blog">🧭 Inner Compass Blog</a></li>
              <li><a href="#blog">Mindset &amp; Growth</a></li>
              <li><a href="#about">👤 About</a></li>
              <li><a href="#shop">Shop</a></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="fcopy">© 2026 BublikStudios. All rights reserved.</p>
          <p className="fcopy">Built with React &amp; Spring Boot 🚀</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
