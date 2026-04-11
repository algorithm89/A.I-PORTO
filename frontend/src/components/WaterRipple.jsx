import { useRef, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
   Stamp a circular "drop" disturbance into the height buffer
   ───────────────────────────────────────────────────────────── */
function splash(buf, W, H, cx, cy, radius, strength) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        const nx = cx + dx, ny = cy + dy
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          buf[ny * W + nx] = strength
        }
      }
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   WaterRipple
   Renders src into a <canvas> and runs a classic 2-buffer
   finite-difference water wave simulation that distorts the
   image pixels in real time.
   ───────────────────────────────────────────────────────────── */
export default function WaterRipple({ src, alt, className }) {
  const canvasRef    = useRef(null)
  const stateRef     = useRef(null)
  const rafRef       = useRef(null)
  const dropTimerRef = useRef(null)
  const hoverRef     = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let alive = true

    const img = new Image()

    img.onload = () => {
      if (!alive) return

      /* ── canvas / simulation resolution ── */
      const MAX_W = 540
      const scale = Math.min(1, MAX_W / img.naturalWidth)
      const W = Math.round(img.naturalWidth  * scale)
      const H = Math.round(img.naturalHeight * scale)
      canvas.width  = W
      canvas.height = H

      /* ── bake source pixels into an offscreen canvas ── */
      const off    = document.createElement('canvas')
      off.width    = W
      off.height   = H
      const offCtx = off.getContext('2d')
      offCtx.drawImage(img, 0, 0, W, H)
      const imageData  = offCtx.getImageData(0, 0, W, H)       // read-only source
      const outputData = offCtx.createImageData(W, H)           // reusable output

      /* ── two alternating height-field buffers ── */
      let bufA = new Float32Array(W * H)   // "current"  frame
      let bufB = new Float32Array(W * H)   // "previous" frame

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, W, H)       // initial static render

      stateRef.current = { W, H, bufA, bufB, imageData, outputData, ctx, img }

      /* ══════════════ ANIMATION TICK ══════════════ */
      const tick = () => {
        if (!alive) return
        const s = stateRef.current
        const { W, H } = s
        const curr   = s.bufA          // current heights  (will be source)
        const prev   = s.bufB          // previous heights (will be overwritten)
        const srcPx  = s.imageData.data
        const dstPx  = s.outputData.data
        let   active = false

        /* ── wave propagation (discrete 2-D wave equation) ── */
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const i   = y * W + x
            const val = (curr[i - 1] + curr[i + 1] + curr[i - W] + curr[i + W]) * 0.5 - prev[i]
            prev[i]   = val * 0.974            // gentle damping
            if (Math.abs(prev[i]) > 0.22) active = true
          }
        }

        /* swap: "prev" now holds new heights → promote to current */
        s.bufA = prev
        s.bufB = curr

        /* ── pixel displacement render ── */
        dstPx.set(srcPx)                 // seed output with source (handles border)
        const h = s.bufA
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const i  = y * W + x
            const xo = Math.round(h[i - 1] - h[i + 1])
            const yo = Math.round(h[i - W] - h[i + W])
            const sx = Math.max(0, Math.min(W - 1, x + xo))
            const sy = Math.max(0, Math.min(H - 1, y + yo))
            const si = (sy * W + sx) * 4
            const di = i  * 4
            dstPx[di]     = srcPx[si]
            dstPx[di + 1] = srcPx[si + 1]
            dstPx[di + 2] = srcPx[si + 2]
            dstPx[di + 3] = srcPx[si + 3]
          }
        }
        s.ctx.putImageData(s.outputData, 0, 0)

        /* keep running while there is activity or the user is hovering */
        if (active || hoverRef.current) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          /* restore clean image when everything has settled */
          s.ctx.drawImage(s.img, 0, 0, W, H)
          rafRef.current = null
        }
      }

      /* ══════════════ HELPERS ══════════════ */
      const startAnim = () => {
        if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
      }

      const dropAt = (cx, cy, r = 6, str = 512) => {
        const s = stateRef.current
        if (s) splash(s.bufA, s.W, s.H, cx, cy, r, str)
      }

      /* ══════════════ EVENT LISTENERS ══════════════ */
      const onEnter = () => {
        hoverRef.current = true
        startAnim()
        /* immediate first splash in the upper-centre of image */
        dropAt((W / 2) | 0, (H * 0.3) | 0, 7, 500)
        /* periodic random drops while hovering */
        dropTimerRef.current = setInterval(() => {
          const s = stateRef.current
          if (!s) return
          dropAt(
            Math.floor(Math.random() * s.W),
            Math.floor(Math.random() * s.H),
            6, 512
          )
        }, 550)
      }

      const onLeave = () => {
        hoverRef.current = false
        clearInterval(dropTimerRef.current)
        dropTimerRef.current = null
      }

      const onMove = (e) => {
        if (Math.random() > 0.09) return      // ~9 % of moves → small ripple
        const r  = canvas.getBoundingClientRect()
        const cx = ((e.clientX - r.left) * (W / r.width))  | 0
        const cy = ((e.clientY - r.top)  * (H / r.height)) | 0
        dropAt(cx, cy, 2, 110)
      }

      /* ── touch ── */
      const onTouch = (e) => {
        const t = e.touches[0]; if (!t) return
        const r  = canvas.getBoundingClientRect()
        const cx = ((t.clientX - r.left) * (W / r.width))  | 0
        const cy = ((t.clientY - r.top)  * (H / r.height)) | 0
        dropAt(cx, cy, 6, 512)
        hoverRef.current = true
        startAnim()
      }
      const onTouchEnd = () => { hoverRef.current = false }

      canvas.addEventListener('mouseenter',  onEnter)
      canvas.addEventListener('mouseleave',  onLeave)
      canvas.addEventListener('mousemove',   onMove)
      canvas.addEventListener('touchstart',  onTouch,    { passive: true })
      canvas.addEventListener('touchmove',   onTouch,    { passive: true })
      canvas.addEventListener('touchend',    onTouchEnd, { passive: true })

      stateRef.current._cleanup = () => {
        canvas.removeEventListener('mouseenter', onEnter)
        canvas.removeEventListener('mouseleave', onLeave)
        canvas.removeEventListener('mousemove',  onMove)
        canvas.removeEventListener('touchstart', onTouch)
        canvas.removeEventListener('touchmove',  onTouch)
        canvas.removeEventListener('touchend',   onTouchEnd)
      }
    }

    img.src = src

    /* ── cleanup on unmount ── */
    return () => {
      alive = false
      if (rafRef.current)      cancelAnimationFrame(rafRef.current)
      if (dropTimerRef.current) clearInterval(dropTimerRef.current)
      stateRef.current?._cleanup?.()
      stateRef.current  = null
      rafRef.current    = null
      dropTimerRef.current = null
    }
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label={alt}
      style={{ cursor: 'crosshair', display: 'block' }}
    />
  )
}

