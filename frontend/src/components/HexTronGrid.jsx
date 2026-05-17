import { useEffect, useRef, useState } from 'react'

function HexTronGrid({ cellSize = 50, color = '0,229,255', radius = 2.5 }) {
  const canvasRef = useRef(null)
  const mouse     = useRef({ x: -999, y: -999 })
  const hexes     = useRef([])
  const raf       = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (isMobile) return  // don't start canvas on mobile
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

      // lit hexes near mouse — only visible on hover
      hexes.current.forEach(h => {
        const dist   = Math.hypot(mx - h.cx, my - h.cy)
        const target = dist < cellSize * radius
          ? Math.max(0, 1 - dist / (cellSize * radius))
          : 0
        h.alpha += (target - h.alpha) * 0.15

        if (h.alpha > 0.01) {
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

      raf.current = requestAnimationFrame(draw)
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onLeave() { mouse.current = { x: -999, y: -999 } }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    draw()

    return () => {
      cancelAnimationFrame(raf.current)
      ro.disconnect()
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [isMobile, cellSize, color, radius])

  if (isMobile) return null
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
