import { useRef, useEffect } from 'react'
import './IcyEffect.css'

export default function IcyEffect({ src, alt, className }) {
  const wrapRef   = useRef(null)
  const imgRef    = useRef(null)
  const snowRef   = useRef(null)
  const rafRef    = useRef(null)
  const flakes    = useRef([])
  const hoverRef  = useRef(false)

  /* ── build snowflake pool ── */
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
    const wrap  = wrapRef.current
    const img   = imgRef.current
    const snow  = snowRef.current
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

        /* ── blue-icy tint overlay (stronger on hover) ── */
        ctx.fillStyle = hoverRef.current
          ? 'rgba(160, 220, 255, 0.10)'
          : 'rgba(180, 230, 255, 0.04)'
        ctx.fillRect(0, 0, W, H)

        /* ── draw + update each flake ── */
        flakes.current.forEach(f => {
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(220, 240, 255, ${f.opacity})`
          ctx.shadowBlur  = 4
          ctx.shadowColor = 'rgba(160, 220, 255, 0.8)'
          ctx.fill()
          ctx.shadowBlur  = 0

          /* move */
          const speed = hoverRef.current ? f.speed * 2.2 : f.speed
          f.y += speed
          f.x += f.drift

          /* wrap around */
          if (f.y > H + 4) { f.y = -4;  f.x = Math.random() * W }
          if (f.x > W + 4) { f.x = -4 }
          if (f.x < -4)    { f.x = W + 4 }
        })

        /* ── frost vignette on edges ── */
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

    const onEnter = () => { hoverRef.current = true  }
    const onLeave = () => { hoverRef.current = false }
    wrap.addEventListener('mouseenter', onEnter)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      alive = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      img.removeEventListener('load', onLoad)
      wrap.removeEventListener('mouseenter', onEnter)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [src])

  return (
    <div ref={wrapRef} className={`icy-wrap ${className || ''}`}>
      <img ref={imgRef} src={src} alt={alt} className="icy-img" />
      <canvas ref={snowRef} className="icy-canvas" aria-hidden="true" />
    </div>
  )
}

