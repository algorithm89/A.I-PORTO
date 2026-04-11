import './AISection.css'
import TriGrid3D from './TriGrid3D'

const TRACKS = {
  ai: [
    { num:'01', icon:'🧮', color:'cyan',   title:'Master the Math',  desc:'Linear Algebra, Statistics, Probability — start with Krista king on Udemy and actually enjoy it.' },
    { num:'02', icon:'🐍', color:'yellow', title:'Learn Python',      desc:'NumPy, Pandas, Matplotlib. No prior coding needed — you will be surprised how fast it clicks.' },
    { num:'03', icon:'🤖', color:'pink',   title:'First ML Model',    desc:'Predict house prices with scikit-learn. Real magic in 10 lines of code.' },
  ],
  animation: [
    { num:'01', icon:'✏️', color:'yellow', title:'Learn to Draw',  desc:'Start with basic shapes. Andrew Loomis and Vilppu are your best friends here.' },
    { num:'02', icon:'🖥️', color:'cyan',   title:'Digital Tools',  desc:'Krita (free) or Procreate for drawing. Blender for 3D. Start free, grow later.' },
  ],
}

function AISection() {
  return (
    <section className="learn-section" id="ai">
      {/* 3D triangle grid — blue teal, pops out on mouse hover */}
      <TriGrid3D size={52} color="0,220,255" radius={3.2} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* AI */}
        <div className="sec-header">
          <span className="sec-tag sec-tag-cyan">🤖 Learn AI</span>
          <h2 className="sec-title">AI is <span className="gradient-text">not scary.</span></h2>
          <p className="sec-sub">A real, honest roadmap — no gatekeeping. Just the steps that actually work.</p>
        </div>
        <div className="learn-grid" style={{marginBottom:'5rem'}}>
          {TRACKS.ai.map(s => <LearnCard key={s.num} {...s} />)}
        </div>

        {/* Animation */}
        <div className="sec-header">
          <span className="sec-tag sec-tag-yellow">🎬 Learn Animation</span>
          <h2 className="sec-title">Animation <span className="gradient-text-yellow">101</span></h2>
          <p className="sec-sub">How to go from doodles to scenes that actually move people.</p>
        </div>
        <div className="learn-grid-center">
          {TRACKS.animation.map(s => <LearnCard key={s.num} {...s} />)}
        </div>

      </div>
    </section>
  )
}

function LearnCard({ num, icon, color, title, desc }) {
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%'
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%'
    e.currentTarget.style.setProperty('--mx', x)
    e.currentTarget.style.setProperty('--my', y)
  }

  return (
    <div className={`lc lc-${color}`} onMouseMove={handleMouseMove}>
      <div className="lc-top">
        <span className="lc-num">{num}</span>
        <span className="lc-icon">{icon}</span>
      </div>
      <h3 className="lc-title">{title}</h3>
      <p className="lc-desc">{desc}</p>
      <a href="#" className="lc-link">Read more →</a>
    </div>
  )
}

export default AISection
