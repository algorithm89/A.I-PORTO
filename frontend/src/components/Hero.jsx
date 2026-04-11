import './Hero.css'
import TronGrid    from './TronGrid'
import WaterRipple from './WaterRipple'
import logo  from '../assets/LOGO.png'
import pic25 from '../assets/PIC25.png'

function Hero() {
  return (
    <section className="hero" id="home">
      <TronGrid />
      {/* Neon glow blobs */}
      <div className="hero-glow hero-glow-pink" />
      <div className="hero-glow hero-glow-cyan" />

      <div className="container hero-inner">

        {/* ── LEFT ── */}
        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>AI · Tutorials · Blog ✨</span>
          </div>

          <div className="hero-title-row">
            <img src={logo} alt="BublikStudios logo" className="hero-logo-left" />
            <h1 className="hero-title">
              <span className="hero-line1">Learn.</span>
              <span className="hero-line2 gradient-text">Grow. Create.</span>
            </h1>
          </div>

          <p className="hero-subtitle">
            Welcome to <strong>BublikStudios</strong> — where <span className="hl-pink">AI tutorials</span>,{' '}
            <span className="hl-cyan">MLOps guides</span> and{' '}
            <span className="hl-yellow">inner compass writing</span> come together.
            <br /><br />
            A blog for curious minds who want to learn technology and explore themselves.
          </p>

          <div className="hero-tags">
            <span className="tag tag-cyan">🤖 MLOps / AI</span>
            <span className="tag tag-pink">🧭 Inner Compass</span>
            <span className="tag tag-yellow">📚 Tutorials</span>
            <span className="tag tag-purple">📖 Blog</span>
          </div>

          <div className="hero-actions">
            <a href="#categories" className="btn-neon-pink">Explore Blog</a>
            <a href="#about"      className="btn-neon-cyan">About Me</a>
          </div>
        </div>

        {/* ── RIGHT — PIC25 with water ripple ── */}
        <div className="hero-right">
          <div className="hero-img-wrap">
            <WaterRipple src={pic25} alt="BublikStudios banner" className="hero-banner-canvas" />
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero
