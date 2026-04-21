import { useRef, useEffect } from 'react'
import './IcyEffect.css'

/* ── generate one jagged crack branch ── */
function makeCrack(x, y, angle, length, depth) {
  const points = [{ x, y }]
  let cx = x, cy = y, a = angle
  const steps = Math.floor(length / 8)
  for (let i = 0; i < steps; i++) {
    a += (Math.random() - 0.5) * 0.7   // slight jag each step
    cx += Math.cos(a) * 8
    cy += Math.sin(a) * 8
    points.push({ x: cx, y: cy })
    /* spawn a sub-branch occasionally */
    if (depth > 0 && Math.random() < 0.35) {
      points.push(...makeCrack(cx, cy, a + (Math.random() - 0.5) * 1.4, length * 0.5, depth - 1))
      /* return to main path */
      points.push({ x: cx, y: cy })
    }
  }
  return points
}

export default function IcyEffect({ src, alt, className }) {
  const wrapRef  = useRef(null)
  const imgRef   = useRef(null)
  const snowRef  = useRef(null)
  const rafRef   = useRef(null)
  const flakes   = useRef([])
  const cracks   = useRef([])   // active crack groups
  const hoverRef = useRef(false)

  function makeFlakes(W, H, count = 80) {
    return Array.from({ length: count }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       Math.random() * 2.2 + 0.6,
      speed:   Math.random() * 0.6 + 0.25,
      drift:   (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.55 + 0.25,
    }))
  }

  useEffect(() => {
    const wrap = wrapRef.current
    const img  = imgRef.current
    const snow = snowRef.current
    if (!wrap || !img || !snow) return

    let alive = true

    const onLoad = () => {
      if (!alive) return
      const W = wrap.offsetWidth  || img.offsetWidth
      const H = wrap.offsetHeight || img.offsetHeight
      snow.width  = W
      snow.height = H
      flakes.current = makeFlakes(W, H)

      const ctx = snow.getContext('2d')

      const tick = () => {
        if (!alive) return
        ctx.clearRect(0, 0, W, H)

        /* ── blue-icy tint overlay ── */
        ctx.fillStyle = hoverRef.current
          ? 'rgba(160,220,255,0.10)'
          : 'rgba(180,230,255,0.04)'
        ctx.fillRect(0, 0, W, H)

        /* ── snowflakes ── */
        flakes.current.forEach(f => {
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
          ctx.fillStyle   = `rgba(220,240,255,${f.opacity})`
          ctx.shadowBlur  = 4
          ctx.shadowColor = 'rgba(160,220,255,0.8)'
          ctx.fill()
          ctx.shadowBlur  = 0
          const speed = hoverRef.current ? f.speed * 2.2 : f.speed
          f.y += speed
          f.x += f.drift
          if (f.y > H + 4) { f.y = -4;  f.x = Math.random() * W }
          if (f.x > W + 4)   f.x = -4
          if (f.x < -4)      f.x = W + 4
        })

        /* ── ice cracks ── */
        cracks.current = cracks.current.filter(c => c.alpha > 0.01)
        cracks.current.forEach(c => {
          c.alpha -= 0.008   // fade out
          ctx.save()
          ctx.globalAlpha = c.alpha
          ctx.strokeStyle = 'rgba(200,235,255,1)'
          ctx.shadowBlur  = 6
          ctx.shadowColor = 'rgba(160,220,255,1)'
          c.branches.forEach(pts => {
            if (pts.length < 2) return
            ctx.beginPath()
            ctx.lineWidth = c.alpha > 0.5 ? 1.2 : 0.7
            ctx.moveTo(pts[0].x, pts[0].y)
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
            ctx.stroke()
          })
          ctx.restore()
        })

        /* ── frost vignette ── */
        const vg = ctx.createRadialGradient(W/2, H/2, H*0.28, W/2, H/2, H*0.82)
        vg.addColorStop(0, 'rgba(0,0,0,0)')
        vg.addColorStop(1, 'rgba(160,220,255,0.18)')
        ctx.fillStyle = vg
        ctx.fillRect(0, 0, W, H)

        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    if (img.complete) onLoad()
    else img.addEventListener('load', onLoad)

    /* ── click → ice crack ── */
    const onClick = (e) => {
      const snow = snowRef.current
      if (!snow) return
      const rect = snow.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const numBranches = 6 + Math.floor(Math.random() * 5)
      const branches = Array.from({ length: numBranches }, (_, i) => {
        const angle = (i / numBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
        return makeCrack(cx, cy, angle, 55 + Math.random() * 45, 2)
      })
      cracks.current.push({ branches, alpha: 1.0 })
    }

    const onEnter = () => { hoverRef.current = true  }
    const onLeave = () => { hoverRef.current = false }
    wrap.addEventListener('mouseenter', onEnter)
    wrap.addEventListener('mouseleave', onLeave)
    wrap.addEventListener('click',      onClick)

    return () => {
      alive = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      img.removeEventListener('load', onLoad)
      wrap.removeEventListener('mouseenter', onEnter)
      wrap.removeEventListener('mouseleave', onLeave)
      wrap.removeEventListener('click',      onClick)
    }
  }, [src])

  return (
    <div ref={wrapRef} className={`icy-wrap ${className || ''}`}>
      <img ref={imgRef} src={src} alt={alt} className="icy-img" />
      <canvas ref={snowRef} className="icy-canvas" aria-hidden="true" />
    </div>
  )
}
