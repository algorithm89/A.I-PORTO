import { useEffect, useRef } from 'react'
import './TriGrid3D.css'

function TriGrid3D({ size = 36, color = '0,220,255', radius = 2.5 }) {
  const canvasRef = useRef(null)
  const mouse     = useRef({ x: -9999, y: -9999 })
  const dots      = useRef([])
  const raf       = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    let W, H

    const BASE_R = size * 0.36  // circle radius

    function buildDots() {
      dots.current = []
      const cols = Math.ceil(W / size) + 3
      const rows = Math.ceil(H / (size * 0.87)) + 3
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const offsetX = (r % 2) * (size * 0.5)
          dots.current.push({
            cx: c * size + offsetX - size,
            cy: r * size * 0.87 - size,
            alpha: 0,
          })
        }
      }
    }

    function resize() {
      W = canvas.width  = parent.offsetWidth
      H = canvas.height = parent.offsetHeight
      buildDots()
    }

    function draw() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)
      const mx = mouse.current.x
      const my = mouse.current.y

      dots.current.forEach(d => {
        const dist   = Math.hypot(mx - d.cx, my - d.cy)
        const target = dist < size * radius
          ? Math.max(0, 1 - dist / (size * radius))
          : 0
        d.alpha += (target - d.alpha) * 0.15

        if (d.alpha > 0.01) {
          // glowing filled circle
          ctx.beginPath()
          ctx.arc(d.cx, d.cy, BASE_R * (1 + d.alpha * 0.35), 0, Math.PI * 2)
          ctx.fillStyle   = `rgba(${color},${d.alpha * 0.18})`
          ctx.fill()
          ctx.strokeStyle = `rgba(${color},${d.alpha * 0.95})`
          ctx.lineWidth   = 0.8 + d.alpha * 1.4
          ctx.shadowColor = `rgba(${color},${d.alpha})`
          ctx.shadowBlur  = 10 + d.alpha * 22
          ctx.stroke()
          ctx.shadowBlur  = 0
        } else {
          // dim dot at rest
          ctx.beginPath()
          ctx.arc(d.cx, d.cy, BASE_R * 0.42, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${color},0.09)`
          ctx.lineWidth   = 0.6
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

  return <canvas ref={canvasRef} className="trigrid3d-canvas" />
}

export default TriGrid3D
