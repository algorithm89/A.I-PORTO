import { Link } from 'react-router-dom'
import HexGrid from '../components/HexGrid'
import pic10 from '../assets/PIC10.png'
import './NeonSpiritEp1Page.css'

export default function NeonSpiritEp1Page() {
  return (
    <div className="ns-page">
      <HexGrid color="255,230,0" radius={3} />

      <div className="ns-back container">
        <Link to="/cartoons" className="ns-back-link">← Back to Cartoon Blog</Link>
      </div>

      {/* ── Cover image ── */}
      <div className="ns-cover container">
        <img src={pic10} alt="Neon Spirit" className="ns-cover-img" />
      </div>

      {/* ── Episode header ── */}
      <header className="ns-header container">
        <span className="sec-tag sec-tag-yellow">🎨 Neon Spirit</span>
        <h1 className="ns-title">
          Episode I:<br />
          <span className="gradient-text-yellow">A Blast from a Poorly Indexed Past</span>
        </h1>
        <div className="ns-meta">
          <span>📅 April 20, 2026</span>
          <span className="ns-dot">·</span>
          <span>✍️ BublikStudios</span>
          <span className="ns-dot">·</span>
          <span>📖 Chapter 1</span>
        </div>
        <div className="ns-tags">
          <span className="ns-tag">#neon-spirit</span>
          <span className="ns-tag">#original</span>
          <span className="ns-tag">#episode-1</span>
        </div>
      </header>

      {/* ── Script body ── */}
      <main className="ns-body container">
        <h2 className="ns-chapter-title">Chapter 1</h2>

        {/* ✏️ PASTE YOUR SCRIPT HERE */}
        <div className="ns-script-placeholder">
          <span>✍️</span>
          <p>Script coming soon — stay tuned.</p>
        </div>
        {/* ✏️ END SCRIPT */}
      </main>

      <div className="ns-footer-nav container">
        <Link to="/cartoons" className="ns-back-link">← All Stories</Link>
      </div>
    </div>
  )
}
