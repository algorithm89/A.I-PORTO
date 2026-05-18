import { useEffect, useRef } from 'react'

// Canvas honeycomb grid. Lights up hexes near the pointer.
// - Desktop: reacts to mouse hover.
// - Mobile: reacts to touch (lights up under your finger as you drag).
// - The animation loop pauses when nothing is lit and the pointer is away,
//   so it costs zero CPU while idle.
function HexTronGrid({ cellSize = 50, color = '0,229,255', radius = 2.5 }) {
  const canvasRef = useRef(null)
  const mouse     = useRef({ x: -9999, y: -9999 })
  const hexes     = useRef([])
  const raf       = useRef(null)
  const running   = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    let W, H

    // pointy-top hex vertices (radius = 1)
    const HEX = []
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 30)
      HEX.push({ x: Math.cos(a), y: Math.sin(a) })
    }

    const stepX = cellSize * Math.sqrt(3)
    const stepY = cellSize * 1.5

    function resize() {
      W = canvas.width  = parent.offsetWidth
      H = canvas.height = parent.offsetHeight
      hexes.current = []
      const cols = Math.ceil(W / stepX) + 2
      const rows = Math.ceil(H / stepY) + 2
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          hexes.current.push({
            cx: col * stepX + (row % 2) * (stepX / 2) - cellSize,
            cy: row * stepY - cellSize,
            alpha: 0,
          })
        }
      }
    }

    function draw() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)
      const mx = mouse.current.x
      const my = mouse.current.y
      let active = false

      hexes.current.forEach(h => {
        const dist   = Math.hypot(mx - h.cx, my - h.cy)
        const target = dist < cellSize * radius
          ? Math.max(0, 1 - dist / (cellSize * radius))
          : 0
        h.alpha += (target - h.alpha) * 0.15

        if (h.alpha > 0.01) {
          active = true
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const vx = h.cx + cellSize * HEX[i].x
            const vy = h.cy + cellSize * HEX[i].y
            i === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy)
          }
          ctx.closePath()

          ctx.shadowColor = `rgba(${color},${h.alpha})`
          ctx.shadowBlur  = 14 * h.alpha
          ctx.strokeStyle = `rgba(${color},${h.alpha * 0.95})`
          ctx.lineWidth   = 1.5
          ctx.stroke()
          ctx.fillStyle   = `rgba(${color},${h.alpha * 0.07})`
          ctx.fill()
          ctx.shadowBlur  = 0
        }
      })

      // Idle-pause: keep looping only while something is still lit/fading.
      if (active) {
        raf.current = requestAnimationFrame(draw)
      } else {
        running.current = false
      }
    }

    function kick() {
      if (!running.current) {
        running.current = true
        raf.current = requestAnimationFrame(draw)
      }
    }

    function pointFrom(e) {
      const rect = canvas.getBoundingClientRect()
      const src = e.touches && e.touches[0] ? e.touches[0] : e
      return { x: src.clientX - rect.left, y: src.clientY - rect.top }
    }

    function onMove(e) {
      mouse.current = pointFrom(e)
      kick()
    }
    function onLeave() {
      mouse.current = { x: -9999, y: -9999 }
      kick()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    parent.addEventListener('touchstart', onMove, { passive: true })
    parent.addEventListener('touchmove', onMove, { passive: true })
    parent.addEventListener('touchend', onLeave)

    return () => {
      cancelAnimationFrame(raf.current)
      running.current = false
      ro.disconnect()
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
      parent.removeEventListener('touchstart', onMove)
      parent.removeEventListener('touchmove', onMove)
      parent.removeEventListener('touchend', onLeave)
    }
  }, [cellSize, color, radius])

  return <canvas ref={canvasRef} style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
    display: 'block',
  }} />
}

export default HexTronGrid
