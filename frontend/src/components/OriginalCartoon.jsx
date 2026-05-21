import './OriginalCartoon.css'
import TronGrid from './TronGrid'

function OriginalCartoon() {
  return (
    <section className="original-cartoon" id="our-cartoon">
      <TronGrid cellSize={55} color="255,45,120" radius={3} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="sec-header">
          <span className="sec-tag sec-tag-pink">✨ Original Creation</span>
          <h2 className="sec-title">
            Made by <span className="gradient-text">BublikStudios</span>
          </h2>
          <p className="sec-sub">
            An original animated short — written, drawn and produced by our small studio.
          </p>
        </div>

        <div className="oc-video-frame">
          <div className="oc-video-wrap">
            <iframe
              className="oc-video"
              src="https://www.youtube-nocookie.com/embed/qDnMOMinVik?rel=0"
              title="BublikStudios original cartoon"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default OriginalCartoon
