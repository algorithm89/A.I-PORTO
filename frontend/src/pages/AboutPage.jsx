import { Link } from 'react-router-dom'
import TronGrid from '../components/TronGrid'
import './AboutPage.css'
import pic4  from '../assets/PIC4.png'

export default function AboutPage() {
  return (
    <div className="about-page">
      <TronGrid cellSize={55} color="255,45,120" radius={2.5} />

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <div className="about-hero-text">
            <span className="sec-tag sec-tag-pink">✨ About Me</span>
            <h1 className="about-hero-title">
              Hi, I'm <span className="gradient-text">Bublik</span>
            </h1>
            <p className="about-hero-sub">
              A curious mind at the intersection of <span className="hl-cyan">technology</span>,{' '}
              <span className="hl-yellow">creativity</span> and{' '}
              <span className="hl-pink">self-discovery</span>.
            </p>
          </div>
          <div className="about-hero-img-wrap">
            <img src={pic4} alt="About BublikStudios" className="about-hero-img" />
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="about-story container">
        <div className="about-story-card neon-border-pink">
          <h2 className="about-story-title">The Story Behind <span className="gradient-text">BublikStudios</span></h2>
          <div className="about-story-body">
            <p>
              BublikStudios started as a simple idea — what if there was a place where AI tutorials,
              cartoon obsessions, and personal growth could live side by side? A bit unusual? Yes.
              But that's kind of the point.
            </p>
            <p>
              I come from a background in math and technology. I've always been fascinated by how
              machines learn, but equally by how humans learn — the discipline, the failures,
              the breakthroughs that happen when you stick with something long enough.
            </p>
            <p>
              Cartoons shaped how I see the world. Shows like Avatar, X-Men 97, and Ninja Scroll
              taught me about storytelling, courage, and the power of visual art. I believe
              animation is one of the most underrated art forms.
            </p>
            <p>
              This site is where all of that comes together — honest tutorials, heartfelt writing,
              and an AI chatbot that genuinely cares about your wellbeing. Welcome.
            </p>
          </div>
        </div>
      </section>

      {/* ── What I Do ── */}
      <section className="about-skills container">
        <h2 className="about-section-title">What I <span className="gradient-text">Do</span></h2>
        <div className="about-skills-grid">
          <div className="about-skill-card ask-cyan">
            <span className="ask-icon">🤖</span>
            <h3>AI & Machine Learning</h3>
            <p>Building ML pipelines, training models, deploying with MLOps. From linear algebra to production.</p>
          </div>
          <div className="about-skill-card ask-pink">
            <span className="ask-icon">💻</span>
            <h3>Full-Stack Development</h3>
            <p>Spring Boot, React, Docker, Nginx, CI/CD — the full stack from backend to deployment.</p>
          </div>
          <div className="about-skill-card ask-yellow">
            <span className="ask-icon">🎨</span>
            <h3>Animation & Storytelling</h3>
            <p>Deep love for animated storytelling. Reviews, analysis, and the art behind the cartoons.</p>
          </div>
          <div className="about-skill-card ask-purple">
            <span className="ask-icon">✍️</span>
            <h3>Writing & Reflection</h3>
            <p>Inner compass writing about mindset, growth, discipline, and navigating life with curiosity.</p>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="about-tech container">
        <h2 className="about-section-title">This Site's <span className="gradient-text">Tech Stack</span></h2>
        <div className="about-tech-grid">
          {[
            { label: 'Frontend', items: 'React 19, Vite 7, React Router', color: 'cyan' },
            { label: 'Backend', items: 'Spring Boot 3.5, Java 21, Spring Security', color: 'pink' },
            { label: 'Database', items: 'MySQL 8, JPA / Hibernate', color: 'yellow' },
            { label: 'AI', items: 'Ollama (Llama 3.2), SSE Streaming', color: 'purple' },
            { label: 'Auth', items: 'JWT, BCrypt, Mailtrap Email', color: 'cyan' },
            { label: 'Infra', items: 'Docker, Nginx, HashiCorp Vault, GitHub Actions', color: 'pink' },
          ].map(t => (
            <div key={t.label} className={`about-tech-item at-${t.color}`}>
              <span className="at-label">{t.label}</span>
              <span className="at-items">{t.items}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta container">
        <div className="about-cta-inner neon-border-cyan">
          <div>
            <p className="about-cta-label">Want to see what I've been writing about?</p>
            <h3 className="about-cta-title">Explore the <span className="gradient-text">Blog</span> or <span className="gradient-text-yellow">Tutorials</span></h3>
          </div>
          <div className="about-cta-btns">
            <Link to="/blog" className="btn-neon-pink">Blog →</Link>
            <Link to="/tutorials" className="btn-neon-cyan">Tutorials →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}


