import { useEffect, useRef } from 'react'
import './HexGrid.css'

function HexGrid({ color = '255,230,0', radius = 3 }) {
  const canvasRef = useRef(null)
  const mouse     = useRef({ x: -9999, y: -9999 })
  const hexes     = useRef([])
  const raf       = useRef(null)
  const SIZE      = 28  // hex radius

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    let W, H

    // Pointy-top hexagon path
    function hexPath(ctx, cx, cy, r) {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30)
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    function buildGrid() {
      W = canvas.width  = parent.offsetWidth
      H = canvas.height = parent.offsetHeight
      hexes.current = []

      const w = Math.sqrt(3) * SIZE
      const h = 2 * SIZE
      const cols = Math.ceil(W / w) + 2
      const rows = Math.ceil(H / (h * 0.75)) + 2

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const offset = row % 2 === 0 ? 0 : w / 2
          const cx = col * w + offset
          const cy = row * h * 0.75
          hexes.current.push({ cx, cy, alpha: 0 })
        }
      }
    }

    function draw() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)
      const mx = mouse.current.x
      const my = mouse.current.y

      hexes.current.forEach(h => {
        const dist   = Math.hypot(mx - h.cx, my - h.cy)
        const target = dist < SIZE * radius
          ? Math.max(0, 1 - dist / (SIZE * radius))
          : 0
        h.alpha += (target - h.alpha) * 0.12

        // base hex outline always visible (dim)
        ctx.strokeStyle = `rgba(${color},0.07)`
        ctx.lineWidth   = 0.8
        ctx.shadowBlur  = 0
        hexPath(ctx, h.cx, h.cy, SIZE - 1)
        ctx.stroke()

        // glow on hover
        if (h.alpha > 0.01) {
          // fill
          ctx.fillStyle = `rgba(${color},${h.alpha * 0.08})`
          hexPath(ctx, h.cx, h.cy, SIZE - 1)
          ctx.fill()

          // bright stroke
          ctx.strokeStyle = `rgba(${color},${h.alpha * 0.9})`
          ctx.lineWidth   = 1.5
          ctx.shadowColor = `rgba(${color},${h.alpha})`
          ctx.shadowBlur  = 12 * h.alpha
          hexPath(ctx, h.cx, h.cy, SIZE - 1)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      })

      raf.current = requestAnimationFrame(draw)
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onLeave() { mouse.current = { x: -9999, y: -9999 } }

    buildGrid()
    window.addEventListener('resize', buildGrid)
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    draw()

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', buildGrid)
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [color, radius])

  return <canvas ref={canvasRef} className="hex-canvas" />
}

export default HexGrid

