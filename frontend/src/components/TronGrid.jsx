
import { useEffect, useRef } from 'react'
import './TronGrid.css'

function TronGrid({ cellSize = 50, color = '0,229,255', radius = 2.5 }) {
  const canvasRef = useRef(null)
  const mouse     = useRef({ x: -999, y: -999 })
  const cells     = useRef([])
  const raf       = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    let W, H

    function resize() {
      W = canvas.width  = parent.offsetWidth
      H = canvas.height = parent.offsetHeight
      cells.current = []
      for (let y = 0; y < H; y += cellSize)
        for (let x = 0; x < W; x += cellSize)
          cells.current.push({ x, y, alpha: 0 })
    }

    function draw() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)
      const mx = mouse.current.x
      const my = mouse.current.y

      // base dim grid
      ctx.strokeStyle = `rgba(${color},0.07)`
      ctx.lineWidth   = 0.5
      ctx.shadowBlur  = 0
      for (let x = 0; x <= W; x += cellSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y <= H; y += cellSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // lit cells near mouse
      cells.current.forEach(c => {
        const cx     = c.x + cellSize / 2
        const cy     = c.y + cellSize / 2
        const dist   = Math.hypot(mx - cx, my - cy)
        const target = dist < cellSize * radius
          ? Math.max(0, 1 - dist / (cellSize * radius))
          : 0
        c.alpha += (target - c.alpha) * 0.15

        if (c.alpha > 0.01) {
          ctx.shadowColor = `rgba(${color},${c.alpha})`
          ctx.shadowBlur  = 14 * c.alpha
          ctx.strokeStyle = `rgba(${color},${c.alpha * 0.95})`
          ctx.lineWidth   = 1.5
          ctx.strokeRect(c.x + 1, c.y + 1, cellSize - 2, cellSize - 2)
          ctx.fillStyle   = `rgba(${color},${c.alpha * 0.07})`
          ctx.fillRect   (c.x + 1, c.y + 1, cellSize - 2, cellSize - 2)
          ctx.shadowBlur  = 0
        }
      })

      raf.current = requestAnimationFrame(draw)
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onLeave() { mouse.current = { x: -999, y: -999 } }

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
  }, [cellSize, color, radius])

  return <canvas ref={canvasRef} className="tron-canvas" />
}

export default TronGrid


