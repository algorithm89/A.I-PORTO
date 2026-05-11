import { useRef, useEffect, useState } from 'react'
import './HexGrid.css'

function HexGrid({ color = '255,230,0', radius = 3, alwaysVisible = false }) {
  const ref = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (isMobile || alwaysVisible) return
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const maxDist = 28 * radius
      const dist = Math.min(1, Math.max(0, 1 - Math.hypot(mx - rect.width / 2, my - rect.height / 2) / maxDist))
      el.style.setProperty('--mx', mx + 'px')
      el.style.setProperty('--my', my + 'px')
      el.style.setProperty('--glow', dist)
    }
    const onLeave = () => {
      el.style.setProperty('--mx', '-9999px')
      el.style.setProperty('--my', '-9999px')
      el.style.setProperty('--glow', '0')
    }

    el.style.setProperty('--color', color)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [isMobile, alwaysVisible, color, radius])

  if (isMobile) return <div className="hex-grid hex-grid-static" />
  if (alwaysVisible) return <div className="hex-grid hex-grid-static" />
  return <div ref={ref} className="hex-grid" />
}

export default HexGrid
