import { useEffect, useRef } from 'react'
import './TriangleGrid.css'

/**
 * Equilateral triangle tessellation — ▲▽▲▽ rows
 * Every triangle points either UP (▲) or DOWN (▽).
 * Lights up neon green on mouse proximity.
 */
function TriangleGrid({ size = 60, color = '0,255,128', radius = 2.8 }) {
  const canvasRef = useRef(null)
  const mouse     = useRef({ x: -9999, y: -9999 })
  const tris      = useRef([])
  const raf       = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    let W, H

    function buildTris() {
      tris.current = []
      // Equilateral triangle: base = size, height = size * sqrt(3)/2
      const h = size * Math.sqrt(3) / 2
      const cols = Math.ceil(W / size) + 2
      const rows = Math.ceil(H / h)  + 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = c * size - size          // start left of canvas
          const y0 = r * h    - h             // start above canvas

          // UP triangle ▲  — apex top-centre, base at bottom
          //   top point:    x0 + size/2,  y0
          //   bottom-left:  x0,           y0 + h
          //   bottom-right: x0 + size,    y0 + h
          const ux = x0 + size / 2
          const uy = y0
          tris.current.push({
            pts: [[ux, uy], [x0, y0 + h], [x0 + size, y0 + h]],
            cx:  ux,
            cy:  y0 + h * 0.6,
            alpha: 0,
          })

          // DOWN triangle ▽ — apex bottom-centre, base at top
          //   top-left:      x0,           y0
          //   top-right:     x0 + size,    y0
          //   bottom-point:  x0 + size/2,  y0 + h
          tris.current.push({
            pts: [[x0, y0], [x0 + size, y0], [ux, y0 + h]],
            cx:  ux,
            cy:  y0 + h * 0.4,
            alpha: 0,
          })
        }
      }
    }

    function resize() {
      W = canvas.width  = parent.offsetWidth
      H = canvas.height = parent.offsetHeight
      buildTris()
    }

    function draw() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)
      const mx = mouse.current.x
      const my = mouse.current.y

      tris.current.forEach(t => {
        const dist   = Math.hypot(mx - t.cx, my - t.cy)
        const target = dist < size * radius
          ? Math.max(0, 1 - dist / (size * radius))
          : 0
        t.alpha += (target - t.alpha) * 0.14

        const [[x0,y0],[x1,y1],[x2,y2]] = t.pts
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.closePath()

        if (t.alpha > 0.01) {
          ctx.fillStyle   = `rgba(${color},${t.alpha * 0.12})`
          ctx.fill()
          ctx.strokeStyle = `rgba(${color},${t.alpha * 0.95})`
          ctx.lineWidth   = 1.2
          ctx.shadowColor = `rgba(${color},${t.alpha})`
          ctx.shadowBlur  = 20 * t.alpha
          ctx.stroke()
          ctx.shadowBlur  = 0
        } else {
          ctx.strokeStyle = `rgba(${color},0.055)`
          ctx.lineWidth   = 0.5
          ctx.stroke()
        }
      })

      raf.current = requestAnimationFrame(draw)
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onLeave() { mouse.current = { x: -9999, y: -9999 } }

    resize()
    window.addEventListener('resize', resize)
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    draw()

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [size, color, radius])

  return <canvas ref={canvasRef} className="triangle-canvas" />
}

export default TriangleGrid
